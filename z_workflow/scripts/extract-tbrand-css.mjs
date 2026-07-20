#!/usr/bin/env node
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../gold-snippets');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (r) => {
      let d = '';
      r.on('data', (c) => (d += c));
      r.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

const css = await get('https://www.zohowebstatic.com/sites/zweb/css/translation/analytics/23064.css');
const needles = ['trust-icon', 'ae-icon', 'tbrand', 'zwc-trust'];
const re = /@media[^{]+\{(?:[^{}]|\{[^{}]*\})*\}|[^{}]+\{[^{}]*\}/g;
const out = [];
let m;
while ((m = re.exec(css))) {
  if (needles.some((n) => m[0].includes(n))) out.push(m[0].trim());
}
const file = path.join(outDir, '_tbrand-rules.css');
fs.writeFileSync(file, out.join('\n\n'));
console.log('COUNT', out.length, 'bytes', fs.statSync(file).size);
console.log(out.slice(0, 15).join('\n---\n'));
