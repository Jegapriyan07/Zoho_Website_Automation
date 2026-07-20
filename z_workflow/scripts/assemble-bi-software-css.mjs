#!/usr/bin/env node
/**
 * Assemble output/bi-software-3/style.css from gold snippets.
 * Preserves BI hero asset paths under prezohoweb (do NOT stub to bare domain).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const goldPath = path.join(root, 'z_workflow/gold-snippets/bi-software-landing-layout.css');
const tbrandPath = path.join(root, 'z_workflow/gold-snippets/bi-software-tbrand.css');
const isolationPath = path.join(root, 'z_workflow/gold-snippets/bi-software-trusted-brands-isolation.css');
const outPath = path.join(root, 'output/bi-software-3/style.css');

const HERO_ASSETS = [
  'banner-before.png',
  'banner-beforegraph.svg',
  'banner-arrow.svg'
];

function patchUrls(c) {
  // Production host → prezohoweb, keep path (hero + other assets)
  let out = c
    .replace(/url\(\/\/www\.zohowebstatic\.com(\/sites\/zweb\/[^)]+)\)/g, "url('https://prezohoweb.zoho.com$1') /* TODO */")
    .replace(/url\(https:\/\/www\.zohowebstatic\.com(\/sites\/zweb\/[^)]+)\)/g, "url('https://prezohoweb.zoho.com$1') /* TODO */")
    .replace(/var\(--primaryfont-bold\)/g, 'var(--zf-primary-bold)')
    .replace(/var\(--primaryfont-semibold\)/g, 'var(--zf-primary-semibold)')
    .replace(/var\(Zoho_Puvi_Medium\)/g, 'var(--zf-primary-semibold)')
    .replace(/var\(--zf-secondary-bold\)/g, 'var(--zf-primary-bold)');

  // Bare domain stubs that lost their path — restore known hero assets
  for (const name of HERO_ASSETS) {
    const fixed = `url('https://prezohoweb.zoho.com/sites/zweb/images/analytics/business-intelligence/${name}')`;
    // Only rewrite if this file mentions the asset name nearby… handled via gold source of truth
  }
  return out;
}

const preamble = `/* BI Software LP — live 23064 + sibling 27747
 * Gold: output/bi-software-3 · Reference-Site/agent-reference/bi-software-3
 * Writer content only in HTML. ★ Trusted Brands = Web Page Builder inject.
 */
:root {
  --color-brand-cta: #e42527;
  --primary-btn-color: #e42527;
  --color-primary: #d83d3e;
  --color-secondary: #299f40;
  --zf-secondary-bold: var(--zf-primary-bold);
}

.page-container {
  font-size: 17px;
  line-height: 1.5;
  color: #000;
}

.page-container p,
.page-container li {
  font-size: 17px;
  line-height: 1.6;
}

.page-container h2 {
  font-family: var(--zf-primary-bold);
  margin: 0 0 15px;
}

.page-container h3 {
  font-family: var(--zf-primary-bold);
  margin: 0 0 15px;
}

.page-container .cta-btn.act-btn {
  display: inline-block;
  visibility: visible;
  opacity: 1;
  background: var(--primary-btn-color);
  color: #fff;
  border-radius: 5px;
}

.page-container button:focus,
.page-container button:focus-visible,
.page-container a.act-btn:focus,
.page-container a.act-btn:focus-visible,
.page-container a.cta-btn:focus,
.page-container a.cta-btn:focus-visible,
.page-container .z-accordianBox h4:focus,
.page-container .z-accordianBox h4:focus-visible,
.page-container .tabs a:focus,
.page-container .tabs a:focus-visible {
  outline: none;
  box-shadow: none;
}

/* Missing grid placements from live 23064 */
.item1 { grid-area: header; }
.item6 { left: 140px; }
.item2 { grid-area: menu; left: -60px; }
.item3 { grid-area: main; left: -78px; }
.item4 { grid-area: right; left: -30px; }
.item5 { grid-area: footer; left: -48px; }

.zwc-banner-section .grid-container .zwc-stats {
  bottom: -50px;
}
.zwc-banner-section .grid-container img {
  opacity: 0;
}

.faq-section .z-accordianBox h4.active + ul,
.faq-section .z-accordianBox ul.is-open {
  display: block;
}

/* Testimony — sibling zwc-feedback layout (compact shell when no quote) */
.zwc-testimonials .zwc-feedback a {
  color: #f4955b;
  font-family: var(--zf-primary-semibold);
  font-size: 20px;
}
.zwc-testimonials .zwc-feedback h3 {
  font-size: 30px;
  line-height: 1.5;
  font-family: var(--zf-primary-light, var(--zf-primary-regular));
  margin-bottom: 20px;
  color: #fff;
}
.zwc-testimonials .zwc-feedback p {
  font-size: 23px;
  color: #f4955b;
  font-family: var(--zf-primary-bold);
  margin: 0 0 10px;
}

.zwc-testimonials .zwc-feedback img {
  width: 263px;
  height: 391px;
  max-height: 391px;
  flex: 0 0 263px;
  object-fit: cover;
  border-radius: 20px;
}

.zwc-testimonials .zwc-feedback-note {
  font-size: 17px !important;
  color: #8e796c !important;
  font-family: var(--zf-primary-regular) !important;
  margin: 0 0 20px !important;
}

/* ── Hero: more top space when product nav is absent (local preview) ── */
.zwc-banner-section {
  padding-top: 100px !important;
}
.zwc-banner-section .banner-cont h1 {
  margin-top: 0;
  margin-bottom: 20px;
}

/* Stats bounce: start off-screen; .bottom-animated slides them up */
.zwc-banner-section .grid-container .zwc-stats {
  bottom: -50px;
  transition: bottom 0.55s cubic-bezier(0.22, 1.2, 0.36, 1);
}
.zwc-banner-section .bottom-animated .zwc-stats {
  bottom: 0;
}
.zwc-banner-section .bottom-animated .zwc-stats.item1 { transition-delay: 0.05s; }
.zwc-banner-section .bottom-animated .zwc-stats.item2 { transition-delay: 0.2s; }
.zwc-banner-section .bottom-animated .zwc-stats.item3 { transition-delay: 0.35s; }
.zwc-banner-section .bottom-animated .zwc-stats.item4 { transition-delay: 0.45s; }
.zwc-banner-section .bottom-animated .zwc-stats.item5 { transition-delay: 0.55s; }
.zwc-banner-section .bottom-animated .zwc-stats.item6 { transition-delay: 0.67s; }

.zwc-banner-section .grid-container img.banner-arrow {
  opacity: 0;
  transition: opacity 0.25s ease 0.75s;
}
.zwc-banner-section .bottom-animated .grid-container img.banner-arrow {
  opacity: 1;
}

/* Top tools: breathing room under testimony */
.tab-sticky .tabsection {
  padding-top: 60px !important;
}
.tab-sticky .tabsection > h2 {
  margin-bottom: 20px;
  padding-top: 20px;
}

`;

let gold = patchUrls(fs.readFileSync(goldPath, 'utf8'));
let tbrand = patchUrls(fs.readFileSync(tbrandPath, 'utf8'));
const isolation = fs.readFileSync(isolationPath, 'utf8');

// Ensure hero ::before assets are never bare-domain stubs
const HERO_FIXES = {
  "url('https://prezohoweb.zoho.com/') /* TODO */;background-size:80px":
    "url('https://prezohoweb.zoho.com/sites/zweb/images/analytics/business-intelligence/banner-before.png');background-repeat:no-repeat;background-size:80px",
  "url('https://prezohoweb.zoho.com/') /* TODO */;background-size:100px":
    "url('https://prezohoweb.zoho.com/sites/zweb/images/analytics/business-intelligence/banner-beforegraph.svg');background-repeat:no-repeat;background-size:100px"
};
for (const [from, to] of Object.entries(HERO_FIXES)) {
  gold = gold.split(from).join(to);
}

fs.writeFileSync(
  outPath,
  preamble + '\n' + gold + '\n\n/* ── Live tbrand (optional; SKIP when inject ON) ── */\n' + tbrand + '\n\n' + isolation
);
console.log('Wrote', outPath, fs.statSync(outPath).size);
