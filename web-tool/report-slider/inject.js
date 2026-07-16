// report-slider/inject.js
// Post-compose injection — empty DOM shell for Zoho deployment hydration.

import fs from 'node:fs';
import {
  buildReportSliderSnippet,
  stripReportSliderBlock,
  stripAgentReportedSection,
  REPORT_SLIDER_START_MARKER
} from './report-template.js';

/**
 * Insert immediately BEFORE the closing CTA (#conclusion / Ready to build…),
 * and AFTER mid-page content (dashboards, steps, etc.).
 * Never insert before #one-click-cta mid-page white band.
 * @param {string} html
 * @returns {{ index: number, placement: string }}
 */
function findInsertPoint(html) {
  // Prefer exact closing CTA id
  const conclusion = html.match(/<section[^>]*\bid=["']conclusion["'][^>]*>/i)
    || html.match(/<section[^>]*class=["'][^"']*\bpre-banner-section\b[^"']*["'][^>]*\bid=["']conclusion["'][^>]*>/i)
    || html.match(/<section[^>]*\bid=["']conclusion["'][^>]*class=["'][^"']*\bpre-banner-section\b[^"']*["'][^>]*>/i);

  if (conclusion && typeof conclusion.index === 'number') {
    return { index: conclusion.index, placement: 'before-conclusion' };
  }

  // Last pre-banner-section that is NOT mid-page .bg-white / one-click-cta
  const re = /<section[^>]*class=["'][^"']*\bpre-banner-section\b[^"']*["'][^>]*>/gi;
  let m;
  let lastClosing = null;
  while ((m = re.exec(html)) !== null) {
    const tag = m[0];
    if (/\bbg-white\b/i.test(tag) || /id=["']one-click-cta["']/i.test(tag)) continue;
    lastClosing = { index: m.index, placement: 'before-last-closing-pre-banner' };
  }
  if (lastClosing) return lastClosing;

  // Heading fallback — walk back to section open
  const ready = html.match(/Ready to build your\b/i);
  if (ready && typeof ready.index === 'number') {
    const before = html.slice(0, ready.index);
    const sec = before.lastIndexOf('<section');
    if (sec !== -1) return { index: sec, placement: 'before-ready-to-build-heading' };
  }

  // Before FAQ if closing banner class/id missing
  const faq = html.match(/<section[^>]*class=["'][^"']*\bfaq-section\b[^"']*["'][^>]*>/i);
  if (faq && typeof faq.index === 'number') {
    return { index: faq.index, placement: 'before-faq-fallback' };
  }

  const bodyClose = html.search(/<\/body>/i);
  if (bodyClose !== -1) {
    return { index: bodyClose, placement: 'before-body-close' };
  }

  return { index: html.length, placement: 'append' };
}

/**
 * Insert the empty report-slider shell immediately before the closing CTA.
 * @param {string} html
 * @returns {{ html: string, placement: string }}
 */
export function injectReportSliderIntoHtml(html) {
  let cleaned = stripReportSliderBlock(html);
  cleaned = stripAgentReportedSection(cleaned);
  const snippet = buildReportSliderSnippet();
  const { index, placement } = findInsertPoint(cleaned);
  const updated = cleaned.slice(0, index) + '\n' + snippet + '\n' + cleaned.slice(index);
  return { html: updated, placement };
}

/**
 * Verify injected empty shell (Zoho fills content later).
 * @param {string} html
 * @returns {{ ok: boolean, errors: string[], warnings: string[] }}
 */
export function verifyReportSliderHtml(html) {
  const errors = [];
  const warnings = [];

  if (!html.includes(REPORT_SLIDER_START_MARKER)) {
    errors.push('Missing auto-injected report slider marker comments');
  }
  if (!html.includes('class="reported-section"') && !html.includes("class='reported-section'")) {
    errors.push('Missing .reported-section');
  }
  if (!html.includes('report-slider')) {
    errors.push('Missing .report-slider');
  }
  if (!html.includes('rating-table')) {
    errors.push('Missing .rating-table');
  }
  if (!html.includes('trust-section')) {
    errors.push('Missing .trust-section.rated-section');
  }

  // Must sit before closing CTA, not before mid-page one-click
  const reportedIdx = html.search(/class=["'][^"']*\breported-section\b/i);
  const conclusionIdx = html.search(/\bid=["']conclusion["']/i);
  const oneClickIdx = html.search(/\bid=["']one-click-cta["']/i);
  if (reportedIdx !== -1 && conclusionIdx !== -1 && reportedIdx > conclusionIdx) {
    errors.push('Report slider must be placed BEFORE #conclusion (closing CTA)');
  }
  if (reportedIdx !== -1 && oneClickIdx !== -1 && reportedIdx < oneClickIdx) {
    warnings.push('Report slider appears before mid-page #one-click-cta — expected just above closing #conclusion');
  }

  const sliderMatch = html.match(/<div class="report-slider">\s*([\s\S]*?)<\/div>\s*<!-- Ratings/i);
  if (sliderMatch && sliderMatch[1].replace(/\s+/g, '').length > 0) {
    warnings.push('report-slider is not empty — deployment usually fills this itself');
  }

  return { ok: errors.length === 0, errors, warnings };
}

/**
 * Inject into output/<slug>/index.html on disk.
 * @returns {{ ok: boolean, path?: string, placement?: string, verify?: object, reason?: string }}
 */
export function injectReportSliderFile(htmlPath) {
  if (!fs.existsSync(htmlPath)) {
    return { ok: false, reason: 'index.html not found' };
  }

  const original = fs.readFileSync(htmlPath, 'utf8');
  const { html: updated, placement } = injectReportSliderIntoHtml(original);
  fs.writeFileSync(htmlPath, updated, 'utf8');

  const verify = verifyReportSliderHtml(updated);
  return { ok: true, path: htmlPath, placement, verify };
}
