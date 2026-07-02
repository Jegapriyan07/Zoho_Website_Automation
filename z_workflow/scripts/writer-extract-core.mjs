#!/usr/bin/env node
/**
 * Shared Writer extraction logic — browser script + brief assembly.
 * Used by extract-writer.mjs (Puppeteer) and documented for Chrome MCP evaluate_script.
 */

/**
 * Async function body run inside the Writer page via page.evaluate.
 * Returns structured extraction result (JSON-serializable).
 */
export const WRITER_BROWSER_EXTRACT_FN = async function extractWriterDocument() {
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  function cleanText(t) {
    return (t || '').replace(/\s+/g, ' ').trim();
  }

  function findScroller() {
    const candidates = [
      document.querySelector('.zw-scroll-container'),
      document.querySelector('.zw-page-container'),
      document.querySelector('[class*="zw-scroll"]'),
      document.querySelector('[class*="editor-scroll"]'),
      document.querySelector('.zw-contentpane'),
      document.scrollingElement,
      document.documentElement
    ].filter(Boolean);
    return candidates[0] || document.documentElement;
  }

  async function hydrateAllPages() {
    const scroller = findScroller();
    const pageTops = [...document.querySelectorAll('.zw-page')];

    const scrollHeight = Math.max(
      scroller.scrollHeight || 0,
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );

    for (let y = 0; y <= scrollHeight; y += 280) {
      if (scroller.scrollTop !== undefined) scroller.scrollTop = y;
      window.scrollTo(0, y);
      await delay(220);
    }

    window.scrollTo(0, scrollHeight);
    await delay(800);

    for (let i = 0; i < pageTops.length; i++) {
      pageTops[i].scrollIntoView({ block: 'start', behavior: 'instant' });
      await delay(650);
      const inner = pageTops[i].querySelector('[class*="scroll"]');
      if (inner && inner.scrollTop !== undefined) {
        inner.scrollTop = inner.scrollHeight;
        await delay(300);
      }
    }

    await delay(1200);
    return pageTops.length;
  }

  async function waitForFloatImageBlocks() {
    const maxWait = 20000;
    const start = Date.now();
    while (Date.now() - start < maxWait) {
      const containers = [...document.querySelectorAll('.float-image-content-container')];
      if (!containers.length) return { found: 0, hydrated: 0 };
      const hydrated = containers.filter(
        (c) => c.children.length > 0 || (c.innerText || '').trim().length > 20
      );
      if (hydrated.length >= containers.length) {
        return { found: containers.length, hydrated: hydrated.length };
      }
      for (const c of containers) {
        c.scrollIntoView({ block: 'center', behavior: 'instant' });
      }
      await delay(600);
    }
    const containers = [...document.querySelectorAll('.float-image-content-container')];
    const hydrated = containers.filter(
      (c) => c.children.length > 0 || (c.innerText || '').trim().length > 20
    );
    return { found: containers.length, hydrated: hydrated.length };
  }

  await hydrateAllPages();
  const floatImages = await waitForFloatImageBlocks();

  const pages = [...document.querySelectorAll('.zw-page')];
  const perPage = pages.map((page, i) => ({
    page: i + 1,
    text: cleanText(page.innerText || '')
  }));

  const blockSelector = [
    '.zw-page p', '.zw-page h1', '.zw-page h2', '.zw-page h3',
    '.zw-page h4', '.zw-page h5', '.zw-page h6', '.zw-page li',
    '.zw-page td', '.zw-page th', '.zw-page span.zw-text',
    '[class*="zw-page"] p', '[class*="zw-page"] h1', '[class*="zw-page"] h2',
    '[class*="zw-page"] h3', '[class*="zw-page"] h4'
  ].join(', ');

  const seen = new Set();
  const structuredBlocks = [];
  document.querySelectorAll(blockSelector).forEach((el) => {
    const t = cleanText(el.innerText);
    if (!t || t.length < 3) return;
    if (seen.has(t)) return;
    seen.add(t);
    structuredBlocks.push(t);
  });

  const structuredText = structuredBlocks.join('\n');

  const bodyText = document.body.innerText || '';
  const pageOfMatch = bodyText.match(/Page\s+(\d+)\s+of\s+(\d+)/i);
  const charsMatch = bodyText.match(/Chars[:\s]*([\d,]+)/i);
  const footerChars = charsMatch ? parseInt(charsMatch[1].replace(/,/g, ''), 10) : null;

  let briefText = '';
  perPage.forEach((p, i) => {
    if (i > 0) briefText += `\n\n--- PAGE ${p.page} ---\n\n`;
    briefText += p.text;
  });

  const mergedLines = new Set();
  const mergedParts = [];

  function addLines(text) {
    for (const line of (text || '').split('\n')) {
      const t = line.trim();
      if (!t || t.length < 2) continue;
      if (mergedLines.has(t)) continue;
      mergedLines.add(t);
      mergedParts.push(t);
    }
  }

  addLines(briefText);
  if (structuredText.length > briefText.length * 0.85) {
    addLines(structuredText);
  } else {
    for (const block of structuredBlocks) {
      if (!briefText.includes(block)) addLines(block);
    }
  }

  const mergedText = mergedParts.join('\n');

  return {
    pageCount: pages.length,
    footerPageOf: pageOfMatch ? { current: parseInt(pageOfMatch[1], 10), total: parseInt(pageOfMatch[2], 10) } : null,
    footerChars,
    perPageLengths: perPage.map((p) => ({ page: p.page, len: p.text.length })),
    innerTextLength: briefText.length,
    structuredLength: structuredText.length,
    mergedLength: mergedText.length,
    briefText,
    structuredText,
    mergedText,
    floatImages
  };
};

/**
 * Pick best text blob and format for briefs/{slug}.txt
 * @param {object} result — from browser extract
 * @param {string} [title]
 */
export function assembleBriefFile(result, title = '') {
  const body = result.mergedText || result.briefText || result.structuredText || '';
  const header = title ? `${title}\n` : '';
  return header + body.trim() + '\n';
}

/**
 * Inventory sections for validation sidecar.
 * @param {string} text
 */
export function inventoryBrief(text) {
  const norm = text.replace(/\r\n/g, '\n');

  const stepMatches = [...norm.matchAll(/step\s*(\d+)/gi)];
  const stepNumbers = [...new Set(stepMatches.map((m) => parseInt(m[1], 10)))].sort((a, b) => a - b);

  const faqIdx = norm.search(/\bFAQs?\b/i);
  let faqCount = 0;
  if (faqIdx >= 0) {
    const faqBlock = norm.slice(faqIdx);
    faqCount = (faqBlock.match(/\?\s*\n/g) || []).length;
    if (faqCount === 0) {
      faqCount = (faqBlock.match(/\n[A-Z][^\n]+\?\n/g) || []).length;
    }
  }

  const pageMarkers = [...norm.matchAll(/---\s*PAGE\s+(\d+)\s*---/gi)];
  const pages = pageMarkers.map((m) => parseInt(m[1], 10));

  const ratingPlatforms = ['GetApp', 'FinancesOnline', 'Capterra', 'G2', 'Google Workspace Marketplace', 'Software Advice']
    .filter((p) => norm.includes(p));

  return {
    step_count: stepNumbers.length,
    step_numbers: stepNumbers,
    faq_count: faqCount,
    page_markers: pages,
    has_testimonials_heading: /hear from our (happy )?customers/i.test(norm),
    has_see_all_testimonials: /see all testimonials/i.test(norm),
    has_dresner: /dresner advisory/i.test(norm),
    has_how_it_works: /how .+ works for agencies/i.test(norm),
    rating_platforms: ratingPlatforms,
    char_count: norm.length
  };
}

/**
 * @param {object} result — browser extract result
 */
export function extractionQualityChecks(result) {
  const warnings = [];
  const errors = [];

  if (!result.pageCount) {
    errors.push('No .zw-page elements found — are you on a Writer document?');
  }

  if (result.footerChars && result.mergedLength) {
    const ratio = result.mergedLength / result.footerChars;
    if (ratio < 0.75) {
      errors.push(`Extracted length ${result.mergedLength} is <75% of Writer footer Chars ${result.footerChars}`);
    } else if (ratio < 0.9) {
      warnings.push(`Extracted length ${result.mergedLength} is <90% of footer Chars ${result.footerChars}`);
    }
  }

  const thinPages = (result.perPageLengths || []).filter((p) => p.len < 120);
  if (thinPages.length) {
    warnings.push(`Thin pages (may be lazy-loaded): ${thinPages.map((p) => p.page).join(', ')}`);
  }

  const inv = inventoryBrief(result.mergedText || '');
  if (inv.step_count < 4 && /agency/i.test(result.mergedText || '')) {
    warnings.push(`Only ${inv.step_count} steps found — agency landings usually have 4`);
  }

  const fi = result.floatImages || {};
  if (fi.found > 0 && fi.hydrated < fi.found) {
    errors.push(
      `Writer float-image / section-reference blocks (${fi.found} found, ${fi.hydrated} hydrated) — Dresner/testimonials may be missing from extract. Paste PAGE 7 social proof manually or open doc in Edit mode.`
    );
  }

  const norm = (result.mergedText || '').toLowerCase();
  const expectsSocialProof =
    norm.includes('dashboard examples') &&
    (norm.includes('build sales dashboards now') || norm.includes('build finance dashboards now'));
  if (expectsSocialProof && !inv.has_dresner && fi.found > 0) {
    errors.push(
      'Dashboard-examples brief missing Dresner/testimonials — likely Writer Section reference blocks (float-image-container) not in DOM text'
    );
  }

  return { warnings, errors, inventory: inv };
}
