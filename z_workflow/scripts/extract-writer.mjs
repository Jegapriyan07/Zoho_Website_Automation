#!/usr/bin/env node
/**
 * Extract full text from a Zoho Writer URL via Puppeteer (headless Chrome).
 *
 * Prerequisite: npm install puppeteer  (or npm install in repo root)
 *
 * Usage:
 *   node z_workflow/scripts/extract-writer.mjs --url "https://writer.zoho.in/writer/open/..." --slug client-dashboard-software
 *   node z_workflow/scripts/extract-writer.mjs --url "..." --out z_workflow/briefs/foo.txt --title "My landing page"
 *   node z_workflow/scripts/extract-writer.mjs --url "..." --slug foo --user-data-dir "%LOCALAPPDATA%/zoho-writer-chrome"
 *
 * After extract, runs validate-brief.mjs automatically unless --skip-validate.
 * Requires Zoho login in the browser profile (first run: use --headed to sign in).
 */

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import {
  WRITER_BROWSER_EXTRACT_FN,
  assembleBriefFile,
  extractionQualityChecks,
  inventoryBrief
} from './writer-extract-core.mjs';
import { resolveArchetype } from './composite-utils.mjs';
import { ROOT, WORKFLOW, isScriptMain } from './workflow-paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BRIEFS_DIR = path.join(WORKFLOW, 'briefs');

function parseArgs(argv) {
  const args = {
    url: null,
    slug: null,
    out: null,
    title: '',
    userDataDir: null,
    headed: false,
    timeout: 120000,
    loginTimeout: 300000,
    skipValidate: false,
    allowPartial: false,
    archetype: null
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--url' && argv[i + 1]) args.url = argv[++i];
    else if (a === '--slug' && argv[i + 1]) args.slug = argv[++i];
    else if (a === '--out' && argv[i + 1]) args.out = argv[++i];
    else if (a === '--title' && argv[i + 1]) args.title = argv[++i];
    else if (a === '--user-data-dir' && argv[i + 1]) args.userDataDir = argv[++i];
    else if (a === '--timeout' && argv[i + 1]) args.timeout = parseInt(argv[++i], 10);
    else if (a === '--login-timeout' && argv[i + 1]) args.loginTimeout = parseInt(argv[++i], 10);
    else if (a === '--archetype' && argv[i + 1]) args.archetype = argv[++i];
    else if (a === '--headed') args.headed = true;
    else if (a === '--skip-validate') args.skipValidate = true;
    else if (a === '--allow-partial') args.allowPartial = true;
  }

  return args;
}

async function loadPuppeteer() {
  try {
    const mod = await import('puppeteer');
    return mod.default || mod;
  } catch {
    console.error('puppeteer is not installed.');
    console.error('Run: npm install puppeteer --save-dev');
    console.error('');
    console.error('Or use Chrome MCP with evaluate_script — see z_workflow/scripts/writer-extract-core.mjs');
    process.exit(1);
  }
}

function defaultUserDataDir() {
  const base = process.env.LOCALAPPDATA || process.env.HOME || ROOT;
  return path.join(base, 'zoho-writer-chrome-profile');
}

/** Marker written after a successful Writer load — used by the web tool orchestrator. */
export function zohoSessionMarkerPath(userDataDir) {
  return path.join(userDataDir, '.zoho-session-ready');
}

export function isZohoSessionReady(userDataDir) {
  return fs.existsSync(zohoSessionMarkerPath(userDataDir));
}

function buildLaunchOptions(puppeteer, { headed, userDataDir }) {
  return {
    headless: headed ? false : true,
    userDataDir,
    protocolTimeout: 360000,
    ignoreDefaultArgs: ['--enable-automation'],
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1400,900',
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage'
    ]
  };
}

async function preparePage(page) {
  await page.setViewport({ width: 1400, height: 900 });
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  );
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });
}

async function waitForWriterEditor(page, timeout) {
  await page.waitForSelector('.zw-page, [class*="zw-page"]', { timeout }).catch(() => {
    throw new Error('Writer editor not found (.zw-page). Open the document URL in Comment or Edit mode.');
  });
}

/** If Writer opened in view/comment mode, try switching to Edit before extraction. */
async function ensureWriterEditMode(page) {
  const clicked = await page.evaluate(() => {
    const labels = ['edit', 'comment', 'open in editor', 'open editor'];
    const candidates = [...document.querySelectorAll('button, a, [role="button"], [class*="btn"]')];
    for (const el of candidates) {
      const text = (el.innerText || el.getAttribute('aria-label') || '').trim().toLowerCase();
      if (!text) continue;
      if (labels.some((l) => text === l || text.includes(l))) {
        el.click();
        return text;
      }
    }
    return null;
  });
  if (clicked) {
    console.log(`Switched Writer to edit mode via "${clicked}" — waiting for editor…`);
    await new Promise((r) => setTimeout(r, 2500));
    await waitForWriterEditor(page, 60000);
  }
}

/**
 * Navigate to a Writer URL without waiting for networkidle — Zoho Writer keeps
 * background requests open and networkidle2 often never fires (120s timeout).
 */
async function navigateToWriter(page, url, timeout) {
  const navTimeout = Math.min(timeout, 90000);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: navTimeout });
  } catch (err) {
    if (!/timeout/i.test(String(err.message || err))) throw err;
    // Page may still have loaded enough — continue and let .zw-page wait decide.
    console.log('Navigation domcontentloaded timed out — waiting for Writer editor…');
  }
  await waitForWriterEditor(page, timeout);
}

async function handleZohoLoginWall(page, options, userDataDir) {
  if (!/accounts\.zoho/i.test(page.url())) return;

  if (!options.headed) {
    throw new Error(
      'Redirected to Zoho Accounts — sign in first:\n' +
      `  node z_workflow/scripts/extract-writer.mjs --url "${options.url}" --headed --user-data-dir "${userDataDir}"`
    );
  }

  const loginTimeout = options.loginTimeout || 300000;
  console.log('');
  console.log('================================================================');
  console.log(' Zoho sign-in required.');
  console.log(' A Chrome window is open — sign in to your Zoho account there.');
  console.log(` Waiting up to ${Math.round(loginTimeout / 1000)}s for sign-in to complete…`);
  console.log('================================================================');

  await page
    .waitForFunction(() => !/accounts\.zoho/i.test(location.href), {
      timeout: loginTimeout,
      polling: 1000
    })
    .catch(() => {
      throw new Error(
        'Timed out waiting for Zoho sign-in. Re-run and complete the login sooner ' +
        '(raise the window with --login-timeout <ms> if you need more time).'
      );
    });

  console.log('Signed in — loading the Writer document…');
  if (!/writer\.zoho/i.test(page.url())) {
    await navigateToWriter(page, options.url, options.timeout);
  } else {
    await waitForWriterEditor(page, options.timeout);
  }
}

async function runBrowserExtract(page, archetype = null) {
  const result = await page.evaluate(WRITER_BROWSER_EXTRACT_FN);
  const quality = extractionQualityChecks(result, archetype);
  return { result, quality };
}

function extractionNeedsRetry(quality, result) {
  if (quality.errors.length > 0) return true;
  if (result.footerChars && result.mergedLength && result.mergedLength / result.footerChars < 0.9) {
    return true;
  }
  return false;
}

export async function extractFromWriterUrl(options) {
  const puppeteer = await loadPuppeteer();
  const userDataDir = path.resolve(options.userDataDir || defaultUserDataDir());
  fs.mkdirSync(userDataDir, { recursive: true });

  const browser = await puppeteer.launch(buildLaunchOptions(puppeteer, { headed: options.headed, userDataDir }));

  try {
    const page = await browser.newPage();
    await preparePage(page);
    page.setDefaultNavigationTimeout(options.timeout);
    page.setDefaultTimeout(options.timeout);

    await navigateToWriter(page, options.url, options.timeout);
    await handleZohoLoginWall(page, options, userDataDir);
    if (!/writer\.zoho/i.test(page.url()) || !(await page.$('.zw-page, [class*="zw-page"]'))) {
      await navigateToWriter(page, options.url, options.timeout);
    }
    await ensureWriterEditMode(page);

    const archetypeHint = options.archetype
      ? resolveArchetype('', options.archetype)
      : null;

    let { result, quality } = await runBrowserExtract(page, archetypeHint);
    let archetypeGuess =
      archetypeHint || resolveArchetype(result.mergedText || result.briefText || '');
    quality = extractionQualityChecks(result, archetypeGuess);

    if (extractionNeedsRetry(quality, result)) {
      console.log(
        'First extraction pass incomplete — retrying with slower scroll + section-reference hydration…'
      );
      await new Promise((r) => setTimeout(r, 1200));
      ({ result } = await runBrowserExtract(page, archetypeGuess));
      archetypeGuess = archetypeHint || resolveArchetype(result.mergedText || result.briefText || '');
      quality = extractionQualityChecks(result, archetypeGuess);
    }

    // Persist session marker + give Chrome a moment to flush cookies to disk.
    fs.writeFileSync(
      zohoSessionMarkerPath(userDataDir),
      JSON.stringify({ signed_in_at: new Date().toISOString(), url: options.url }, null, 2) + '\n'
    );
    await new Promise((r) => setTimeout(r, 1500));

    return { result, quality, userDataDir, archetypeGuess };
  } finally {
    await browser.close();
  }
}

function runValidate(briefPath, archetype) {
  const script = path.join(__dirname, 'validate-brief.mjs');
  const validateArgs = ['--file', briefPath];
  if (archetype) validateArgs.push('--archetype', archetype);

  const proc = spawnSync(process.execPath, [script, ...validateArgs], {
    cwd: ROOT,
    encoding: 'utf8'
  });

  if (proc.stdout) process.stdout.write(proc.stdout);
  if (proc.stderr) process.stderr.write(proc.stderr);
  return proc.status ?? 1;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.url) {
    console.error(`Usage:
  node z_workflow/scripts/extract-writer.mjs --url <writer-url> --slug <page-slug>
  node z_workflow/scripts/extract-writer.mjs --url <writer-url> --out z_workflow/briefs/foo.txt

Options:
  --headed              Show browser and WAIT for first-time Zoho sign-in
  --login-timeout MS    How long --headed waits for sign-in (default: 300000)
  --user-data-dir PATH  Persistent Chrome profile (default: %LOCALAPPDATA%/zoho-writer-chrome-profile)
  --title TEXT          Prepended to brief file
  --archetype ID        Force validation archetype
  --skip-validate       Do not run validate-brief.mjs after extract
  --allow-partial     Continue even when quality checks report errors (web tool uses this)
`);
    process.exit(1);
  }

  if (!fs.existsSync(BRIEFS_DIR)) fs.mkdirSync(BRIEFS_DIR, { recursive: true });

  const outPath = args.out
    ? (path.isAbsolute(args.out) ? args.out : path.join(ROOT, args.out))
    : path.join(BRIEFS_DIR, `${args.slug || 'writer-brief'}.txt`);

  console.log('Extracting Writer document...');
  console.log(`  URL: ${args.url}`);

  const { result, quality, userDataDir, archetypeGuess: extractArchetype } = await extractFromWriterUrl(args);

  const briefContent = assembleBriefFile(result, args.title);
  fs.writeFileSync(outPath, briefContent, 'utf8');

  const sidecarPath = outPath.replace(/\.txt$/, '.extract.json');
  const archetypeGuess = extractArchetype || resolveArchetype(briefContent, args.archetype);
  const finalQuality = extractionQualityChecks(result, archetypeGuess);

  const sidecar = {
    extracted_at: new Date().toISOString(),
    source_url: args.url,
    output_file: path.relative(ROOT, outPath).replace(/\\/g, '/'),
    user_data_dir: userDataDir,
    writer_doc_title: result.writerDocTitle || null,
    page_count: result.pageCount,
    footer_chars: result.footerChars,
    merged_length: result.mergedLength,
    per_page_lengths: result.perPageLengths,
    quality: finalQuality,
    inventory: inventoryBrief(briefContent),
    archetype_guess: archetypeGuess ? archetypeGuess.id : null
  };

  fs.writeFileSync(sidecarPath, JSON.stringify(sidecar, null, 2) + '\n');

  console.log('');
  console.log('EXTRACTION COMPLETE');
  console.log('===================');
  console.log(`Brief:     ${outPath}`);
  console.log(`Sidecar:   ${sidecarPath}`);
  console.log(`Pages:     ${result.pageCount}`);
  console.log(`Chars:     ${result.mergedLength} (Writer footer: ${result.footerChars ?? 'unknown'})`);

  if (finalQuality.warnings.length) {
    console.log('\nWarnings:');
    finalQuality.warnings.forEach((w) => console.log(`  ! ${w}`));
  }

  if (finalQuality.errors.length) {
    console.log('\nExtraction errors:');
    finalQuality.errors.forEach((e) => console.log(`  ✗ ${e}`));
    if (args.allowPartial) {
      console.log('\nContinuing with partial brief (--allow-partial). validate:brief is the next gate.');
    } else {
      console.log('\nRe-run with --headed after signing in, or check lazy-loaded pages.');
      console.log('Or pass --allow-partial to continue when the brief file is usable.');
      process.exit(1);
    }
  }

  if (args.skipValidate) {
    console.log('\nSkipped validation (--skip-validate).');
    process.exit(0);
  }

  console.log('\nRunning validate-brief.mjs...');
  const code = runValidate(outPath, args.archetype || archetypeGuess?.id);
  process.exit(code);
}

if (isScriptMain(import.meta.url)) {
  main().catch((err) => {
    console.error(err.message || err);
    process.exit(1);
  });
}
