#!/usr/bin/env node
/**
 * Deterministic post-compose patches so autonomous builds pass validate:output
 * when the agent picked the wrong section class (e.g. banner-section vs za-banner-section)
 * or emitted Article TOC body as sibling <section>s (gold: banner → tabsection → faq only).
 *
 * Usage:
 *   node z_workflow/scripts/fix-output-archetype.mjs --slug whitelabel
 *   node z_workflow/scripts/fix-output-archetype.mjs --slug foo --archetype white-label-reporting-landing
 */

import fs from 'fs';
import path from 'path';
import { resolveArchetype } from './composite-utils.mjs';
import { validateOutputDir } from './validate-output.mjs';
import { ROOT, STATE_FILE, isScriptMain } from './workflow-paths.mjs';

const HERO_ALTERNATES = ['banner-section', 'banner', 'za-banner-section', 'za-banner-sticky-wrap'];

const PEACH_CTA_H3 = 'Go from data to insights in minutes using Zoho Analytics';
const PEACH_CTA_LABEL = 'Access Zoho Analytics';

function parseArgs(argv) {
  const args = { slug: null, archetype: null, noValidate: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--slug' && argv[i + 1]) args.slug = argv[++i];
    else if (argv[i] === '--archetype' && argv[i + 1]) args.archetype = argv[++i];
    else if (argv[i] === '--no-validate') args.noValidate = true;
  }
  return args;
}

function resolveArchetypeForDir(slug, forcedArchetype) {
  if (forcedArchetype) {
    const r = resolveArchetype('', forcedArchetype);
    return r ? { id: r.id, composite: r.composite } : null;
  }
  if (fs.existsSync(STATE_FILE)) {
    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    const id = state.writer_brief?.archetype || state.similarity?.archetype;
    if (id) {
      const r = resolveArchetype('', id);
      if (r) return { id: r.id, composite: r.composite };
    }
  }
  const briefPath = path.join(ROOT, 'z_workflow', 'briefs', `${slug}.txt`);
  if (fs.existsSync(briefPath)) {
    const r = resolveArchetype(fs.readFileSync(briefPath, 'utf8'));
    if (r) return { id: r.id, composite: r.composite };
  }
  return null;
}

function needsArticleTocLayout(composite) {
  return Boolean(
    composite?.output_inventory_checks?.require_article_toc_layout ||
      composite?.section_order?.some((s) => s.class === 'tabsection' || s.type === 'toc-content')
  );
}

/** Find end index (exclusive) of the element that opens at openIdx (tag name from openTag). */
function findMatchingClose(html, openIdx, tagName) {
  const openRe = new RegExp(`<${tagName}\\b[^>]*>`, 'gi');
  const closeRe = new RegExp(`</${tagName}>`, 'gi');
  openRe.lastIndex = openIdx;
  const openMatch = openRe.exec(html);
  if (!openMatch || openMatch.index !== openIdx) return -1;

  let depth = 1;
  let cursor = openIdx + openMatch[0].length;
  while (depth > 0 && cursor < html.length) {
    openRe.lastIndex = cursor;
    closeRe.lastIndex = cursor;
    const nextOpen = openRe.exec(html);
    const nextClose = closeRe.exec(html);
    if (!nextClose) return -1;
    if (nextOpen && nextOpen.index < nextClose.index) {
      depth += 1;
      cursor = nextOpen.index + nextOpen[0].length;
    } else {
      depth -= 1;
      cursor = nextClose.index + nextClose[0].length;
      if (depth === 0) return cursor;
    }
  }
  return -1;
}

function unwrapOuterContentWrap(inner) {
  const trimmed = inner.replace(/^\s+/, '');
  const m = trimmed.match(/^<div\s+class=["']content-wrap["'][^>]*>/i);
  if (!m) return inner;
  const openIdx = inner.indexOf(m[0]);
  const end = findMatchingClose(inner, openIdx, 'div');
  if (end < 0) return inner;
  const afterOpen = openIdx + m[0].length;
  const beforeClose = end - '</div>'.length;
  return inner.slice(afterOpen, beforeClose);
}

function sectionHtmlToContSec(sectionHtml) {
  const openMatch = sectionHtml.match(/^(\s*)<section(\s[^>]*)?>/i);
  if (!openMatch) return null;
  const indent = openMatch[1] || '\n        ';
  let attrs = openMatch[2] || '';
  const openEnd = openMatch[0].length;
  if (!/<\/section>\s*$/i.test(sectionHtml)) return null;
  let inner = sectionHtml.slice(openEnd).replace(/<\/section>\s*$/i, '');

  if (/class\s*=\s*["']/.test(attrs)) {
    attrs = attrs.replace(/class\s*=\s*["']([^"']*)["']/i, (_, classes) => {
      const parts = classes.split(/\s+/).filter(Boolean);
      if (!parts.includes('cont-sec')) parts.unshift('cont-sec');
      return `class="${parts.join(' ')}"`;
    });
  } else {
    attrs = ` class="cont-sec"${attrs}`;
  }

  inner = unwrapOuterContentWrap(inner);
  return `${indent}<div${attrs}>${inner}${indent}</div>`;
}

/**
 * Nest stray sibling <section>s that sit between .tabsection and .faq-section
 * into #right-content as .cont-sec divs (gold: output/cloud-analytics).
 *
 * Single splice: copy siblings → convert → insert before #right-content close →
 * drop the original sibling region (tabEnd…faqOpen) entirely.
 */
function fixArticleTocStructure(html) {
  if (!/<section[^>]*class=["'][^"']*\btabsection\b/i.test(html)) {
    return { html, fixes: [] };
  }

  const tabOpen = html.search(/<section[^>]*class=["'][^"']*\btabsection\b/i);
  const faqOpen = html.search(/<section[^>]*class=["'][^"']*\bfaq-section\b/i);
  if (tabOpen < 0 || faqOpen <= tabOpen) return { html, fixes: [] };

  const tabEnd = findMatchingClose(html, tabOpen, 'section');
  if (tabEnd < 0 || tabEnd > faqOpen) return { html, fixes: [] };

  if (!/<section\b/i.test(html.slice(tabEnd, faqOpen))) {
    return { html, fixes: [] };
  }

  const rightOpen = html.search(/id=["']right-content["']/i);
  if (rightOpen < 0 || rightOpen < tabOpen || rightOpen > tabEnd) {
    return { html, fixes: [] };
  }
  const rightDivStart = html.lastIndexOf('<div', rightOpen);
  if (rightDivStart < 0) return { html, fixes: [] };
  const rightDivEnd = findMatchingClose(html, rightDivStart, 'div');
  if (rightDivEnd < 0 || rightDivEnd > tabEnd) return { html, fixes: [] };

  const siblings = [];
  let cursor = tabEnd;
  while (cursor < faqOpen) {
    const rel = html.slice(cursor, faqOpen).search(/<section\b/i);
    if (rel < 0) break;
    const abs = cursor + rel;
    const closeAbs = findMatchingClose(html, abs, 'section');
    if (closeAbs < 0 || closeAbs > faqOpen) break;
    const converted = sectionHtmlToContSec(html.slice(abs, closeAbs));
    if (converted) siblings.push(converted);
    cursor = closeAbs;
  }

  if (!siblings.length) return { html, fixes: [] };

  const insertChunk = `\n\n                    <!-- auto-nested article body (was sibling <section>s) -->\n${siblings.join('\n')}\n                    `;
  const closeTagStart = rightDivEnd - '</div>'.length;

  // […#right-content body] + nested + [rest of tabsection close] + [faq onward]
  // drops original siblings between tabEnd and faqOpen
  const next =
    html.slice(0, closeTagStart) +
    insertChunk +
    html.slice(closeTagStart, tabEnd) +
    '\n\n        ' +
    html.slice(faqOpen);

  return {
    html: next,
    fixes: [
      `Nested ${siblings.length} sibling section(s) into #right-content as .cont-sec (Article TOC gold structure)`
    ]
  };
}

/** Remove FAQ links from the sticky left-tab (FAQ stays as .faq-section after tabsection). */
function fixStripFaqFromToc(html) {
  if (!/left-tab[\s\S]{0,2500}href=["']#faqs?["']/i.test(html)) {
    return { html, fixes: [] };
  }
  const next = html.replace(
    /<li[^>]*>\s*<a[^>]*href=["']#faqs?["'][^>]*>[\s\S]*?<\/a>\s*<\/li>\s*/gi,
    ''
  );
  if (next === html) return { html, fixes: [] };
  return { html: next, fixes: ['Removed FAQ link(s) from left-tab TOC'] };
}

function fixPeachSidebarCta(html) {
  if (/Go from data to insights/i.test(html)) {
    return { html, fixes: [] };
  }
  if (!/id=["']tabs["']/i.test(html)) return { html, fixes: [] };

  const tabsOpen = html.search(/id=["']tabs["']/i);
  if (tabsOpen < 0) return { html, fixes: [] };
  const ulStart = html.lastIndexOf('<ul', tabsOpen);
  if (ulStart < 0) return { html, fixes: [] };
  const ulEnd = findMatchingClose(html, ulStart, 'ul');
  if (ulEnd < 0) return { html, fixes: [] };

  const ulBlock = html.slice(ulStart, ulEnd);
  const bannerH3 = /(<div class="banner">[\s\S]*?<h3>)([\s\S]*?)(<\/h3>)/i;
  if (bannerH3.test(ulBlock)) {
    const nextUl = ulBlock.replace(bannerH3, `$1${PEACH_CTA_H3}$3`);
    // Prefer Access Zoho Analytics on peach CTA when present
    const nextUl2 = nextUl.replace(
      /(<div class="banner">[\s\S]*?class="[^"]*cta-btn[^"]*"[^>]*>)([\s\S]*?)(<\/a>)/i,
      `$1${PEACH_CTA_LABEL}$3`
    );
    return {
      html: html.slice(0, ulStart) + nextUl2 + html.slice(ulEnd),
      fixes: ['Restored peach sidebar CTA copy ("Go from data to insights…")']
    };
  }

  // Inject peach CTA as last child of ul#tabs
  const inject = `
                        <div class="banner">
                            <div class="wrapper">
                                <h3>${PEACH_CTA_H3}</h3>
                                <a href="/analytics/signup.html" class="cta-btn act-btn">${PEACH_CTA_LABEL}</a>
                            </div>
                        </div>
`;
  const beforeClose = ulEnd - '</ul>'.length;
  return {
    html: html.slice(0, beforeClose) + inject + html.slice(beforeClose),
    fixes: ['Inserted peach sidebar CTA inside ul#tabs']
  };
}

function fixComparisonTableCss(css, html) {
  if (!/\.table-wrap|comparison-table/i.test(html + css)) {
    return { css, fixes: [] };
  }

  const fixes = [];
  let next = css;

  if (!/\.table-wrap\s*\{[^}]{0,300}overflow-x:\s*auto/i.test(next)) {
    next += `
/* Auto-patched: comparison table horizontal scroll */
.table-wrap {
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
}
`;
    fixes.push('Added `.table-wrap { overflow-x: auto }`');
  }

  const hasWideMin =
    /min-width:\s*(960|1[12]\d{2})px/i.test(next) || /min-width:\s*1200px/i.test(next);
  if (!hasWideMin) {
    next += `
/* Auto-patched: comparison tables must scroll, not crush */
.cont-sec .table-wrap table,
.table-wrap table,
.comparison-table table,
table.comparison-table {
    min-width: 960px;
    word-break: normal;
}
.cont-sec .table-wrap table.comparison-table-7col,
table.comparison-table-7col {
    min-width: 1200px;
}
`;
    fixes.push('Set comparison table min-width ≥960px (1200px for 7-col)');
  }

  return { css: next, fixes };
}

function fixHeroClass(html, css, composite) {
  const heroSlot = (composite.section_order || []).find((s) => s.banner_slot === 'hero');
  if (!heroSlot?.class) return { html, css, fixes: [] };

  const required = heroSlot.class;
  if (new RegExp(`\\b${required}\\b`).test(html)) {
    return { html, css, fixes: [] };
  }

  const fixes = [];
  for (const wrong of HERO_ALTERNATES) {
    if (wrong === required) continue;
    if (!new RegExp(`\\b${wrong}\\b`).test(html)) continue;

    let nextHtml = html;
    nextHtml = nextHtml.replace(
      new RegExp(`(<section[^>]*class=["'][^"']*)\\b${wrong}\\b([^"']*["'])`, 'i'),
      `$1${required}$2`
    );
    if (nextHtml === html) {
      nextHtml = nextHtml.replace(
        new RegExp(`class=["']${wrong}["']`, 'i'),
        `class="${required}"`
      );
    }

    let nextCss = css;
    if (wrong !== required && new RegExp(`\\.${wrong}\\b`).test(nextCss)) {
      nextCss = nextCss.replace(new RegExp(`\\.${wrong}\\b`, 'g'), `.${required}`);
    }

    if (nextHtml !== html || nextCss !== css) {
      fixes.push(`Hero section class \`${wrong}\` → \`${required}\``);
      return { html: nextHtml, css: nextCss, fixes };
    }
  }

  return { html, css, fixes: [] };
}

function fixClosingCtaTexture(css, composite) {
  const closing = (composite.section_order || []).find((s) => s.banner_slot === 'closing-cta');
  if (!closing || closing.bg_treatment !== 'texture-closing') {
    return { css, fixes: [] };
  }
  if (/blue-shadow-with-texture|var\(--pre-banner-texture\)/i.test(css)) {
    return { css, fixes: [] };
  }

  const patch = `
/* Auto-patched closing CTA texture */
.pre-banner-section:not(.bg-white) {
    background-color: #dce8ff;
    background-image:
        radial-gradient(circle at 88% -20%, rgba(0, 142, 245, 0.18) 0, transparent 55%),
        radial-gradient(circle at 25% 130%, rgba(153, 20, 255, 0.14) 0, transparent 50%),
        var(--pre-banner-texture, url('https://prezohoweb.zoho.com/sites/zweb/images/analytics/blue-shadow-with-texture.png'));
    background-position: center, center, center;
    background-repeat: no-repeat;
    background-size: cover, cover, 100% auto;
}
`;
  return {
    css: css + patch,
    fixes: ['Added textured background for closing pre-banner-section']
  };
}

function insertBeforeRightContentClose(html, block) {
  const rightOpen = html.search(/id=["']right-content["']/i);
  if (rightOpen < 0) return null;
  const rightDivStart = html.lastIndexOf('<div', rightOpen);
  if (rightDivStart < 0) return null;
  const rightDivEnd = findMatchingClose(html, rightDivStart, 'div');
  if (rightDivEnd < 0) return null;
  const closeTagStart = rightDivEnd - '</div>'.length;
  return html.slice(0, closeTagStart) + block + html.slice(closeTagStart);
}

function fixMissingCtas(html, composite) {
  const required = composite.cta_strings_required || [];
  const fixes = [];
  let next = html;
  const nestInToc = needsArticleTocLayout(composite);

  for (const cta of required) {
    if (next.toLowerCase().includes(cta.toLowerCase())) continue;

    const block = nestInToc
      ? `
                    <div class="cont-sec pre-banner-section bg-white t-center" data-auto-cta="true">
                        <div class="cta-btn-wrap">
                            <a href="#" class="cta-btn act-btn" aria-label="${cta}">${cta}</a>
                        </div>
                    </div>
`
      : `
        <section class="pre-banner-section bg-white p-90 t-center" data-auto-cta="true">
            <div class="content-wrap">
                <div class="cta-btn-wrap">
                    <a href="#" class="cta-btn act-btn" aria-label="${cta}">${cta}</a>
                </div>
            </div>
        </section>
`;

    if (nestInToc) {
      const nested = insertBeforeRightContentClose(next, block);
      if (nested) {
        next = nested;
        fixes.push(`Inserted missing CTA inside #right-content: "${cta}"`);
        continue;
      }
    }

    const faqIdx = next.search(/<section[^>]*class=["'][^"']*faq-section/i);
    if (faqIdx >= 0) {
      next = next.slice(0, faqIdx) + block + '\n        ' + next.slice(faqIdx);
    } else {
      const closeIdx = next.lastIndexOf('</div>', next.indexOf('<!-- ░░ FOOTER'));
      if (closeIdx >= 0) {
        next = next.slice(0, closeIdx) + block + '\n        ' + next.slice(closeIdx);
      }
    }
    fixes.push(`Inserted missing CTA: "${cta}"`);
  }

  return { html: next, fixes };
}

function fixOneClickCta(html, composite) {
  const mid = (composite.section_order || []).find(
    (s) => s.banner_slot === 'mid-cta' && s.bg_treatment === 'bg-white'
  );
  if (!mid) return { html, fixes: [] };

  const hasOneClick =
    /id=["']one-click-cta["'][^>]*\bbg-white\b/i.test(html) ||
    /class=["'][^"']*\bbg-white\b[^"']*["'][^>]*id=["']one-click-cta["']/i.test(html);
  if (hasOneClick) return { html, fixes: [] };

  let next = html.replace(
    /(<section[^>]*class=["'][^"']*pre-banner-section)([^"']*)(["'][^>]*id=["'])([^"']+)(["'])/i,
    (m, a, classes, idAttr, idVal, end) => {
      if (idVal === 'one-click-cta') return m;
      return `${a}${classes} bg-white${idAttr}one-click-cta${end}`;
    }
  );

  if (next === html) {
    next = html.replace(
      /(<section class="pre-banner-section)([^>]*)(>)/i,
      '$1 bg-white" id="one-click-cta"$2$3'
    );
  }

  return next !== html
    ? { html: next, fixes: ['Set mid-page CTA to pre-banner-section bg-white id="one-click-cta"'] }
    : { html, fixes: [] };
}

export function fixOutputDir(outputDir, options = {}) {
  const slug = options.slug || path.basename(outputDir);
  const indexPath = path.join(outputDir, 'index.html');
  const cssPath = path.join(outputDir, 'style.css');

  if (!fs.existsSync(indexPath)) {
    return { fixed: false, fixes: [], error: 'missing index.html' };
  }

  const resolved = resolveArchetypeForDir(slug, options.archetype);
  if (!resolved?.composite) {
    return { fixed: false, fixes: [], error: 'no archetype' };
  }

  let html = fs.readFileSync(indexPath, 'utf8');
  let css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf8') : '';
  const allFixes = [];

  const hero = fixHeroClass(html, css, resolved.composite);
  html = hero.html;
  css = hero.css;
  allFixes.push(...hero.fixes);

  if (needsArticleTocLayout(resolved.composite)) {
    const toc = fixArticleTocStructure(html);
    html = toc.html;
    allFixes.push(...toc.fixes);

    const faqToc = fixStripFaqFromToc(html);
    html = faqToc.html;
    allFixes.push(...faqToc.fixes);

    const peach = fixPeachSidebarCta(html);
    html = peach.html;
    allFixes.push(...peach.fixes);

    const tables = fixComparisonTableCss(css, html);
    css = tables.css;
    allFixes.push(...tables.fixes);
  }

  const texture = fixClosingCtaTexture(css, resolved.composite);
  css = texture.css;
  allFixes.push(...texture.fixes);

  const oneClick = fixOneClickCta(html, resolved.composite);
  html = oneClick.html;
  allFixes.push(...oneClick.fixes);

  const ctas = fixMissingCtas(html, resolved.composite);
  html = ctas.html;
  allFixes.push(...ctas.fixes);

  if (!allFixes.length) {
    return { fixed: false, fixes: [], archetype: resolved.id };
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  if (fs.existsSync(cssPath) || css) {
    fs.writeFileSync(cssPath, css, 'utf8');
  }

  return { fixed: true, fixes: allFixes, archetype: resolved.id };
}

if (isScriptMain(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  if (!args.slug) {
    console.error('Usage: node fix-output-archetype.mjs --slug <page-slug> [--archetype <id>]');
    process.exit(1);
  }

  const outputDir = path.join(ROOT, 'output', args.slug);
  const result = fixOutputDir(outputDir, { slug: args.slug, archetype: args.archetype });

  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }

  if (result.fixed) {
    console.log('OUTPUT AUTO-FIX');
    console.log('===============');
    console.log(`Archetype: ${result.archetype}`);
    result.fixes.forEach((f) => console.log(`  ✓ ${f}`));
  } else {
    console.log('No auto-fixes needed.');
  }

  if (args.noValidate) {
    process.exit(0);
  }

  const report = validateOutputDir(outputDir, { slug: args.slug, archetype: result.archetype });
  console.log(`\nPost-fix validation: ${report.pass ? 'PASS' : 'FAIL'}`);
  if (report.errors?.length) {
    report.errors.forEach((e) => console.log(`  ✗ ${e}`));
  }
  process.exit(report.pass ? 0 : 1);
}
