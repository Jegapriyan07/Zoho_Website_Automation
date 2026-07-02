#!/usr/bin/env node
import fs from 'fs';

const file = process.argv[2];
if (!file) process.exit(1);
let t = fs.readFileSync(file, 'utf8');
t = t
  .replace(/&amp;/g, '&')
  .replace(/&apos;/g, "'")
  .replace(/^Section reference\s*$/gm, '')
  .replace(/\n{3,}/g, '\n\n')
  .trim() + '\n';
fs.writeFileSync(file, t);
console.log(`Cleaned ${t.length} chars → ${file}`);
