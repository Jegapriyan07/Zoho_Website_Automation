#!/usr/bin/env node
/**
 * Extract used-section CSS from live 23064 + 27747 into gold snippet.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const css23064 = fs.readFileSync(path.join(root, 'gold-snippets/_tmp-23064.css'), 'utf8');
const css27747 = fs.readFileSync(path.join(root, 'gold-snippets/_tmp-27747.css'), 'utf8');

function extractRules(css, needles) {
  const out = [];
  const re = /@media[^{]+\{(?:[^{}]|\{[^{}]*\})*\}|[^{}]+\{[^{}]*\}/g;
  let m;
  while ((m = re.exec(css))) {
    const block = m[0];
    if (needles.some((n) => block.toLowerCase().includes(n.toLowerCase()))) {
      out.push(block.trim());
    }
  }
  return out;
}

const needles23064 = [
  'zwc-banner',
  'banner-cont',
  'banner-imgcont',
  'banner-section',
  'grid-container',
  'zwc-stats',
  'trust-section',
  'trust-block',
  'trust-sec',
  'tbrand',
  'trusted-icon',
  'zwc-trust',
  'zwc-learn',
  'learn-cont',
  'zwc-feature',
  'feature-cont',
  'faq-section',
  'z-accordian',
  'act-btn',
  'cta-btn',
  'bottom-animated',
  'middle-animated',
  'top-animated',
  '@keyframes',
];

const needles27747 = [
  'tab-sticky',
  'tabsection',
  'left-tab',
  'right-content',
  'cont-sec',
  'zwc-testimonials',
  'zwc-feedback',
  '.tabs',
  'tabs li',
  'tabs a',
  'tabs.fixed',
  '#tabs',
];

const part1 = extractRules(css23064, needles23064);
const part2 = extractRules(css27747, needles27747);
const kf = css23064.match(/@keyframes[^{]+\{(?:[^{}]|\{[^{}]*\})*\}/g) || [];

const header = `/* Gold: live BI software LP — 23064.css + 27747.css (tab-sticky / testimonials)
 * Primary: https://www.zoho.com/analytics/business-intelligence-bi-software.html
 * Sibling: https://www.zoho.com/analytics/business-analytics-software.html
 * Copy into output style.css; swap production image URLs → https://prezohoweb.zoho.com/ + TODO.
 */

`;

const all = header + [...new Set([...kf, ...part1, ...part2])].join('\n\n');
const outPath = path.join(root, 'gold-snippets/bi-software-landing-layout.css');
fs.writeFileSync(outPath, all);
console.log('Wrote', outPath, 'bytes', all.length, 'rules', part1.length + part2.length);
