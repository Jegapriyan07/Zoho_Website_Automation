#!/usr/bin/env node
/**
 * Shared Writer extraction logic — browser script + brief assembly.
 * Used by extract-writer.mjs (Puppeteer) and documented for Chrome MCP evaluate_script.
 */

import { inventoryBrief } from './inventory-checks.mjs';

export { inventoryBrief } from './inventory-checks.mjs';

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

  function currentScroll(scroller) {
    return scroller.scrollTop || window.scrollY || document.documentElement.scrollTop || 0;
  }

  // Zoho Writer virtualizes pages: only the pages near the viewport are kept in
  // the DOM, the rest are emptied. Reading every .zw-page innerText once at the
  // end therefore loses the middle of the document. Instead we walk the whole
  // document and CAPTURE each page's text while it is on-screen, keyed by a
  // stable identifier (id / data-page attr, else absolute top position).
  const pageStore = new Map();

  function pageKey(el, scroller) {
    const explicit =
      el.id ||
      el.getAttribute('data-page-no') ||
      el.getAttribute('data-page-index') ||
      el.getAttribute('data-pageno');
    if (explicit) return `k:${explicit}`;
    const rect = el.getBoundingClientRect();
    const absTop = Math.round((rect.top + currentScroll(scroller)) / 10) * 10;
    return `p:${absTop}`;
  }

  function captureVisiblePages(scroller) {
    const scroll = currentScroll(scroller);
    for (const el of document.querySelectorAll('.zw-page')) {
      const text = cleanText(el.innerText || '');
      if (text.length < 3) continue;
      const key = pageKey(el, scroller);
      const rect = el.getBoundingClientRect();
      const absTop = rect.top + scroll;
      const prev = pageStore.get(key);
      if (!prev || text.length > prev.text.length) {
        pageStore.set(key, { top: absTop, text });
      }
    }
  }

  function isHydratedBlock(el) {
    return el.children.length > 0 || (el.innerText || '').trim().length > 20;
  }

  function floatImageContainers() {
    const selectors = [
      '.float-image-content-container',
      '.float-image-container',
      '[class*="section-reference"]',
      '[class*="section_reference"]',
      '[class*="float-image"]'
    ];
    const seen = new Set();
    const out = [];
    for (const sel of selectors) {
      for (const el of document.querySelectorAll(sel)) {
        if (seen.has(el)) continue;
        seen.add(el);
        out.push(el);
      }
    }
    return out;
  }

  function clickTargetForBlock(el) {
    return (
      el.closest('[class*="float-image"]') ||
      el.closest('[class*="section-reference"]') ||
      el.closest('[class*="section_reference"]') ||
      el
    );
  }

  function captureSectionReferenceHints() {
    const hints = [];
    const seen = new Set();

    function addHint(text) {
      const t = cleanText(text);
      if (!t || t.length < 4 || seen.has(t)) return;
      if (/^section reference$/i.test(t)) return;
      seen.add(t);
      hints.push(t);
    }

    for (const el of document.querySelectorAll(
      '[class*="float-image"], [class*="section-reference"], [class*="section_reference"]'
    )) {
      addHint(el.getAttribute('aria-label'));
      addHint(el.getAttribute('title'));
      addHint(el.getAttribute('data-section-name'));
      addHint(el.getAttribute('data-title'));

      for (const child of el.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div')) {
        const t = cleanText(child.innerText || '');
        if (t && t.length >= 8 && t.length <= 240) addHint(t);
      }
    }

    return hints;
  }

  async function hydrateSectionReferences() {
    const containers = floatImageContainers();
    if (!containers.length) return { found: 0, hydrated: 0 };

    const maxRounds = containers.length > 20 ? 4 : 3;
    for (let round = 0; round < maxRounds; round++) {
      let clicked = 0;
      for (const c of containers) {
        if (isHydratedBlock(c)) continue;
        const target = clickTargetForBlock(c);
        target.scrollIntoView({ block: 'center', behavior: 'instant' });
        await delay(220);
        try {
          target.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
          target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
          target.click();
          target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
          target.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }));
          if (typeof target.focus === 'function') target.focus();
        } catch {
          // ignore non-clickable nodes
        }
        clicked++;
        await delay(containers.length > 20 ? 520 : 420);
        captureVisiblePages(findScroller());
      }
      const hydrated = containers.filter(isHydratedBlock);
      if (hydrated.length >= containers.length) break;
      if (!clicked) break;
    }

    const hydrated = containers.filter(isHydratedBlock);
    return { found: containers.length, hydrated: hydrated.length };
  }

  async function hydrateAndCapture({ scrollStep = 200, stepDelay = 280, pageAnchorPasses = 3 } = {}) {
    const scroller = findScroller();

    async function fullScrollPass() {
      const scrollHeight = Math.max(
        scroller.scrollHeight || 0,
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );

      window.scrollTo(0, 0);
      await delay(350);
      captureVisiblePages(scroller);

      for (let y = 0; y <= scrollHeight; y += scrollStep) {
        if (scroller.scrollTop !== undefined) scroller.scrollTop = y;
        window.scrollTo(0, y);
        await delay(stepDelay);
        captureVisiblePages(scroller);
      }

      window.scrollTo(0, scrollHeight);
      await delay(700);
      captureVisiblePages(scroller);

      for (let pass = 0; pass < pageAnchorPasses; pass++) {
        const anchors = [...document.querySelectorAll('.zw-page')];
        for (const el of anchors) {
          el.scrollIntoView({ block: 'center', behavior: 'instant' });
          await delay(360);
          captureVisiblePages(scroller);
        }
      }

      // PageDown nudges Writer to materialize virtualized pages.
      for (let i = 0; i < 24; i++) {
        const keyOpts = { key: 'PageDown', code: 'PageDown', bubbles: true, cancelable: true };
        document.dispatchEvent(new KeyboardEvent('keydown', keyOpts));
        window.dispatchEvent(new KeyboardEvent('keydown', keyOpts));
        await delay(320);
        captureVisiblePages(scroller);
      }

      await delay(500);
      captureVisiblePages(scroller);
    }

    const bodyText = document.body.innerText || '';
    const pageOfMatch = bodyText.match(/Page\s+(\d+)\s+of\s+(\d+)/i);
    const expectedPages = pageOfMatch ? parseInt(pageOfMatch[2], 10) : null;

    let prevSize = 0;
    for (let attempt = 0; attempt < 2; attempt++) {
      await fullScrollPass();
      const size = pageStore.size;
      const reachedTarget = expectedPages ? size >= expectedPages : false;
      if (reachedTarget && size === prevSize) break;
      if (size === prevSize && attempt >= 1) break;
      prevSize = size;
    }
  }

  async function waitForFloatImageBlocks() {
    let stats = await hydrateSectionReferences();
    if (stats.found > 0 && stats.hydrated >= stats.found) return stats;

    const maxWait = 24000;
    const start = Date.now();
    while (Date.now() - start < maxWait) {
      const containers = floatImageContainers();
      if (!containers.length) return stats.found ? stats : { found: 0, hydrated: 0 };
      const hydrated = containers.filter(isHydratedBlock);
      if (hydrated.length >= containers.length) {
        return { found: containers.length, hydrated: hydrated.length };
      }
      for (const c of containers) {
        if (isHydratedBlock(c)) continue;
        clickTargetForBlock(c).scrollIntoView({ block: 'center', behavior: 'instant' });
        try {
          clickTargetForBlock(c).click();
        } catch {
          // ignore
        }
      }
      await delay(700);
      stats = {
        found: containers.length,
        hydrated: containers.filter(isHydratedBlock).length
      };
    }
    return stats;
  }

  await hydrateSectionReferences();
  await hydrateAndCapture();
  const floatImages = await waitForFloatImageBlocks();
  if (floatImages.found > floatImages.hydrated) {
    await hydrateAndCapture({ scrollStep: 180, stepDelay: 300, pageAnchorPasses: 2 });
  }
  captureVisiblePages(findScroller());

  // Order captured pages top→bottom, then dedupe near-identical captures. The
  // same page can be captured at slightly different absolute tops (layout shifts
  // as images/tables load), producing duplicate keys — collapse them so page
  // numbering matches the real document.
  const orderedPages = [...pageStore.values()].sort((a, b) => a.top - b.top);
  const dedupedPages = [];
  for (const cand of orderedPages) {
    const existing = dedupedPages.find((k) => {
      const a = k.text;
      const b = cand.text;
      if (a === b) return true;
      // Only collapse when the two captures are near-identical (same page loaded
      // partially vs fully) — a >=90% length overlap with containment. Never
      // collapse a short distinct page just because its text appears inside a
      // longer one.
      const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
      return longer.includes(shorter) && shorter.length / longer.length >= 0.9;
    });
    if (!existing) {
      dedupedPages.push({ ...cand });
    } else if (cand.text.length > existing.text.length) {
      existing.text = cand.text;
      existing.top = Math.min(existing.top, cand.top);
    }
  }
  const perPage = dedupedPages.map((p, i) => ({
    page: i + 1,
    text: p.text
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
  for (const hint of captureSectionReferenceHints()) {
    if (!mergedParts.some((line) => line.includes(hint))) addLines(hint);
  }

  const mergedText = mergedParts.join('\n');

  const footerTotalPages = pageOfMatch ? parseInt(pageOfMatch[2], 10) : null;

  const docTitle = (() => {
    const selectors = [
      '.zw-filename', '.zw-document-name', '.file-name', '[class*="doc-name"]',
      '[class*="document-title"]', '.zw-title', '[class*="file-title"]'
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      const t = cleanText(el?.innerText || el?.textContent || '');
      if (t.length > 2 && !/^untitled$/i.test(t)) return t;
    }
    return cleanText((document.title || '').replace(/\s*[-|–]\s*Zoho Writer.*$/i, ''));
  })();

  return {
    pageCount: footerTotalPages || perPage.length,
    footerPageOf: pageOfMatch ? { current: parseInt(pageOfMatch[1], 10), total: parseInt(pageOfMatch[2], 10) } : null,
    footerChars,
    writerDocTitle: docTitle || null,
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
 * @param {object} result — browser extract result
 * @param {{ id?: string, composite?: object } | null} [archetype]
 */
export function extractionQualityChecks(result, archetype = null) {
  const warnings = [];
  const errors = [];

  if (!result.pageCount) {
    errors.push('No .zw-page elements found — are you on a Writer document?');
  }

  const mergedText = result.mergedText || '';
  const inv = inventoryBrief(mergedText);
  const checks = archetype?.composite?.section_inventory_checks || {};
  const charRatio =
    result.footerChars && result.mergedLength ? result.mergedLength / result.footerChars : null;

  if (result.footerChars && result.mergedLength) {
    if (charRatio < 0.75) {
      errors.push(`Extracted length ${result.mergedLength} is <75% of Writer footer Chars ${result.footerChars}`);
    } else if (charRatio < 0.9) {
      warnings.push(`Extracted length ${result.mergedLength} is <90% of footer Chars ${result.footerChars}`);
    }
  }

  const thinPages = (result.perPageLengths || []).filter((p) => p.len < 120);
  if (thinPages.length) {
    warnings.push(`Thin pages (may be lazy-loaded): ${thinPages.map((p) => p.page).join(', ')}`);
    // Only treat thin pages as blocking when many are empty AND char ratio is low.
    if (thinPages.length >= 3 && charRatio !== null && charRatio < 0.9) {
      errors.push(
        `Thin/empty pages (${thinPages.map((p) => p.page).join(', ')}) with low char capture — scroll/hydration incomplete`
      );
    }
  }

  if (inv.step_count < 4 && /agency/i.test(mergedText)) {
    warnings.push(`Only ${inv.step_count} steps found — agency landings usually have 4`);
  }

  const fi = result.floatImages || {};
  const requiresDresner = checks.require_dresner === true;
  const requiresTestimonials = checks.require_testimonials_heading === true;
  const norm = mergedText.toLowerCase();
  const briefExpectsSocialProof =
    norm.includes('dresner advisory') ||
    norm.includes('hear from our customers') ||
    norm.includes('hear from our happy customers');

  if (fi.found > 0 && fi.hydrated < fi.found) {
    const hydrationRatio = fi.hydrated / fi.found;
    const msg =
      `Writer float-image / section-reference blocks (${fi.found} found, ${fi.hydrated} hydrated) — embedded images/sections may be missing from extract. Open doc in Edit mode if content looks thin.`;
    if (charRatio !== null && charRatio >= 0.95 && hydrationRatio >= 0.2) {
      warnings.push(msg);
    } else if (charRatio !== null && charRatio >= 0.9) {
      warnings.push(msg);
    } else {
      errors.push(msg);
    }
  }

  if (
    (requiresDresner || requiresTestimonials || briefExpectsSocialProof) &&
    !inv.has_dresner &&
    !inv.has_testimonials_heading &&
    fi.found > 0 &&
    norm.includes('dashboard examples')
  ) {
    errors.push(
      'Dashboard-examples brief missing Dresner/testimonials — likely Writer Section reference blocks (float-image-container) not in DOM text'
    );
  }

  return { warnings, errors, inventory: inv };
}
