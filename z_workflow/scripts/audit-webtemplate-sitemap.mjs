#!/usr/bin/env node
/**
 * Fetch live Zoho webtemplate pages and enrich sitemap-categorized.json
 * with per-section layout descriptions for section-wise compose matching.
 *
 * Usage:
 *   node z_workflow/scripts/audit-webtemplate-sitemap.mjs
 *   node z_workflow/scripts/audit-webtemplate-sitemap.mjs --limit 10
 *   node z_workflow/scripts/audit-webtemplate-sitemap.mjs --resume
 *   node z_workflow/scripts/audit-webtemplate-sitemap.mjs --category "AI & Intelligence"
 */

import fs from 'fs';
import path from 'path';
import { ROOT, isScriptMain } from './workflow-paths.mjs';

const SITEMAP_PATH = path.join(ROOT, 'webtemplate', 'sitemap-categorized.json');
const CACHE_PATH = path.join(ROOT, 'webtemplate', '.sitemap-audit-cache.json');

const SECTION_PATTERNS = [
  { type: 'hero', patterns: [/banner-section/i, /banner-main/i, /^banner$/i, /hero/i] },
  { type: 'cta', patterns: [/pre-banner/i, /cta-banner/i, /cta-section/i] },
  { type: 'comparison', patterns: [/desk-connect/i, /comparison/i, /vs-/i, /before-after/i, /problem-section/i] },
  { type: 'carousel', patterns: [/sampleDashboard/i, /slider/i, /carousel/i, /marquee/i, /report-slider/i] },
  { type: 'steps', patterns: [/threeSimpleSteps/i, /steps-section/i, /step-/i, /how-to/i] },
  { type: 'features', patterns: [/everything-opens/i, /features/i, /icon-box/i, /box-icon/i, /meet-section/i, /solution/i] },
  { type: 'stats', patterns: [/za-counts/i, /stats/i, /counts-section/i, /promo-section/i] },
  { type: 'testimonials', patterns: [/testimonial/i, /zwc-nav/i] },
  { type: 'recognition', patterns: [/recognition/i, /reported-section/i, /gartner/i, /rating/i, /trust-section/i] },
  { type: 'faq', patterns: [/faq/i, /z-accordian/i, /accordion/i] },
  { type: 'pricing', patterns: [/pricing/i, /plan-/i] },
  { type: 'tabs', patterns: [/tabsection/i, /tabs-section/i, /features-tab/i] },
  { type: 'content-blocks', patterns: [/dashboard-wrapper/i, /zigzag/i, /content-block/i, /insurance-analytics/i, /left-content/i, /right-content/i] },
  { type: 'form', patterns: [/crm-form/i, /signup/i, /webform/i, /pop-up/i] },
  { type: 'media', patterns: [/video/i, /iframe-section/i] },
  { type: 'glossary', patterns: [/glossary/i, /definition/i] },
  { type: 'trust', patterns: [/trusted-icon/i, /marquee-wrapper/i, /za-brandsCounts/i, /brandsCounts/i] },
  { type: 'sticky-stack', patterns: [/sticky-card-section/i, /scroll-card/i, /sticky-section/i] },
  { type: 'journey', patterns: [/za-journey-section/i, /journey-section/i] }
];

const FETCH_OPTS = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml'
  },
  redirect: 'follow'
};

function inferSectionType(className) {
  for (const { type, patterns } of SECTION_PATTERNS) {
    if (patterns.some((p) => p.test(className))) return type;
  }
  return 'general';
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractPageTopic(html) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return stripTags(h1[1]).slice(0, 120);
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title) return stripTags(title[1]).slice(0, 120);
  return '';
}

function extractSectionBlocks(html) {
  const blocks = [];
  const re = /<section[^>]*class=["']([^"']+)["'][^>]*>([\s\S]*?)<\/section>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const classes = m[1].split(/\s+/).filter(Boolean);
    const primary = classes[0];
    if (!primary || /slant/i.test(primary)) continue;
    blocks.push({ classes, primary, inner: m[2] });
  }
  return blocks;
}

function inferLayout(primary, inner, classes) {
  const blob = `${primary} ${classes.join(' ')} ${inner.slice(0, 4000)}`;

  if (/left-wrapper|left-content|banner-left|text-left/i.test(blob) &&
      /right-wrapper|right-content|banner-right|image-right/i.test(blob)) {
    const reversed = /flex-row-reverse|order-2|right-wrapper.*left/i.test(blob);
    return reversed ? 'split — image left, text right' : 'split — text left, image right';
  }
  if (/dashboard-wrapper|zigzag|left-content|right-content/i.test(blob)) {
    return 'zigzag — alternating text/image rows';
  }
  if (/desk-connect|comparison-table|before-after|vs-/i.test(blob)) return '2-column comparison table';
  if (/threeSimpleSteps|steps-section|step-/i.test(blob)) return 'numbered steps timeline';
  if (/slick|sampleDashboard|report-slider|marquee|carousel/i.test(blob)) return 'horizontal carousel / slider';
  if (/box-icon|icon-wrapper|everything-opens|meet-features|icon-box/i.test(blob)) return 'icon grid (multi-column cards)';
  if (/faq-section|z-accordian|accordion/i.test(blob)) return 'accordion FAQ list';
  if (/pre-banner|cta-banner|pre-banner-cta/i.test(blob)) return 'centered full-width CTA band';
  if (/tabsection|tabs-section|features-tab/i.test(blob)) return 'tabbed content panels';
  if (/sticky-card|scroll-card|sticky-section/i.test(blob)) return 'sticky scroll stack';
  if (/za-journey|journey-section/i.test(blob)) return 'journey / timeline stack';
  if (/pricing|plan-/i.test(blob)) return 'pricing tier cards';
  if (/testimonial|zwc-nav/i.test(blob)) return 'testimonial cards carousel';
  if (/reported-section|recognition|rating-table/i.test(blob)) return 'analyst badges + rating table';
  if (/za-counts|counts-section|promo-section/i.test(blob)) return 'stat counters row';
  if (/banner-section|banner-main|^banner$/i.test(primary)) return 'hero banner block';
  if (/video|iframe/i.test(blob)) return 'embedded video / media block';
  if (/glossary|definition/i.test(blob)) return 'glossary definition list';

  const hasGrid = /col-|grid|flex-wrap|meet-section/i.test(blob);
  if (hasGrid) return 'multi-column content grid';

  return 'standard content section';
}

function countElements(inner, tag) {
  return (inner.match(new RegExp(`<${tag}[\\s>]`, 'gi')) || []).length;
}

function buildSectionDescription(order, primary, classes, inner) {
  const type = inferSectionType(primary);
  const layout = inferLayout(primary, inner, classes);
  const h2 = inner.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  const heading = h2 ? stripTags(h2[1]).slice(0, 80) : null;
  const ctaCount = (inner.match(/cta-btn|act-btn|signupbtn|get-started/i) || []).length;
  const imgCount = countElements(inner, 'img');
  const hasVideo = /<iframe|<video/i.test(inner);

  const parts = [`§${order} ${type}`];
  parts.push(primary);
  parts.push(layout);
  if (heading) parts.push(`heading: "${heading}"`);
  if (ctaCount) parts.push(`${ctaCount} CTA`);
  if (imgCount) parts.push(`${imgCount} img`);
  if (hasVideo) parts.push('video');

  return {
    order,
    type,
    class: primary,
    layout,
    description: parts.join(' · ')
  };
}

function analyzeHtml(html) {
  const blocks = extractSectionBlocks(html);
  const sections = blocks.map((b, i) =>
    buildSectionDescription(i + 1, b.primary, b.classes, b.inner)
  );

  const sectionTypes = [...new Set(sections.map((s) => s.type))];
  const layouts = [...new Set(sections.map((s) => s.layout))];

  return {
    page_topic: extractPageTopic(html),
    section_count: sections.length,
    section_types: sectionTypes,
    layout_styles: layouts,
    sections,
    section_summary: sections.map((s) => s.description).join(' | ')
  };
}

async function fetchHtml(url, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, FETCH_OPTS);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(1000 * (attempt + 1));
    }
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { limit: 0, resume: false, category: null, concurrency: 5, delay: 300 };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit') opts.limit = parseInt(args[++i], 10) || 0;
    else if (args[i] === '--resume') opts.resume = true;
    else if (args[i] === '--category') opts.category = args[++i];
    else if (args[i] === '--concurrency') opts.concurrency = parseInt(args[++i], 10) || 5;
    else if (args[i] === '--delay') opts.delay = parseInt(args[++i], 10) || 300;
  }
  return opts;
}

function loadCache() {
  if (!fs.existsSync(CACHE_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

function cacheKey(url) {
  return url;
}

async function processEntry(entry, cache, opts) {
  const key = cacheKey(entry.url);
  if (opts.resume && cache[key]?.sections?.length) {
    return { ...entry, ...cache[key], audit_status: 'cached' };
  }

  try {
    const html = await fetchHtml(entry.url);
    const analysis = analyzeHtml(html);
    const enriched = {
      ...entry,
      ...analysis,
      audit_status: 'ok',
      audited_at: new Date().toISOString().slice(0, 10)
    };
    cache[key] = {
      page_topic: analysis.page_topic,
      section_count: analysis.section_count,
      section_types: analysis.section_types,
      layout_styles: analysis.layout_styles,
      sections: analysis.sections,
      section_summary: analysis.section_summary,
      audit_status: 'ok',
      audited_at: enriched.audited_at
    };
    return enriched;
  } catch (err) {
    const failed = {
      ...entry,
      audit_status: 'error',
      audit_error: err.message,
      audited_at: new Date().toISOString().slice(0, 10)
    };
    cache[key] = {
      audit_status: 'error',
      audit_error: err.message,
      audited_at: failed.audited_at
    };
    return failed;
  }
}

async function runPool(items, fn, concurrency) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

export async function auditWebtemplateSitemap(opts = {}) {
  const sitemap = JSON.parse(fs.readFileSync(SITEMAP_PATH, 'utf8'));
  const cache = loadCache();
  const merged = { ...opts, ...parseArgs() };

  const meta = {
    version: '2.0',
    generated_at: new Date().toISOString(),
    description: 'Live Zoho webtemplate links with per-section layout descriptions for section-wise compose matching.',
    total_urls: 0,
    audited_ok: 0,
    audited_error: 0,
    section_schema: {
      order: '1-based position on page',
      type: 'section type (hero, features, faq, …)',
      class: 'primary BEM section class',
      layout: 'layout style (split, zigzag, carousel, …)',
      description: 'human-readable one-liner for matching writer brief sections'
    }
  };

  const output = {};
  const flat = [];

  for (const [category, entries] of Object.entries(sitemap)) {
    if (category.startsWith('_') || category === 'version' || category === 'generated_at') continue;
    if (merged.category && category !== merged.category) {
      output[category] = entries;
      continue;
    }
    for (const entry of entries) {
      flat.push({ category, entry });
    }
  }

  let toProcess = flat;
  if (merged.limit > 0) toProcess = flat.slice(0, merged.limit);
  else if (merged.resume) {
    toProcess = flat.filter(({ entry }) => {
      const key = cacheKey(entry.url);
      return !(cache[key]?.sections?.length);
    });
  }

  console.log(`Auditing ${toProcess.length} webtemplate URLs (concurrency ${merged.concurrency})…`);

  let done = 0;
  const enrichedFlat = await runPool(
    toProcess,
    async ({ category, entry }) => {
      const result = await processEntry(entry, cache, merged);
      done++;
      if (done % 25 === 0 || done === toProcess.length) {
        saveCache(cache);
        console.log(`  … ${done}/${toProcess.length}`);
      }
      return { category, entry: result };
    },
    merged.concurrency
  );

  saveCache(cache);

  // Merge enriched entries back by URL (never replace whole category)
  const enrichedByUrl = new Map();
  for (const { entry } of enrichedFlat) {
    enrichedByUrl.set(entry.url, entry);
  }

  for (const [category, entries] of Object.entries(sitemap)) {
    if (category.startsWith('_') || category === 'version' || category === 'generated_at') continue;
    if (merged.category && category !== merged.category) {
      output[category] = entries;
      continue;
    }
    output[category] = entries.map((entry) => enrichedByUrl.get(entry.url) || entry);
  }

  // Stats
  let total = 0;
  let ok = 0;
  let err = 0;
  for (const entries of Object.values(output)) {
    if (!Array.isArray(entries)) continue;
    for (const e of entries) {
      total++;
      if (e.audit_status === 'ok' || e.audit_status === 'cached') ok++;
      else if (e.audit_status === 'error') err++;
    }
  }

  meta.total_urls = total;
  meta.audited_ok = ok;
  meta.audited_error = err;

  const finalOutput = { _meta: meta, ...output };
  fs.writeFileSync(SITEMAP_PATH, JSON.stringify(finalOutput, null, 2) + '\n');

  console.log(`\nDone. ${ok} ok, ${err} errors, ${total} total.`);
  console.log(`Updated: ${SITEMAP_PATH}`);
  return { total, ok, err };
}

if (isScriptMain(import.meta.url)) {
  auditWebtemplateSitemap().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
