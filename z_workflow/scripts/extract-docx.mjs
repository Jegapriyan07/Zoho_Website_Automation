#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';

const docx = process.argv[2];
const out = process.argv[3];
if (!docx || !out) {
  console.error('Usage: node extract-docx.mjs <input.docx> <output.txt>');
  process.exit(1);
}

const temp = path.join(os.tmpdir(), 'docx-extract-' + Date.now());
const unzipped = path.join(temp, 'unzipped');
fs.mkdirSync(unzipped, { recursive: true });
const zipPath = path.join(temp, 'doc.zip');
fs.copyFileSync(docx, zipPath);

try {
  execSync(`tar -xf "${zipPath}" -C "${unzipped}"`, { stdio: 'pipe' });
} catch {
  execSync(`powershell.exe -NoProfile -Command "Expand-Archive -Path '${zipPath.replace(/'/g, "''")}' -DestinationPath '${unzipped.replace(/'/g, "''")}' -Force"`, {
    stdio: 'pipe',
  });
}

const xml = fs.readFileSync(path.join(unzipped, 'word/document.xml'), 'utf8');
const paras = xml
  .split(/<w:p[ >]/)
  .slice(1)
  .map((p) => [...p.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]).join(''))
  .filter((l) => l.trim());

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, paras.join('\n'), 'utf8');
console.log(`Wrote ${paras.length} paragraphs (${fs.statSync(out).size} bytes) → ${out}`);
