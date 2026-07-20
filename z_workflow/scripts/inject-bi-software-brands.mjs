#!/usr/bin/env node
/**
 * Inject official Trusted Brands marquee into bi-software-3 after hero.
 * Adds Writer heading into the inject brand-wrapper.
 */
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { injectTrustedBrandsFile } from '../../web-tool/trusted-brands/inject.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const htmlPath = path.join(root, 'output/bi-software-3/index.html');

const result = injectTrustedBrandsFile(htmlPath);
console.log(JSON.stringify({ ok: result.ok, placement: result.placement, verify: result.verify }, null, 2));

if (!result.ok) process.exit(1);

let html = fs.readFileSync(htmlPath, 'utf8');

const heading = `
    <h2 class="za-brands-heading">Trusted BI Platform by great brands</h2>
`;

if (!html.includes('za-brands-heading')) {
  html = html.replace(
    /(<div class="brand-wrapper">\s*)/,
    `$1${heading}`
  );
}

const styleExtra = `<style>
.za-brandsCounts .za-brands-heading {
  text-align: center;
  font-size: 25px;
  font-family: var(--zf-primary-semibold, inherit);
  margin: 0 0 28px;
  padding: 10px 20px 0;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1.5px;
  color: #000;
}
.za-brandsCounts {
  position: relative;
  z-index: 2;
  margin-top: -40px;
}
</style>
`;

if (!html.includes('.za-brandsCounts .za-brands-heading')) {
  html = html.replace(
    '<!-- ═══════════════════════════════════════════════════════════════\n     END TRUSTED BRANDS SECTION',
    `${styleExtra}\n<!-- ═══════════════════════════════════════════════════════════════\n     END TRUSTED BRANDS SECTION`
  );
}

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Injected + Writer heading OK');
console.log('Has za-brandsCounts:', html.includes('za-brandsCounts'));
console.log('Has tb-track:', html.includes('tb-track'));
console.log('Has heading:', html.includes('Trusted BI Platform by great brands'));
console.log('Logo count:', (html.match(/class="ae-icon"/g) || []).length);
