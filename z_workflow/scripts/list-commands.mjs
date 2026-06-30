#!/usr/bin/env node
/**
 * Print all maintenance commands for the Web-pages workflow.
 *
 * Usage: node z_workflow/scripts/list-commands.mjs
 */

import path from 'path';
import { ROOT } from './workflow-paths.mjs';

const rel = (p) => path.relative(ROOT, p).replace(/\\/g, '/');

const commands = [
  {
    id: 'commands',
    cmd: 'node z_workflow/scripts/list-commands.mjs',
    npm: 'npm run commands',
    desc: 'Show this command list (maintenance cheat sheet).'
  },
  {
    id: 'audit',
    cmd: 'node z_workflow/scripts/site-audit.mjs',
    npm: 'npm run audit',
    alias: 'SITE_AUDIT',
    desc: 'Full rescan of reference site folders → regenerates site-catalog.json, section-index.json, team-dna.json, audit-report.txt. Run after adding or revamping any reference page.'
  },
  {
    id: 'match',
    cmd: 'node z_workflow/scripts/match-sites.mjs --brief "your keywords here"',
    npm: 'npm run match -- --brief "sales dashboard examples"',
    desc: 'Score a brief string against site-catalog.json and print top matches (Phase 0-C validation).'
  },
  {
    id: 'match-validate',
    cmd: 'node z_workflow/scripts/match-sites.mjs --validate',
    npm: 'npm run match:validate',
    desc: 'Run the built-in validation set; expects ≥90% primary-match accuracy.'
  },
  {
    id: 'promote-state',
    cmd: 'node z_workflow/scripts/promote-output.mjs --from-state',
    npm: 'npm run promote -- --from-state',
    desc: 'Promote approved page from output/ → Reference-Site/agent-reference/ + SITE_AUDIT (after dev polish).'
  },
  {
    id: 'promote-slug',
    cmd: 'node z_workflow/scripts/promote-output.mjs --slug <page-slug>',
    npm: 'npm run promote -- --slug cloud-analytics-tools',
    desc: 'Promote output/<slug>/ → agent-reference/ (requires approval unless --force).'
  },
  {
    id: 'promote-dry',
    cmd: 'node z_workflow/scripts/promote-output.mjs --slug <page-slug> --dry-run',
    npm: 'npm run promote -- --slug cloud-analytics-tools --dry-run',
    desc: 'Preview promote targets and files without copying or auditing.'
  },
  {
    id: 'promote-force',
    cmd: 'node z_workflow/scripts/promote-output.mjs --slug <page-slug> --force',
    npm: 'npm run promote -- --slug my-page --force',
    desc: 'Overwrite an existing reference folder; skips approval check.'
  },
  {
    id: 'promote-no-audit',
    cmd: 'node z_workflow/scripts/promote-output.mjs --slug <page-slug> --no-audit',
    npm: 'npm run promote -- --slug my-page --no-audit',
    desc: 'Copy to agent-reference only; skip SITE_AUDIT (run audit separately later).'
  },
  {
    id: 'organize',
    cmd: 'node z_workflow/scripts/organize-reference-sites.mjs',
    npm: 'npm run organize',
    desc: 'Move stray reference folders from project root into Reference-Site/ and fix ../source/ paths.'
  }
];

const workflow = [
  '1. Writer brief → agent builds output/{slug}/',
  '2. Review in browser → APPROVE (structure + copy — no audit yet)',
  '3. Dev polish: nav, footer, final assets in output/{slug}/',
  '4. npm run promote -- --from-state  →  Reference-Site/agent-reference/ + SITE_AUDIT',
  '5. Page appears in site-catalog.json for future matching'
];

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  WEB-PAGES — MAINTENANCE COMMANDS');
console.log(`  Project root: ${ROOT}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('WORKFLOW (after APPROVE)\n');
for (const step of workflow) {
  console.log(`  ${step}`);
}

console.log('\nCOMMANDS\n');
for (const c of commands) {
  console.log(`  ${c.id.toUpperCase()}`);
  console.log(`    ${c.desc}`);
  console.log(`    ${c.cmd}`);
  if (c.npm) console.log(`    ${c.npm}`);
  if (c.alias) console.log(`    Alias: ${c.alias}`);
  console.log('');
}

console.log('FOLDER LAYOUT\n');
const folders = [
  ['Legacy reference sites', 'Reference-Site/', 'BI-Marketing/, AgenticAI/, …'],
  ['Agent-polished pages', 'Reference-Site/agent-reference/', 'Promoted from output/ after dev polish'],
  ['Agent output (handoff scaffolds)', 'output/{page-slug}/', 'Not scanned until promoted'],
  ['Workflow intelligence', 'z_workflow/', 'catalog, indexes, briefs, state'],
  ['Shared team CSS', 'source/', 'zohocustom.css, product.css — link only'],
  ['Promotion registry', 'z_workflow/promoted/', 'One JSON per promoted slug'],
  ['Writer briefs', 'z_workflow/briefs/', 'Raw copy per build']
];
for (const [label, loc, note] of folders) {
  console.log(`  ${label}`);
  console.log(`    ${loc}`);
  console.log(`    ${note}\n`);
}

console.log('See z_workflow/MAINTENANCE.md for full documentation.\n');
