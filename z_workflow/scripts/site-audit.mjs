#!/usr/bin/env node
/**
 * SITE_AUDIT — scans WEB-PAGES reference sites and writes:
 *   z_workflow/site-catalog.json
 *   z_workflow/section-index.json
 *   z_workflow/team-dna.json
 *   z_workflow/audit-report.txt
 *
 * Usage: node z_workflow/scripts/site-audit.mjs
 */

import fs from 'fs';
import path from 'path';
import {
  ROOT, WORKFLOW, getReferenceSiteEntries, isScriptMain
} from './workflow-paths.mjs';

const SECTION_PATTERNS = [
  { type: 'cta', patterns: [/pre-banner/i, /cta-banner/i, /cta-section/i] },
  { type: 'hero', patterns: [/banner-section/i, /banner-main/i, /hero/i, /^banner$/i] },
  { type: 'comparison', patterns: [/desk-connect/i, /comparison/i, /vs-/i, /before-after/i, /problem-section/i] },
  { type: 'carousel', patterns: [/sampleDashboard/i, /slider/i, /carousel/i, /marquee/i] },
  { type: 'steps', patterns: [/threeSimpleSteps/i, /steps-section/i, /step-/i, /how-to/i] },
  { type: 'features', patterns: [/everything-opens/i, /features/i, /icon-box/i, /box-icon/i, /meet-section/i, /solution/i] },
  { type: 'stats', patterns: [/za-counts/i, /stats/i, /counts-section/i, /promo-section/i] },
  { type: 'testimonials', patterns: [/testimonial/i, /zwc-nav/i] },
  { type: 'recognition', patterns: [/recognition/i, /reported-section/i, /gartner/i, /rating/i] },
  { type: 'faq', patterns: [/faq/i, /z-accordian/i, /accordion/i] },
  { type: 'pricing', patterns: [/pricing/i, /plan-/i] },
  { type: 'tabs', patterns: [/tabsection/i, /tabs-section/i, /features-tab/i] },
  { type: 'content-blocks', patterns: [/dashboard-wrapper/i, /zigzag/i, /content-block/i, /insurance-analytics/i] },
  { type: 'form', patterns: [/crm-form/i, /signup/i, /webform/i, /pop-up/i] },
  { type: 'media', patterns: [/video/i, /iframe/i] },
  { type: 'glossary', patterns: [/glossary/i, /definition/i] },
  { type: 'trust', patterns: [/trusted-icon/i, /marquee-wrapper/i, /za-brandsCounts/i] }
];

const LAYOUT_PATTERNS = [
  { style: 'split', patterns: [/banner-section/i, /banner-main/i, /left-wrapper/i] },
  { style: '2col-comparison', patterns: [/desk-connect/i, /comparison-table/i] },
  { style: 'carousel', patterns: [/slick/i, /sampleDashboard/i, /report-slider/i] },
  { style: '3-step-timeline', patterns: [/threeSimpleSteps/i] },
  { style: 'icon-grid', patterns: [/everything-opens/i, /icon-wrapper/i, /box-icon/i] },
  { style: 'zigzag', patterns: [/dashboard-wrapper/i, /left-content/i, /right-content/i] },
  { style: 'sticky-stack', patterns: [/sticky-card-section/i, /scroll-card/i, /sticky-section/i] },
  { style: 'journey-stack', patterns: [/za-journey-section/i, /za-journey-box/i] },
  { style: 'tabbed-steps', patterns: [/steps-section/i, /steps-tab/i] },
  { style: 'accordion', patterns: [/faq-section/i, /z-accordian/i] },
  { style: 'centered-fullwidth', patterns: [/pre-banner-section/i, /pre-banner-cta/i] },
  { style: '3col-grid', patterns: [/recognition-cards/i, /meet-features/i] },
  { style: 'full-bleed', patterns: [/dark/i, /sampleDashboard-section/i] }
];

const PAGE_TYPE_RULES = [
  { type: 'glossary', test: (name, html) => /glossary/i.test(name) || /whitelabel/i.test(name) },
  { type: 'comparison-page', test: (name) => /comparison|powerbi/i.test(name) },
  { type: 'case-study', test: (name) => /case-study/i.test(name) },
  { type: 'integration-campaign', test: (name, html) => /coupon|review-landing|inventory-decision/i.test(name) || /\$100|wallet credit|claim my/i.test(html) },
  { type: 'pricing', test: (name) => /pricing/i.test(name) },
  { type: 'event', test: (name) => /event|webinar|ipl/i.test(name) },
  { type: 'tool-page', test: (name) => /csv|dashboard tools|pie-chart|create-dashboard/i.test(name) },
  { type: 'landing-page', test: (name) => /homepage|homepage-2026/i.test(name) },
  { type: 'feature-page', test: (name) => /executive|embedded|enterprise|realtime|generative|agentic|spreadsheet|collaborative|marketing-agencies|bi-marketing|bi finance|organization/i.test(name) },
  { type: 'product-page', test: (name) => /business-intelligence|main feature|data visualization|data-preparations/i.test(name) }
];

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function findCssFile(dir) {
  for (const name of ['style.css', 'styles.css']) {
    const p = path.join(dir, name);
    if (fs.existsSync(p)) return name;
  }
  return null;
}

function extractSections(html) {
  const sections = new Set();
  const classMatches = html.matchAll(/<section[^>]*class=["']([^"']+)["']/gi);
  for (const m of classMatches) {
    const classes = m[1].split(/\s+/);
    for (const cls of classes) {
      for (const { type, patterns } of SECTION_PATTERNS) {
        if (patterns.some((p) => p.test(cls))) {
          sections.add(type);
        }
      }
    }
  }
  return [...sections];
}

function extractSectionClasses(html) {
  const entries = [];
  const matches = html.matchAll(/<section[^>]*class=["']([^"']+)["']/gi);
  for (const m of matches) {
    const primary = m[1].split(/\s+/)[0];
    if (primary && !/slant/i.test(primary)) {
      entries.push(primary);
    }
  }
  return entries;
}

function inferSectionType(className) {
  for (const { type, patterns } of SECTION_PATTERNS) {
    if (patterns.some((p) => p.test(className))) return type;
  }
  return null;
}

function inferLayouts(html, sectionClasses) {
  const layouts = new Set();
  const blob = html + ' ' + sectionClasses.join(' ');
  for (const { style, patterns } of LAYOUT_PATTERNS) {
    if (patterns.some((p) => p.test(blob))) layouts.add(style);
  }
  return [...layouts];
}

function inferPageType(folderName, html) {
  for (const rule of PAGE_TYPE_RULES) {
    if (rule.test(folderName, html)) return rule.type;
  }
  return 'landing-page';
}

function inferProductFocus(folderName, html) {
  const text = (folderName + ' ' + html).toLowerCase();
  if (/zoho books|books/i.test(text)) return 'Zoho Analytics + Zoho Books';
  if (/zoho desk|desk/i.test(text)) return 'Zoho Analytics + Zoho Desk';
  if (/zoho crm|crm/i.test(text)) return 'Zoho Analytics + CRM';
  if (/bigin/i.test(text)) return 'Zoho Analytics + Zoho Bigin';
  if (/power\s*bi|powerbi/i.test(text)) return 'Zoho Analytics vs Power BI';
  if (/embedded/i.test(text)) return 'Zoho Analytics Embedded';
  if (/finance|bi finance/i.test(text)) return 'Zoho Analytics BI Finance';
  if (/marketing/i.test(text)) return 'Zoho Analytics BI Marketing';
  if (/glossary/i.test(text)) return 'Zoho Analytics Glossary';
  if (/dashboard/i.test(text)) return 'Zoho Analytics Dashboards';
  return 'Zoho Analytics';
}

function extractPageTopic(html) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) {
    return h1[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 120);
  }
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title) return title[1].replace(/\s+/g, ' ').trim().slice(0, 120);
  return '';
}

function extractPrimaryColor(css) {
  const rootBlock = css.match(/:root\s*\{([^}]+)\}/);
  const search = rootBlock ? rootBlock[1] : css.slice(0, 3000);
  const vars = [
    ...search.matchAll(/--(?:primary-color|color-primary|primary-bg)[^:]*:\s*(#[0-9a-fA-F]{3,8})/g)
  ];
  if (vars.length) return vars[0][1];
  const hexes = [...css.matchAll(/#[0-9a-fA-F]{6}\b/g)].map((m) => m[0]);
  const counts = {};
  for (const h of hexes) counts[h] = (counts[h] || 0) + 1;
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || '#008EF5';
}

function hasDarkSections(css, html) {
  return /#262626|#0a0b17|#005[dD]40|\.dark\b|sampleDashboard-section|pre-banner-cta/i.test(css + html);
}

function inferComplexity(sectionCount) {
  if (sectionCount <= 5) return 'simple';
  if (sectionCount <= 10) return 'moderate';
  return 'complex';
}

function inferTone(html) {
  const t = html.toLowerCase();
  if (/claim my|\$100|wallet credit/i.test(t)) return 'conversational';
  if (/enterprise|gartner|compliance/i.test(t)) return 'formal';
  if (/ask zia|ai agent|generative/i.test(t)) return 'technical';
  return 'professional';
}

function complianceCheck(html, css) {
  const usesPuvi = /--zf-primary|Zoho_Puvi|var\(--primaryfont/i.test(css + html);
  const hasBem = /--|__/.test(css) || /\w+-\w+__\w+/.test(css);
  const inlineStyles = (html.match(/\sstyle="/gi) || []).length;
  const numericWeight = (css.match(/font-weight:\s*[67]00|font-weight:\s*bold/i) || []).length;
  return { usesPuvi, hasBem, inlineStyles, numericWeight };
}

function getReferenceSites() {
  return getReferenceSiteEntries();
}

function buildSectionIndex(sites) {
  const coverage = {};

  for (const site of sites) {
    for (const cls of site.section_classes) {
      const type = inferSectionType(cls);
      if (!type) continue;
      if (!coverage[type]) coverage[type] = [];
      coverage[type].push({
        site_name: site.site_name,
        class: cls,
        score: site.sections.includes(type) ? site.section_count : site.section_count * 0.5
      });
    }
  }

  const index = {};
  for (const [type, entries] of Object.entries(coverage)) {
    entries.sort((a, b) => b.score - a.score || b.site_name.localeCompare(a.site_name));
    const best = entries[0];
    index[type] = {
      best: best.site_name,
      class: best.class,
      alternates: [...new Set(entries.slice(1, 4).map((e) => e.site_name))],
      example_count: entries.length
    };
  }

  // Merge catalog-level section tags when class extraction missed a type
  for (const site of sites) {
    for (const type of site.sections) {
      if (index[type]) continue;
      index[type] = {
        best: site.site_name,
        class: site.section_classes.find((c) => inferSectionType(c) === type) || type,
        alternates: [],
        example_count: 1
      };
    }
  }

  return index;
}

function buildTeamDna(sites) {
  const colors = sites.map((s) => s.primary_color).filter(Boolean);
  const colorCounts = {};
  colors.forEach((c) => { colorCounts[c] = (colorCounts[c] || 0) + 1; });

  const allLayouts = sites.flatMap((s) => s.layout_variety);
  const layoutCounts = {};
  allLayouts.forEach((l) => { layoutCounts[l] = (layoutCounts[l] || 0) + 1; });

  return {
    last_updated: new Date().toISOString().slice(0, 10),
    synthesis_threshold: 6,
    synthesis_note: 'When top site scores below synthesis_threshold, synthesise from team_dna + section-index alternates.',
    design_tokens: {
      color_primary: '#008EF5',
      color_accent: '#e42527',
      color_dark_bg: '#262626',
      color_light_bg: '#f8f9fc',
      font_display: 'var(--zf-primary-bold)',
      font_body: 'var(--zf-primary-regular)',
      font_semibold: 'var(--zf-primary-semibold)',
      spacing_section_v: '90px',
      border_radius_btn: '4px',
      border_radius_card: '12px',
      transition_base: 'all .5s ease'
    },
    team_flavour: 'Split heroes with .content-wrap, BEM section classes, Puvi via CSS variables, 7 max-width breakpoints, jQuery + Slick for carousels, .z-accordian FAQ pattern, .pre-banner-section CTAs.',
    dominant_colors: Object.entries(colorCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([hex, n]) => ({ hex, count: n })),
    common_layouts: Object.entries(layoutCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([style, n]) => ({ style, count: n })),
    reference_css: '../../source/zohocustom.css',
    reference_product_css: '../../source/product.css'
  };
}

function topicCoverage(sites) {
  const buckets = {
    'BI / Analytics': 0,
    'Feature pages': 0,
    'Comparison pages': 0,
    'Case studies': 0,
    'Product landing': 0,
    'Glossary / Docs': 0,
    'Integration campaigns': 0,
    'Pricing': 0
  };
  for (const s of sites) {
    if (s.page_type === 'glossary') buckets['Glossary / Docs']++;
    else if (s.page_type === 'comparison-page') buckets['Comparison pages']++;
    else if (s.page_type === 'case-study') buckets['Case studies']++;
    else if (s.page_type === 'integration-campaign') buckets['Integration campaigns']++;
    else if (s.page_type === 'pricing') buckets['Pricing']++;
    else if (s.page_type === 'feature-page') buckets['Feature pages']++;
    else if (s.page_type === 'landing-page' || s.page_type === 'product-page') buckets['Product landing']++;
    else buckets['BI / Analytics']++;
  }
  return buckets;
}

function sectionCoverage(sites) {
  const counts = {};
  for (const s of sites) {
    for (const sec of s.sections) {
      counts[sec] = (counts[sec] || 0) + 1;
    }
  }
  return counts;
}

export function runAudit() {
  const siteEntries = getReferenceSites();
  const sites = [];
  const compliance = { puvi: 0, bem: 0, inline: [], weight: [] };

  for (const entry of siteEntries) {
    const { site_name: name, dir, origin, reference_path } = entry;
    const html = readFileSafe(path.join(dir, 'index.html'));
    const cssFile = findCssFile(dir);
    const css = cssFile ? readFileSafe(path.join(dir, cssFile)) : '';
    const hasJs = fs.existsSync(path.join(dir, 'script.js'));
    const sectionClasses = extractSectionClasses(html);
    const sections = extractSections(html);
    const sectionCount = sectionClasses.length;
    const check = complianceCheck(html, css);

    if (check.usesPuvi) compliance.puvi++;
    if (check.hasBem) compliance.bem++;
    if (check.inlineStyles > 0) compliance.inline.push(name);
    if (check.numericWeight > 0) compliance.weight.push(name);

    sites.push({
      site_name: name,
      reference_path,
      reference_origin: origin,
      page_topic: extractPageTopic(html) || name,
      page_type: inferPageType(name, html),
      product_focus: inferProductFocus(name, html),
      tone: inferTone(html),
      sections,
      layout_variety: inferLayouts(html, sectionClasses),
      section_classes: sectionClasses,
      primary_color: extractPrimaryColor(css),
      dark_sections: hasDarkSections(css, html),
      section_count: sectionCount,
      complexity: inferComplexity(sectionCount),
      has_js: hasJs,
      css_file: cssFile || 'style.css',
      keywords: [...new Set([
        ...name.toLowerCase().split(/[\s-/]+/),
        ...sections,
        inferPageType(name, html).split('-')
      ])].filter((k) => k.length > 2),
      last_audited: new Date().toISOString().slice(0, 10)
    });
  }

  const sectionIndex = buildSectionIndex(sites);
  const teamDna = buildTeamDna(sites);
  const topics = topicCoverage(sites);
  const secCov = sectionCoverage(sites);

  const catalog = {
    version: '1.0',
    generated_at: new Date().toISOString(),
    total_sites: sites.length,
    sites: sites.map(({ section_classes, ...rest }) => rest)
  };

  fs.writeFileSync(path.join(WORKFLOW, 'site-catalog.json'), JSON.stringify(catalog, null, 2));
  fs.writeFileSync(path.join(WORKFLOW, 'section-index.json'), JSON.stringify({
    version: '1.0',
    generated_at: new Date().toISOString(),
    sections: sectionIndex
  }, null, 2));
  fs.writeFileSync(path.join(WORKFLOW, 'team-dna.json'), JSON.stringify(teamDna, null, 2));

  const gaps = ['hero', 'features', 'stats', 'cta', 'testimonials', 'comparison', 'faq', 'pricing', 'steps', 'carousel']
    .filter((t) => !sectionIndex[t]);

  const report = [
    'WEB-PAGES SITE AUDIT',
    '===================',
    `Total sites: ${sites.length}`,
    `Generated: ${catalog.generated_at}`,
    '',
    'SITE INVENTORY:',
    ...sites.map((s) => `  ${s.site_name.padEnd(28)} ${s.page_type.padEnd(22)} ${s.section_count} sections`),
    '',
    'TOPIC COVERAGE:',
    ...Object.entries(topics).map(([k, v]) => `  ${k.padEnd(24)} ${v}`),
    '',
    'SECTION COVERAGE:',
    ...Object.entries(secCov).sort((a, b) => b[1] - a[1]).map(([k, v]) => `  ${k.padEnd(20)} ${v} examples`),
    '',
    'GAPS — will be synthesised from team DNA:',
    ...(gaps.length ? gaps.map((g) => `  → ${g}: no reference found`) : ['  (none)']),
    '',
    'RULESBOOK COMPLIANCE SPOT CHECK:',
    `  → ${compliance.puvi}/${sites.length} sites use Puvi font variables`,
    `  → ${compliance.bem}/${sites.length} sites have BEM-like class patterns`,
    `  → Inline styles found in: ${compliance.inline.length ? compliance.inline.join(', ') : 'none'}`,
    `  → Numeric font-weight found in: ${compliance.weight.length ? compliance.weight.join(', ') : 'none'}`,
    '',
    'FILES:',
    `  site-catalog.json     ✅ (${sites.length} sites)`,
    `  section-index.json    ✅ (${Object.keys(sectionIndex).length} section types)`,
    `  team-dna.json         ✅`,
    `  zohocustom.css        ${fs.existsSync(path.join(ROOT, 'source/zohocustom.css')) ? '✅' : '❌'} (source/zohocustom.css)`,
    `  product.css           ${fs.existsSync(path.join(ROOT, 'source/product.css')) ? '✅' : '❌'} (source/product.css)`
  ].join('\n');

  fs.writeFileSync(path.join(WORKFLOW, 'audit-report.txt'), report);
  console.log(report);
  return { catalog, sectionIndex, teamDna, sites: sites.length };
}

if (isScriptMain(import.meta.url)) {
  runAudit();
}
