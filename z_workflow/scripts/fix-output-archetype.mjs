#!/usr/bin/env node
/**
 * Deterministic post-compose patches so autonomous builds pass validate:output
 * when the agent picked the wrong section class (e.g. banner-section vs za-banner-section).
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

function fixMissingCtas(html, composite) {
  const required = composite.cta_strings_required || [];
  const fixes = [];
  let next = html;

  for (const cta of required) {
    if (next.toLowerCase().includes(cta.toLowerCase())) continue;

    const block = `
        <section class="pre-banner-section bg-white p-90 t-center" data-auto-cta="true">
            <div class="content-wrap">
                <div class="cta-btn-wrap">
                    <a href="#" class="cta-btn act-btn" aria-label="${cta}">${cta}</a>
                </div>
            </div>
        </section>
`;
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
