#!/usr/bin/env node
/**
 * Scores writer briefs against site-catalog.json using workflow Phase 0-C rules.
 *
 * Usage:
 *   node z_workflow/scripts/match-sites.mjs --brief "sales dashboard examples landing"
 *   node z_workflow/scripts/match-sites.mjs --validate
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKFLOW = path.join(__dirname, '..');

const VALIDATION_SET = [
  {
    id: 'integration-credit',
    label: 'Integration + credit offer (Books)',
    page_type: 'integration-campaign',
    product_name: 'Zoho Analytics',
    keywords: ['zoho books', 'integration', 'financial', '$100', 'credit', 'reports'],
    sections_required: ['hero', 'comparison', 'carousel', 'steps', 'features', 'cta', 'faq'],
    expected_primary: 'Coupon page'
  },
  {
    id: 'dashboard-examples',
    label: 'Dashboard examples landing',
    page_type: 'feature-page',
    product_name: 'Zoho Analytics',
    keywords: ['executive dashboards', 'sales dashboard', 'examples', 'templates', 'pipeline', 'revenue'],
    sections_required: ['hero', 'content-blocks', 'steps', 'features', 'cta', 'faq'],
    expected_primary: 'Executive-Dashboards'
  },
  {
    id: 'finance-vertical',
    label: 'Finance vertical BI',
    page_type: 'feature-page',
    product_name: 'Zoho Analytics',
    keywords: ['bi finance', 'finance', 'financial', 'business intelligence'],
    sections_required: ['hero', 'features', 'stats', 'cta'],
    expected_primary: 'BI Finance'
  },
  {
    id: 'glossary',
    label: 'Glossary page',
    page_type: 'glossary',
    product_name: 'Zoho Analytics',
    keywords: ['glossary embedded bi', 'glossary', 'embedded bi', 'definition'],
    sections_required: ['hero', 'content-blocks', 'faq'],
    expected_primary: 'Glossary - Embedded BI'
  },
  {
    id: 'comparison',
    label: 'Product comparison',
    page_type: 'comparison-page',
    product_name: 'Zoho Analytics',
    keywords: ['comparison page', 'comparison', 'vs', 'alternative'],
    sections_required: ['hero', 'comparison', 'features', 'cta', 'faq'],
    expected_primary: 'comparison page'
  },
  {
    id: 'pricing',
    label: 'Pricing page',
    page_type: 'pricing',
    product_name: 'Zoho Analytics',
    keywords: ['pricing', 'plans', 'subscription'],
    sections_required: ['hero', 'pricing', 'faq', 'cta'],
    expected_primary: 'Pricing page'
  },
  {
    id: 'csv-tool',
    label: 'CSV dashboard tool',
    page_type: 'tool-page',
    product_name: 'Zoho Analytics',
    keywords: ['csv to dashboard tools', 'csv', 'dashboard', 'generator', 'free tool'],
    sections_required: ['hero', 'features', 'faq', 'cta'],
    expected_primary: 'CSV to Dashboard Tools'
  },
  {
    id: 'embedded-analytics',
    label: 'Embedded analytics feature',
    page_type: 'feature-page',
    product_name: 'Zoho Analytics Embedded',
    keywords: ['embedded analytics', 'embedded', 'white label', 'api'],
    sections_required: ['hero', 'features', 'cta'],
    expected_primary: 'Embedded Analytics'
  },
  {
    id: 'case-study',
    label: 'Case study',
    page_type: 'case-study',
    product_name: 'Zoho Analytics',
    keywords: ['case study', 'customer', 'success story'],
    sections_required: ['hero', 'content-blocks', 'testimonials'],
    expected_primary: 'case-study'
  },
  {
    id: 'marketing-bi',
    label: 'BI for Marketing',
    page_type: 'feature-page',
    product_name: 'Zoho Analytics',
    keywords: ['bi marketing', 'marketing', 'campaign', 'analytics'],
    sections_required: ['hero', 'features', 'testimonials', 'cta'],
    expected_primary: 'BI-Marketing'
  }
];

function loadCatalog() {
  return JSON.parse(fs.readFileSync(path.join(WORKFLOW, 'site-catalog.json'), 'utf8'));
}

function normalizeToken(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function siteNameKeywordHits(keywords, siteName) {
  const name = normalizeToken(siteName);
  let hits = 0;
  let weight = 0;

  const phrases = (keywords || [])
    .map((k) => normalizeToken(k))
    .filter((k) => k.length > 2)
    .sort((a, b) => b.length - a.length);

  for (const kw of phrases) {
    if (name.includes(kw)) {
      hits++;
      weight += kw.split(' ').length >= 3 ? 4 : kw.split(' ').length >= 2 ? 2.5 : 1.5;
    }
  }

  for (const raw of keywords || []) {
    const kw = normalizeToken(raw);
    if (kw.length < 2) continue;
    if (name.includes(kw)) continue;
    const parts = kw.split(' ').filter((p) => p.length > 2);
    const partHits = parts.filter((p) => name.includes(p)).length;
    if (partHits === parts.length && parts.length > 0) {
      hits++;
      weight += partHits * 0.75;
    } else if (partHits > 0) {
      weight += partHits * 0.5;
    }
  }
  return { hits, weight };
}

function namePhraseBonus(keywords, siteName) {
  const name = normalizeToken(siteName);
  let bonus = 0;
  const seen = new Set();
  for (const raw of keywords || []) {
    const kw = normalizeToken(raw);
    if (kw.length < 4 || !name.includes(kw)) continue;
    if (seen.has(kw)) continue;
    seen.add(kw);
    const words = kw.split(' ').filter(Boolean);
    if (words.length >= 3) bonus += 2;
    else if (words.length === 2) bonus += 1.25;
  }
  return Math.min(2, bonus);
}

function topicScore(brief, site) {
  const briefText = normalizeToken([
    brief.product_name,
    brief.page_title || '',
    ...(brief.keywords || [])
  ].join(' '));

  const siteText = normalizeToken([
    site.site_name,
    site.product_focus,
    site.page_topic,
    ...(site.sections || []),
    ...(site.keywords || [])
  ].join(' '));

  const nameHits = siteNameKeywordHits(brief.keywords || [], site.site_name);
  let score = Math.min(3, nameHits.weight);

  const briefTokens = briefText.split(/\s+/).filter((t) => t.length > 2);
  let contentHits = 0;
  for (const token of briefTokens) {
    if (siteText.includes(token)) contentHits++;
  }
  score += Math.min(1.5, contentHits * 0.35);

  const productRoot = normalizeToken(brief.product_name || '').split(' ')[0];
  if (productRoot && siteText.includes(productRoot)) score += 0.5;

  return Math.min(4, Math.round(score * 10) / 10);
}

function pageTypeScore(briefType, siteType, siteName, keywords) {
  let score = 0;
  if (!briefType || !siteType) return 0;
  if (briefType === siteType) score = 2;
  else {
    const compatible = {
      'landing-page': ['product-page', 'feature-page'],
      'product-page': ['landing-page', 'feature-page'],
      'feature-page': ['landing-page', 'product-page'],
      'integration-campaign': ['landing-page', 'feature-page'],
      'tool-page': ['feature-page', 'landing-page']
    };
    if (compatible[briefType]?.includes(siteType)) score = 1;
  }

  const name = normalizeToken(siteName);
  if (briefType === 'comparison-page' && name.includes('comparison')) score = Math.min(2, score + 0.5);
  if (briefType === 'glossary' && name.includes('glossary')) score = Math.min(2, score + 0.5);
  if (briefType === 'tool-page' && (name.includes('csv') || name.includes('dashboard tools'))) score = Math.min(2, score + 1);
  if (briefType === 'integration-campaign' && (name.includes('coupon') || name.includes('inventory'))) score = Math.min(2, score + 0.25);

  return Math.min(2, score);
}

function sectionScore(required, siteSections) {
  if (!required?.length) return 0;
  const have = new Set(siteSections || []);
  const overlap = required.filter((s) => have.has(s)).length;
  const ratio = overlap / required.length;
  if (ratio >= 0.8) return 2;
  if (ratio >= 0.5) return 1;
  return 0;
}

function toneScore(briefTone, siteTone) {
  if (!briefTone || !siteTone) return 0;
  if (briefTone === siteTone) return 1;
  const close = { conversational: 'professional', professional: 'conversational', formal: 'professional' };
  return close[briefTone] === siteTone ? 1 : 0;
}

function complexityScore(briefSections, site) {
  const n = briefSections?.length || 5;
  const s = site.section_count || 0;
  const diff = Math.abs(n - s);
  if (diff <= 2) return 1;
  if (diff <= 5) return 0.5;
  return 0;
}

function scoreSite(brief, site) {
  const t = topicScore(brief, site);
  const p = pageTypeScore(brief.page_type, site.page_type, site.site_name, brief.keywords);
  const s = sectionScore(brief.sections_required, site.sections);
  const tone = toneScore(brief.tone, site.tone);
  const c = complexityScore(brief.sections_required, site);
  const phrase = namePhraseBonus(brief.keywords || [], site.site_name);
  const total = Math.round((t + p + s + tone + c + phrase) * 10) / 10;
  return {
    site_name: site.site_name,
    score: Math.min(10, total),
    phrase_bonus: phrase,
    breakdown: { topic: t, page_type: p, sections: s, tone, complexity: c, phrase }
  };
}

function rankBrief(brief) {
  const catalog = loadCatalog();
  const scored = catalog.sites
    .map((site) => {
      const result = scoreSite(brief, site);
      const nameWeight = siteNameKeywordHits(brief.keywords || [], site.site_name).weight;
      return { ...result, nameWeight };
    })
    .sort((a, b) => b.score - a.score || b.phrase_bonus - a.phrase_bonus || b.nameWeight - a.nameWeight);
  return scored;
}

function runValidate() {
  const results = [];
  let correct = 0;

  for (const item of VALIDATION_SET) {
    const ranked = rankBrief(item);
    const top = ranked[0];
    const match = top.site_name === item.expected_primary;
    if (match) correct++;
    results.push({
      id: item.id,
      label: item.label,
      expected: item.expected_primary,
      got: top.site_name,
      score: top.score,
      match,
      top3: ranked.slice(0, 3).map((r) => `${r.site_name} (${r.score})`)
    });
  }

  const pct = Math.round((correct / VALIDATION_SET.length) * 100);
  const report = {
    generated_at: new Date().toISOString(),
    total: VALIDATION_SET.length,
    correct,
    accuracy_pct: pct,
    pass: pct >= 90,
    results
  };

  fs.writeFileSync(path.join(WORKFLOW, 'validation-report.json'), JSON.stringify(report, null, 2));

  console.log('VALIDATION BATCH RESULTS');
  console.log('========================');
  for (const r of results) {
    console.log(`${r.match ? '✅' : '❌'} ${r.label}`);
    console.log(`   Expected: ${r.expected}`);
    console.log(`   Got:      ${r.got} (${r.score}/10)`);
    console.log(`   Top 3:    ${r.top3.join(' · ')}`);
  }
  console.log('');
  console.log(`Accuracy: ${correct}/${VALIDATION_SET.length} (${pct}%) — ${pct >= 90 ? 'PASS' : 'NEEDS TUNING'}`);

  return report;
}

const args = process.argv.slice(2);
if (args.includes('--validate')) {
  runValidate();
} else {
  const briefIdx = args.indexOf('--brief');
  const briefText = briefIdx >= 0 ? args.slice(briefIdx + 1).join(' ') : '';
  const brief = {
    page_type: 'landing-page',
    product_name: 'Zoho Analytics',
    keywords: briefText.toLowerCase().split(/[\s,]+/).filter(Boolean),
    sections_required: ['hero', 'features', 'cta']
  };
  const ranked = rankBrief(brief);
  console.log('TOP MATCHES for:', briefText || '(default brief)');
  ranked.slice(0, 5).forEach((r, i) => {
    console.log(`  #${i + 1}  ${r.site_name}  ${r.score}/10  ${JSON.stringify(r.breakdown)}`);
  });
}
