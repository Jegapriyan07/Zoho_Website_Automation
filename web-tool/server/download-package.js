import path from 'node:path';
import fs from 'node:fs';
import { config } from './config.js';

const PAGE_FILES = ['index.html', 'style.css', 'script.js'];
const SOURCE_FILES = ['zohocustom.css', 'product.css'];

/**
 * Root-relative /sites/... paths resolve on zoho.com and on the tool host's
 * preview (when proxied), but break under Live Server (127.0.0.1:5500).
 * Point them at the public Zoho CDN origin so offline ZIP previews match.
 */
export function rewriteSitesUrls(css) {
  return String(css)
    .replace(/url\(\s*(['"]?)\/sites\//gi, 'url($1https://www.zoho.com/sites/')
    .replace(/@import\s+url\(\s*(['"]?)\/sites\//gi, '@import url($1https://www.zoho.com/sites/');
}

/** Make HTML self-contained for ZIP / Live Server (./source/...). */
export function rewriteHtmlForDownload(html) {
  return String(html)
    .replace(/(href\s*=\s*["'])\.\.\/\.\.\/source\//gi, '$1source/')
    .replace(/(href\s*=\s*["'])\.\.\/source\//gi, '$1source/')
    .replace(/(href\s*=\s*["'])\/source\//gi, '$1source/');
}

/**
 * Build ZIP entries so Live Server matches in-tool preview:
 *   index.html (rewritten) + style.css + script.js
 *   + source/zohocustom.css + source/product.css (sites URLs rewritten)
 */
export function buildDownloadEntries(outputDir) {
  const entries = [];
  const sourceRoot = path.join(config.pipelineRoot, 'source');

  for (const name of PAGE_FILES) {
    const full = path.join(outputDir, name);
    if (!fs.existsSync(full)) continue;
    let data = fs.readFileSync(full);
    if (name === 'index.html') {
      data = Buffer.from(rewriteHtmlForDownload(data.toString('utf8')), 'utf8');
    }
    entries.push({ name, data });
  }

  for (const name of SOURCE_FILES) {
    const full = path.join(sourceRoot, name);
    if (!fs.existsSync(full)) continue;
    const css = rewriteSitesUrls(fs.readFileSync(full, 'utf8'));
    entries.push({ name: `source/${name}`, data: Buffer.from(css, 'utf8') });
  }

  if (entries.some((e) => e.name === 'index.html') && entries.some((e) => e.name.startsWith('source/'))) {
    const readme = [
      'Zoho Web Page Builder — download package',
      '',
      'Open index.html with Live Server (or any static server).',
      'This ZIP includes team base CSS under source/ so fonts and layout',
      'match the in-tool preview (zohocustom.css + product.css).',
      '',
      'Files:',
      '  index.html',
      '  style.css',
      '  script.js',
      '  source/zohocustom.css',
      '  source/product.css',
      ''
    ].join('\n');
    entries.push({ name: 'README.txt', data: Buffer.from(readme, 'utf8') });
  }

  return entries;
}
