#!/usr/bin/env node
/**
 * One-time (re-runnable) migration: move root reference folders → Reference-Site/
 * and fix ../source/ links to ../../source/.
 *
 * Usage: node z_workflow/scripts/organize-reference-sites.mjs
 *        node z_workflow/scripts/organize-reference-sites.mjs --dry-run
 */

import fs from 'fs';
import path from 'path';
import {
  ROOT,
  REFERENCE_DIR,
  REFERENCE_DIR_NAME,
  REFERENCE_CONTAINER_DIRS,
  ROOT_SKIP_DIRS,
  isScriptMain
} from './workflow-paths.mjs';

function listRootReferenceFolders() {
  return fs.readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !ROOT_SKIP_DIRS.has(d.name))
    .map((d) => d.name)
    .filter((name) => fs.existsSync(path.join(ROOT, name, 'index.html')))
    .sort();
}

function fixSourcePathsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  content = content
    .replace(/(href|src)="\.\.\/source\//g, '$1="../../source/')
    .replace(/(href|src)='\.\.\/source\//g, "$1='../../source/");
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

function fixPathsRecursive(dir) {
  let fixed = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      fixed += fixPathsRecursive(full);
    } else if (/\.(html?|css)$/i.test(entry.name)) {
      if (fixSourcePathsInFile(full)) fixed++;
    }
  }
  return fixed;
}

export function organizeReferenceSites(opts = { dryRun: false }) {
  const toMove = listRootReferenceFolders();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📁 ORGANIZE → Reference-Site/');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Target:  ${REFERENCE_DIR_NAME}/`);
  console.log(`  Folders: ${toMove.length}`);
  if (opts.dryRun) console.log('  Mode:    DRY RUN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (toMove.length === 0) {
    const inRef = fs.existsSync(REFERENCE_DIR)
      ? fs.readdirSync(REFERENCE_DIR, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .length
      : 0;
    console.log(`Nothing to move at project root. Reference-Site/ has ${inRef} folders.`);
    return { moved: [], fixedFiles: 0 };
  }

  if (opts.dryRun) {
    toMove.forEach((name) => console.log(`  would move: ${name} → ${REFERENCE_DIR_NAME}/${name}/`));
    return { moved: toMove, dryRun: true };
  }

  fs.mkdirSync(REFERENCE_DIR, { recursive: true });

  const moved = [];
  for (const name of toMove) {
    const src = path.join(ROOT, name);
    const dest = path.join(REFERENCE_DIR, name);
    if (fs.existsSync(dest)) {
      console.log(`  skip (exists): ${REFERENCE_DIR_NAME}/${name}/`);
      continue;
    }
    fs.renameSync(src, dest);
    moved.push(name);
    console.log(`  moved: ${name}`);
  }

  const fixedFiles = fixPathsRecursive(REFERENCE_DIR);
  console.log(`\n  Path fixes: ${fixedFiles} file(s) updated (../source/ → ../../source/)`);
  console.log('\n✅ Done. Run: npm run audit');

  return { moved, fixedFiles };
}

if (isScriptMain(import.meta.url)) {
  const dryRun = process.argv.includes('--dry-run');
  organizeReferenceSites({ dryRun });
}
