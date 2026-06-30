#!/usr/bin/env node
/**
 * PROMOTE — copy a polished output/ page into Reference-Site/agent-reference/ and re-audit.
 *
 * Run AFTER dev polish (nav, footer, final assets) — not at APPROVE time.
 *
 * Usage:
 *   node z_workflow/scripts/promote-output.mjs --from-state
 *   node z_workflow/scripts/promote-output.mjs --slug cloud-analytics-tools
 *   node z_workflow/scripts/promote-output.mjs --slug sales-dashboard-examples --dry-run
 */

import fs from 'fs';
import path from 'path';
import { runAudit } from './site-audit.mjs';
import {
  OUTPUT_DIR,
  REFERENCE_DIR_NAME,
  AGENT_REFERENCE_DIR,
  AGENT_REFERENCE_DIR_NAME,
  PROMOTED_REGISTRY,
  readState,
  writeState,
  slugToFolderName,
  getAgentReferenceTargetDir,
  getReferenceSiteEntries,
  isScriptMain
} from './workflow-paths.mjs';

const PAGE_FILES = ['index.html', 'style.css', 'script.js'];
const NAV_PLACEHOLDER = 'NAV — TEAM TEMPLATE';

function printHelp() {
  console.log(`
PROMOTE — polished output → Reference-Site/agent-reference/ + SITE_AUDIT

  Run AFTER dev adds nav, footer, and final assets (not at APPROVE).

Options:
  --from-state       Use page_slug from state.json (must be approved)
  --slug <name>      Output folder name under output/
  --folder <name>    Override target folder name in agent-reference/
  --dry-run          Show plan without copying
  --force            Overwrite existing folder; skip approval check
  --no-audit         Skip SITE_AUDIT after copy
  --help             Show this help

Examples:
  npm run promote -- --from-state
  npm run promote -- --slug cloud-analytics-tools --dry-run
`);
}

function parseArgs(argv) {
  const opts = {
    fromState: false,
    slug: '',
    folder: '',
    dryRun: false,
    force: false,
    noAudit: false,
    help: false
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--from-state') opts.fromState = true;
    else if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--force') opts.force = true;
    else if (arg === '--no-audit') opts.noAudit = true;
    else if (arg === '--help' || arg === '-h') opts.help = true;
    else if (arg === '--slug' && argv[i + 1]) opts.slug = argv[++i];
    else if (arg === '--folder' && argv[i + 1]) opts.folder = argv[++i];
    else if (!arg.startsWith('--') && !opts.slug) opts.slug = arg;
  }

  return opts;
}

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/** output/ and Reference-Site/* use ../../source/; agent-reference/* needs ../../../source/ */
function fixSourcePathsForAgentReference(html) {
  return html
    .replace(/href="\.\.\/\.\.\/source\//g, 'href="../../../source/')
    .replace(/src="\.\.\/\.\.\/source\//g, 'src="../../../source/')
    .replace(/href="\.\.\/source\//g, 'href="../../../source/')
    .replace(/src="\.\.\/source\//g, 'src="../../../source/');
}

function warnIfUnpolished(html) {
  if (html.includes(NAV_PLACEHOLDER)) {
    console.log('\n⚠️  Warning: nav placeholder still present — promote is best AFTER dev adds nav/footer.');
    console.log('   Continuing anyway. Re-run promote after polish to refresh the catalog.\n');
  }
}

function writePromotedRegistry(slug, folderName, referencePath) {
  fs.mkdirSync(PROMOTED_REGISTRY, { recursive: true });
  const record = {
    slug,
    reference_folder: folderName,
    reference_path: referencePath,
    reference_origin: 'agent',
    promoted_at: new Date().toISOString(),
    source_output: `output/${slug}/`
  };
  fs.writeFileSync(
    path.join(PROMOTED_REGISTRY, `${slug}.json`),
    JSON.stringify(record, null, 2) + '\n'
  );
  return record;
}

export function promoteOutput(opts) {
  const state = readState();
  let slug = opts.slug;

  if (opts.fromState) {
    if (!state?.page_slug) {
      throw new Error('state.json has no page_slug. Use --slug instead.');
    }
    slug = state.page_slug;
    if (!opts.force && state.phase_6?.approved !== true) {
      throw new Error(
        `Page "${slug}" is not approved in state.json. Approve the scaffold first, polish, then promote (or use --force).`
      );
    }
  }

  if (!slug) {
    throw new Error('Missing slug. Use --slug <name> or --from-state.');
  }

  const sourceDir = path.join(OUTPUT_DIR, slug);
  const sourceHtmlPath = path.join(sourceDir, 'index.html');
  if (!fs.existsSync(sourceHtmlPath)) {
    throw new Error(`No index.html at output/${slug}/`);
  }

  const folderName = opts.folder || slugToFolderName(slug);
  const targetDir = getAgentReferenceTargetDir(folderName);
  const referencePath = `${AGENT_REFERENCE_DIR_NAME}/${folderName}`;

  const existing = getReferenceSiteEntries().find((e) => e.site_name === folderName);
  if (existing && !opts.force) {
    throw new Error(
      `Reference "${existing.reference_path}" already exists. Use --force to overwrite or --folder for another name.`
    );
  }

  const plan = {
    slug,
    source: `output/${slug}/`,
    target: `${REFERENCE_DIR_NAME}/${referencePath}/`,
    files: PAGE_FILES.filter((f) => fs.existsSync(path.join(sourceDir, f)))
  };

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📤 PROMOTE → Reference-Site/agent-reference/');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Slug:     ${slug}`);
  console.log(`  From:     output/${slug}/`);
  console.log(`  To:       ${REFERENCE_DIR_NAME}/${referencePath}/`);
  console.log(`  Files:    ${plan.files.join(', ')}`);
  console.log(`  Audit:    ${opts.noAudit ? 'skipped' : 'yes (SITE_AUDIT → catalog)'}`);
  if (opts.dryRun) console.log('  Mode:     DRY RUN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const sourceHtml = fs.readFileSync(sourceHtmlPath, 'utf8');
  if (!opts.dryRun) warnIfUnpolished(sourceHtml);

  if (opts.dryRun) {
    return { ...plan, dryRun: true };
  }

  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
  fs.mkdirSync(targetDir, { recursive: true });

  for (const file of plan.files) {
    const srcFile = path.join(sourceDir, file);
    const destFile = path.join(targetDir, file);
    if (file === 'index.html') {
      const html = fixSourcePathsForAgentReference(fs.readFileSync(srcFile, 'utf8'));
      fs.writeFileSync(destFile, html);
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  }

  const assetsDir = path.join(sourceDir, 'assets');
  if (fs.existsSync(assetsDir)) {
    copyDirRecursive(assetsDir, path.join(targetDir, 'assets'));
  }

  const record = writePromotedRegistry(slug, folderName, referencePath);

  if (state && (state.page_slug === slug || opts.fromState)) {
    state.phase_6 = state.phase_6 || {};
    state.phase_6.promoted = true;
    state.phase_6.promoted_at = record.promoted_at;
    state.phase_6.reference_folder = folderName;
    state.phase_6.reference_path = referencePath;
    state.phase_6.reference_origin = 'agent';
    writeState(state);
  }

  let auditResult = null;
  if (!opts.noAudit) {
    console.log('\nRunning SITE_AUDIT (catalog will include agent-reference pages)...\n');
    auditResult = runAudit();
  }

  console.log('\n✅ PROMOTE COMPLETE');
  console.log(`   Path:     ${REFERENCE_DIR_NAME}/${referencePath}/`);
  console.log(`   Registry: z_workflow/promoted/${slug}.json`);
  if (auditResult) {
    console.log(`   Catalog:  ${auditResult.sites} sites indexed`);
  }

  return { ...plan, folderName, record, auditResult };
}

if (isScriptMain(import.meta.url)) {
  const opts = parseArgs(process.argv);
  if (opts.help) {
    printHelp();
    process.exit(0);
  }
  try {
    promoteOutput(opts);
  } catch (err) {
    console.error(`\n❌ ${err.message}`);
    process.exit(1);
  }
}
