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
    skipValidate: false,
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
    else if (a === '--archetype' && argv[i + 1]) args.archetype = argv[++i];
    else if (a === '--headed') args.headed = true;
    else if (a === '--skip-validate') args.skipValidate = true;
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

export async function extractFromWriterUrl(options) {
  const puppeteer = await loadPuppeteer();
  const userDataDir = options.userDataDir || defaultUserDataDir();

  const browser = await puppeteer.launch({
    headless: !options.headed,
    userDataDir,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });
    page.setDefaultNavigationTimeout(options.timeout);

    await page.goto(options.url, { waitUntil: 'networkidle2' });

    const url = page.url();
    if (/accounts\.zoho/i.test(url)) {
      throw new Error(
        'Redirected to Zoho Accounts — sign in first:\n' +
        `  node z_workflow/scripts/extract-writer.mjs --url "${options.url}" --headed --user-data-dir "${userDataDir}"`
      );
    }

    await page.waitForSelector('.zw-page, [class*="zw-page"]', { timeout: options.timeout })
      .catch(() => {
        throw new Error('Writer editor not found (.zw-page). Open the document URL in Comment or Edit mode.');
      });

    const result = await page.evaluate(WRITER_BROWSER_EXTRACT_FN);
    const quality = extractionQualityChecks(result);

    return { result, quality, userDataDir };
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
  --headed              Show browser (for first-time Zoho login)
  --user-data-dir PATH  Persistent Chrome profile (default: %LOCALAPPDATA%/zoho-writer-chrome-profile)
  --title TEXT          Prepended to brief file
  --archetype ID        Force validation archetype
  --skip-validate       Do not run validate-brief.mjs after extract
`);
    process.exit(1);
  }

  if (!fs.existsSync(BRIEFS_DIR)) fs.mkdirSync(BRIEFS_DIR, { recursive: true });

  const outPath = args.out
    ? (path.isAbsolute(args.out) ? args.out : path.join(ROOT, args.out))
    : path.join(BRIEFS_DIR, `${args.slug || 'writer-brief'}.txt`);

  console.log('Extracting Writer document...');
  console.log(`  URL: ${args.url}`);

  const { result, quality, userDataDir } = await extractFromWriterUrl(args);

  const briefContent = assembleBriefFile(result, args.title);
  fs.writeFileSync(outPath, briefContent, 'utf8');

  const sidecarPath = outPath.replace(/\.txt$/, '.extract.json');
  const archetypeGuess = resolveArchetype(briefContent, args.archetype);

  const sidecar = {
    extracted_at: new Date().toISOString(),
    source_url: args.url,
    output_file: path.relative(ROOT, outPath).replace(/\\/g, '/'),
    user_data_dir: userDataDir,
    page_count: result.pageCount,
    footer_chars: result.footerChars,
    merged_length: result.mergedLength,
    per_page_lengths: result.perPageLengths,
    quality,
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

  if (quality.warnings.length) {
    console.log('\nWarnings:');
    quality.warnings.forEach((w) => console.log(`  ! ${w}`));
  }

  if (quality.errors.length) {
    console.log('\nExtraction errors:');
    quality.errors.forEach((e) => console.log(`  ✗ ${e}`));
    console.log('\nRe-run with --headed after signing in, or check lazy-loaded pages.');
    process.exit(1);
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
