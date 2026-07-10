// trusted-brands/inject.js
// Post-compose injection + verification (single source for all build paths).

import fs from 'node:fs';
import { buildMarqueeSnippet, stripTrustedBrandsBlock } from './marquee-template.js';
import { DEFAULT_BRAND_LIST } from './brands-data.js';

/**
 * Insert the trusted-brands snippet after the first </section> (hero close).
 * @param {string} html
 * @param {Array} [brands]
 * @returns {string}
 */
export function injectTrustedBrandsIntoHtml(html, brands = DEFAULT_BRAND_LIST) {
  const cleaned = stripTrustedBrandsBlock(html);
  const snippet = buildMarqueeSnippet(brands);

  const firstSectionEnd = cleaned.indexOf('</section>');
  if (firstSectionEnd === -1) {
    const bodyOpen = cleaned.search(/<body[^>]*>/i);
    if (bodyOpen === -1) return cleaned + snippet;
    const bodyTagEnd = cleaned.indexOf('>', bodyOpen) + 1;
    return cleaned.slice(0, bodyTagEnd) + '\n' + snippet + cleaned.slice(bodyTagEnd);
  }

  const insertAt = firstSectionEnd + '</section>'.length;
  return cleaned.slice(0, insertAt) + '\n' + snippet + cleaned.slice(insertAt);
}

/**
 * Verify injected trusted-brands block matches testing-3 / live analytics behaviour.
 * @param {string} html
 * @returns {{ ok: boolean, errors: string[], warnings: string[] }}
 */
export function verifyTrustedBrandsHtml(html) {
  const errors = [];
  const warnings = [];

  if (!html.includes('TRUSTED BRANDS SECTION — auto-injected by Web Page Builder')) {
    errors.push('Missing auto-injected trusted brands marker comments');
  }
  if (!html.includes('class="za-brandsCounts"')) {
    errors.push('Missing .za-brandsCounts section');
  }
  if (!html.includes('dashboard-wrapper')) {
    warnings.push('No .dashboard-wrapper found — expected for dashboard zigzag builds');
  }
  if (!html.includes('trusted-icon-wrap')) {
    errors.push('Missing .trusted-icon-wrap marquee container');
  }
  if (!html.includes('za-cust-counts') || !html.includes('data-onscroll')) {
    errors.push('Missing .za-cust-counts[data-onscroll] stats block');
  }
  if (!html.includes('za-thousand-customers') || !html.includes('za-million-users')) {
    errors.push('Missing za-thousand-customers / za-million-users counter attributes');
  }
  if (!html.includes('SLICK_STEP_PX')) {
    errors.push('Missing live-calibrated marquee speed (SLICK_STEP_PX)');
  }
  if (!html.includes('--tb-scroll-end')) {
    errors.push('Missing pixel-based marquee scroll distance (--tb-scroll-end)');
  }
  if (!html.includes('loading="lazy"')) {
    errors.push('Brand logo images must use loading="lazy"');
  }
  if (!html.includes('https://prezohoweb.zoho.com/sites/zweb/images/otherbrandlogos/')) {
    errors.push('Brand logos must use https://prezohoweb.zoho.com/ image paths');
  }

  const logoCount = (html.match(/class="ae-icon"/g) || []).length;
  const expectedMin = DEFAULT_BRAND_LIST.length;
  if (logoCount < expectedMin) {
    errors.push(`Expected at least ${expectedMin} brand logos, found ${logoCount}`);
  }

  const leftRows = (html.match(/main-wrapper left-content/g) || []).length;
  const rightRows = (html.match(/main-wrapper right-content/g) || []).length;
  if (html.includes('dashboard-wrapper') && (leftRows < 1 || rightRows < 1)) {
    errors.push('dashboard-wrapper must include alternating .left-content and .right-content rows');
  }

  return { ok: errors.length === 0, errors, warnings };
}

/**
 * Inject into output/<slug>/index.html on disk.
 * @returns {{ ok: boolean, path?: string, placement?: string, verify?: object }}
 */
export function injectTrustedBrandsFile(htmlPath, brands = DEFAULT_BRAND_LIST) {
  if (!fs.existsSync(htmlPath)) {
    return { ok: false, reason: 'index.html not found' };
  }

  const html = fs.readFileSync(htmlPath, 'utf8');
  const updated = injectTrustedBrandsIntoHtml(html, brands);
  fs.writeFileSync(htmlPath, updated, 'utf8');

  const placement = html.indexOf('</section>') === -1 ? 'after-body' : 'after-hero';
  const verify = verifyTrustedBrandsHtml(updated);

  return { ok: true, path: htmlPath, placement, verify };
}
