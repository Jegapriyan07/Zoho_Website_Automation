import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { config } from './config.js';

// ── Phase 1 / 2 / 6 composer ───────────────────────────────────
// IMPORTANT: page composition (design tokens -> blueprint -> writing the 3
// files) is AGENT (LLM) work in this repo. There is no deterministic script
// for it, and the Rulesbook explicitly forbids reimplementing composition.
//
// So this module does NOT compose pages itself. It hands the build context to
// an external agent command (COMPOSER_CMD) and verifies the agent wrote the
// three files. If COMPOSER_CMD is unset, it returns a manual hard-stop signal
// instead of emitting garbage (acceptance criterion: no fake success).

const REQUIRED_FILES = ['index.html', 'style.css', 'script.js'];

export function outputDirFor(slug) {
  return path.join(config.pipelineRoot, 'output', slug);
}

export function outputFilesPresent(slug) {
  const dir = outputDirFor(slug);
  const html = path.join(dir, 'index.html');
  const css = path.join(dir, 'style.css');
  return fs.existsSync(html) && fs.existsSync(css);
}

const DASHBOARD_ZIGZAG_ARCHETYPES = new Set([
  'dashboard-examples-landing-sales',
  'dashboard-examples-landing',
  'dashboard-examples-landing-finance'
]);

function compositeUsesDashboardZigzag(composite) {
  return Boolean(
    composite?.section_order?.some((s) => s.class === 'dashboard-wrapper' || s.layout === 'zigzag')
  );
}

/** Build the exact instruction the agent must follow (mirrors the workflow). */
export function buildComposerPrompt({ slug, briefFile, revise, archetype, composite, trustedBrands, reportSlider, endBanner }) {
  const base = [
    'You are the Zoho Web Page Builder agent operating inside the Web-pages repo.',
    'Follow z_workflow/AGENT-PROJECT-WORKFLOW.md (Phases 1, 2, 6), z_workflow/Rulesbook.md,',
    'and .cursor/rules/structure-first-pipeline.mdc EXACTLY. Compose, never clone.',
    '',
    `Brief file (only copy source): ${briefFile}`,
    `Read z_workflow/state.json for the similarity.source_map + similarity.end_banner produced by Phase 0.`,
    'Also read z_workflow/end-banner-types.json and z_workflow/banner-selection-guide.md.',
    '',
    'Do Phase 1 (design tokens) -> Phase 2 (blueprint) -> Phase 6 (write files).',
    `Write exactly three files into output/${slug}/: index.html, style.css, script.js.`,
    'Link ../../source/zohocustom.css + ../../source/product.css. Images from',
    'https://prezohoweb.zoho.com/ with <!-- TODO: replace with final asset --> markers.',
    'Nav/footer are comment placeholders only. Include the CTA visibility override.',
    'CTA LABELS: every string in section-composites.json → cta_strings_required MUST appear',
    'as visible button text (a.cta-btn.act-btn OR a.act-btn.cal-btn-secondary / .dwnload-btn).',
    'When section_order entries set cta / cta_secondary (or cta_banner_map), use THOSE labels',
    'per banner — NEVER copy the same primary CTA onto hero, mid-cta, and closing.',
    'NO FOCUS RINGS: never style :focus / :focus-visible outlines on buttons, CTAs, tabs,',
    'steps, accordion headers, or [role=button]. Use outline:none; box-shadow:none on :focus',
    'and :focus-visible for all interactive controls in style.css (team request).',
    'Update z_workflow/state.json phase_1 / phase_2 / phase_6 as you go.',
    'Do NOT run validate:output — the tool does that afterward.'
  ];

  const hasTabsection = Boolean(
    composite?.section_order?.some((s) => s.class === 'tabsection' || s.type === 'toc-content')
  );
  const nestArticleInTabsection =
    hasTabsection ||
    archetype === 'comparison-guide' ||
    archetype === 'embedded-sales-analytics';

  if (archetype && composite?.section_order?.length) {
    base.push('');
    base.push(`ARCHETYPE (mandatory): ${archetype}`);

    if (nestArticleInTabsection) {
      base.push('TOP-LEVEL <section> roots ONLY (gold: output/cloud-analytics structure):');
      base.push('  1. hero → <section class="banner">');
      base.push('  2. article → <section class="tabsection p-90">  ← ALL article body lives HERE');
      base.push('  3. faq → <section class="faq-section">  ← AFTER tabsection only');
      base.push('');
      base.push('CRITICAL — do NOT emit sibling sections for these types:');
      base.push('  ❌ <section class="comparison-table-section">');
      base.push('  ❌ <section class="tool-block"> / <section class="comparison-table"> / <section class="cont-sec">');
      base.push('  ❌ <section class="pre-banner"> between tabsection and faq');
      base.push('  Nest each as <div class="cont-sec" id="…"> inside #right-content (see pattern_notes below).');
      base.push('');
      base.push('Article blocks INSIDE .tabsection > #right-content (order / nesting):');
      let n = 0;
      composite.section_order.forEach((s) => {
        if (s.type === 'hero' || s.type === 'faq') return;
        if (reportSlider && (s.class === 'reported-section' || s.type === 'recognition')) return;
        n += 1;
        const notes = s.pattern_notes ? ` — ${s.pattern_notes}` : '';
        if (s.type === 'toc-content') {
          base.push(`  ${n}. left-tab + #right-content shell (${s.class})${notes}`);
        } else {
          base.push(
            `  ${n}. NEST as .cont-sec (NOT <section class="${s.class}">): ${s.type} / .${s.class}${notes}`
          );
        }
      });
    } else {
      base.push('Use EXACTLY these section root classes in order — wrong class names fail validation:');
      composite.section_order.forEach((s, i) => {
        if (reportSlider && (s.class === 'reported-section' || s.type === 'recognition')) {
          base.push(`  ${i + 1}. ${s.type}: SKIP — pipeline injects .reported-section (report slider)`);
          return;
        }
        const id = s.id ? ` id="${s.id}"` : '';
        const slot = s.banner_slot ? ` [banner_slot: ${s.banner_slot}]` : '';
        const cta = s.cta ? ` primary CTA: "${s.cta}"` : '';
        const cta2 = s.cta_secondary ? ` secondary CTA: "${s.cta_secondary}"` : '';
        const placeholder = s.placeholder_only
          ? ' — PLACEHOLDER ONLY: header/shell only, NO card/quote content'
          : '';
        const notes = s.pattern_notes ? ` — ${s.pattern_notes}` : '';
        base.push(`  ${i + 1}. ${s.type}: <section class="${s.class}"${id}>${slot}${cta}${cta2}${placeholder}${notes}`);
      });
    }

    if (composite.cta_banner_map) {
      base.push('');
      base.push('BANNER CTA MAP (mandatory — each slot gets its OWN labels):');
      for (const [slot, map] of Object.entries(composite.cta_banner_map)) {
        const sec = map.secondary
          ? ` + secondary "${map.secondary}" (.${map.secondary_class || 'dwnload-btn'})`
          : '';
        base.push(`  • ${slot}: primary "${map.primary}" (.cta-btn.act-btn)${sec}`);
      }
      base.push('Do NOT reuse one primary label across hero / mid-cta / closing-cta.');
    }

    if (composite.gold_standard_outputs?.length) {
      base.push(`Gold standard output(s) for this archetype: ${composite.gold_standard_outputs.join(', ')}`);
    }
    if (composite.toc_layout_gold) {
      base.push(`TOC/layout CSS gold page: ${composite.toc_layout_gold}/style.css`);
    }
    if (composite.toc_css_snippet) {
      base.push(`TOC/layout CSS snippet (COPY into style.css): ${composite.toc_css_snippet}`);
    }
    if (composite.css_gold_snippet) {
      base.push(`Layout CSS snippet (COPY into style.css): ${composite.css_gold_snippet}`);
    }
    if (composite.css_gold_snippets?.length) {
      base.push('Layout CSS snippets (COPY ALL into style.css):');
      for (const snip of composite.css_gold_snippets) {
        base.push(`  • ${snip}`);
      }
    }
    if (composite.css_gold_url) {
      base.push(`Live CSS gold URL: ${composite.css_gold_url}`);
    }
    if (composite.mandatory_css?.length) {
      base.push('MANDATORY CSS (paste into style.css — inventory validates these):');
      for (const rule of composite.mandatory_css) {
        base.push(`  ${rule}`);
      }
    }
    if (composite.cta_strings_required?.length) {
      base.push(`Required CTA button labels: ${composite.cta_strings_required.map((c) => `"${c}"`).join(', ')}`);
    }
  }

  const isSpreadsheetLanding = archetype === 'spreadsheet-reporting-landing';
  const isWhatIsBiGuide = archetype === 'what-is-business-intelligence';
  const isBiSoftwareLanding = archetype === 'bi-software-landing';
  const isDatabaseConnector = archetype === 'database-connector-landing';
  const isAppConnector = archetype === 'app-connector-landing';
  const isMobileApps = archetype === 'mobile-apps-landing';
  const needsDashboardZigzag =
    !isSpreadsheetLanding &&
    !isWhatIsBiGuide &&
    !isBiSoftwareLanding &&
    !isDatabaseConnector &&
    !isAppConnector &&
    !isMobileApps &&
    (DASHBOARD_ZIGZAG_ARCHETYPES.has(archetype) || compositeUsesDashboardZigzag(composite));

  if (isBiSoftwareLanding) {
    base.push('');
    base.push('BI SOFTWARE LANDING (mandatory — product LP, NOT the educational what-is-BI guide):');
    base.push('Gold STRUCTURE: output/bi-software-3 · Reference-Site/agent-reference/Bi-Software-3');
    base.push('Gold live PRIMARY: https://www.zoho.com/analytics/business-intelligence-bi-software.html (CSS 23064)');
    base.push('Sibling for Top-N tools: https://www.zoho.com/analytics/business-analytics-software.html → .tab-sticky (CSS 27747)');
    base.push('CSS gold: gold-snippets/bi-software-landing-layout.css + bi-software-trusted-brands-isolation.css');
    base.push('Compose ONLY brief sections — skip live Benefits / note-section / keypoints / types-of-reports / why-choose / zwc-footer.');
    base.push('Live BEM order:');
    base.push('  1) .zwc-banner-section — h1 + lead + Access Zoho analytics + .zwc-stats ×6');
    base.push('     Hero assets (prezoho full paths): item1::before banner-before.png · item3::before banner-beforegraph.svg · img.banner-arrow banner-arrow.svg');
    base.push('  2) .za-brandsCounts — ★ Trusted Brands inject ONLY (heading + 22K/4M + logo marquee). SKIP .trust-section / .tbrand-section.');
    base.push('  3) .zwc-learn-section — What is Business Intelligence Software?');
    base.push('  4) .zwc-feature-section — How to choose key features ×6 (.feature-cont pairs)');
    base.push('  5) .zwc-testimonials — Capterra shell + TODO (no invented quote)');
    base.push('  6) .tab-sticky — Top Business Intelligence softwares in 2026 · .cont-sec ×4 (Zoho · Power BI · Tableau · Sisense) + Pricing');
    base.push('  7) .faq-section — BI software FAQs ×8 AFTER tab-sticky');
    base.push('  ❌ NEVER use what-is-business-intelligence BEM (banner / tab-section / sticky-card / goals accordion).');
    base.push('  ❌ NEVER leave hero image URLs as bare https://prezohoweb.zoho.com/');
    base.push('  ❌ NEVER ship unscoped .trust-icon { margin:-120px } with Trusted Brands inject (clips logos).');
    base.push('JS: FAQ accordion + tab-sticky left-tab scrollspy (sibling BA software pattern). Trusted Brands ships its own script.');
    base.push('Images: https://prezohoweb.zoho.com/ + <!-- TODO: replace with final asset --> on every img.');
  }

  if (isAppConnector) {
    base.push('');
    base.push('APP-CONNECTOR LANDING (mandatory — Shopify / SaaS connector gold path):');
    base.push('Gold live LAYOUT: https://www.zoho.com/analytics/shopify-advanced-analytics.html');
    base.push('Compose sibling <section> roots from section_order — do NOT use Athena/SQLite database-connector BEM.');
    base.push('  ❌ Do NOT use .zbanner-section / .zdashboard-section / .zconnecting-section / .zresrc-section / Data Import rows.');
    base.push('HERO (critical — match live umain screenshots):');
    base.push('  <section class="header-section banner-shown"> CENTERED h1 + p + ACCESS ZOHO ANALYTICS');
    base.push('  NO .signup-box / NO split columns — .table-wrap.hero-centered > .column.left only');
    base.push('  THEN sibling .header-banner-slider.slide-wrap > .hb-slider > img (full-width dashboard)');
    base.push('  CSS MUST include .header-banner-slider::after white band (cream→white transition).');
    base.push('  h1 48px centered · bg #ffecc9');
    base.push('  ❌ NEVER put dashboard image or signup form in a right column for scaffold.');
    base.push('APP BANNER: .sbs-head — yellow h2 LEFT + black pill .sbs-app-btn Get The App Now RIGHT (not red CTA below).');
    base.push('KEY FEATURES CTA: .outline-btn Explore more features (black border), not red act-btn.');
    base.push('CONNECTORS: ALWAYS include .connectors-section — left intro + VIEW MORE CONNECTORS outline + Inventory/CRM/Survey pastel cards.');
    base.push('Live BEM order:');
    base.push('  1) .header-section.banner-shown — centered + slider as above');
    base.push('  2) .branding-section — skip when ★ Trusted Brands inject is on');
    base.push('  3) .common-section.shopify-banner-section — native app pitch');
    base.push('  4) .common-section.feature-accordian-section — Why choose accordion');
    base.push('  5) .common-section.zcollaborate-section — Key features + outline Explore more');
    base.push('  6) .common-section.connectors-section — related connectors');
    base.push('  7) .common-section.testimonial-section — PLACEHOLDER when brief has Customer testimony');
    base.push('  8) .common-section.trust-section — Rated the best placeholder / skip if report slider inject');
    base.push('  9) .how-tosec-wrap — Solutions/How-tos placeholder cards');
    base.push(' 10) .bottom-section#conclusion — Join Zoho Analytics today + ACCESS ZOHO ANALYTICS — end-banner pool');
    base.push('JS: feature accordion tab/panel switch with fadeIn/transX restart on each click.');
    base.push('Images: https://prezohoweb.zoho.com/ + <!-- TODO: replace with final asset --> on every img.');
  }

  if (isMobileApps) {
    base.push('');
    base.push('MOBILE-APPS LANDING (mandatory — Zoho Analytics Mobile Apps main page):');
    base.push('Gold live LAYOUT: https://www.zoho.com/analytics/mobile-apps.html · CSS 29675.css + zanalytics_solutions.css');
    base.push('  ❌ Do NOT use database-connector BEM (Data Import / zdashboard / zconnecting).');
    base.push('  ❌ Do NOT use bi-software zwc-banner / tab-sticky.');
    base.push('Live BEM order:');
    base.push('  1) .header-section — peach #fef2f2 · centered h1 48 + bold lead + ACCESS ZOHO ANALYTICS · device image');
    base.push('  2) .branding-section — SKIP when ★ Trusted Brands inject (variant=branding-section, NOT marquee)');
    base.push('  3) .feature-common-title — Experience the truly native…');
    base.push('  4) .feature-accordian-section — accordion ×N from brief (often 6)');
    base.push('  5) .third-party-section — 2 pastel party-flex-inner cards (Mobile BI + Dashboards)');
    base.push('  6) .testimonial-section — PLACEHOLDER: peach .slider-icon + h2 Hear it from our customers + TODO (no invented quote)');
    base.push('  7) .trust-section — Rated the best FULL live .rating-table 3×3 grid (not empty placeholder)');
    base.push('  8) .bottom-section#conclusion — Analyze your data on-the-move… + ACCESS ZOHO ANALYTICS');
    base.push('JS: feature accordion + branding dual-counter (inject) + trust-section .animated star fill on scroll.');
    base.push('Images: https://prezohoweb.zoho.com/ + <!-- TODO: replace with final asset --> on every img.');
  }

  if (isDatabaseConnector) {
    base.push('');
    base.push('DATABASE-CONNECTOR LANDING (mandatory — GOLD STANDARD compose path):');
    base.push('Gold STRUCTURE output: output/sqlite-db-page-draft-2/');
    base.push('Gold live LAYOUT: https://www.zoho.com/analytics/amazon-athena.html');
    base.push('Gold live CSS: https://www.zohowebstatic.com/sites/zweb/css/translation/analytics/27735.css');
    base.push('Alternate live (no competitor table): https://www.zoho.com/analytics/sqlite.html');
    base.push('OPEN output/sqlite-db-page-draft-2/index.html and COPY its section order + BEM — compose from brief copy only.');
    base.push('Gold CSS snippets (COPY wholesale into style.css):');
    base.push('  1) z_workflow/gold-snippets/database-connector-type-scale.css');
    base.push('  2) z_workflow/gold-snippets/database-connector-zresrc-cards.css');
    base.push('Compose sibling <section> roots from section_order — do NOT use article .tabsection TOC.');
    base.push('Capability rows: exactly 4× .zdashboard-section — rows 2 and 4 MUST also have class zdb2.');
    base.push('  Markup: .zdashboard-box.dsp-flx.justify-space > .zdashboard-title (<strong>label</strong>+h2) + .zdashboard-desc, then .zdashboard-img (prezoho + TODO).');
    base.push('Key features: .zconnecting-section with 4 cards — icons are IMAGES (live CSS sprite/PNG), NOT text.');
    base.push('  Each card MUST have visible <img class="zconnecting-icon" src="https://prezohoweb.zoho.com/" width/height + TODO> ABOVE the h4.');
    base.push('  Cards: .zconnecting-list (.zicon-safer Incremental) · .ziaicon-list (Zia Insights) · .zconnecting-list (.zicon-forecast) · .zconnecting-list (.zicon-share).');
    base.push('OPTIONAL .zcomparison-section — ONLY if brief has a competitor comparison table; SQLite Writer draft → SKIP.');
    base.push('Testimonials (.ztesti-section): MANDATORY visible shell when brief says CUSTOMER TESTIMONY —');
    base.push('  h2 Our Customer love us + .ztesti-box > photo img placeholder + name/title TODOs + quote TODO. Never leave empty collapsing section.');
    base.push('  Include <!-- TODO: INSERT TESTIMONIALS HERE --> for dev handoff. Do NOT invent real quotes.');
    base.push('TYPE SCALE (mandatory — copy database-connector-type-scale.css):');
    base.push('  Live Athena 27735.css measured: h1 50/60 · h2 36/45 · h4 features 23/32.2 · body p 17/27.2 · what-is p 18/28.8');
    base.push('  Resource h4 21/29.4 · learn-more 17/25.5 · section padding 100px · h2/p margins 0 0 15 / 0 0 20');
    base.push('  ❌ Do NOT ship scaffold defaults (h1 42, h2 32, h3 20, p 16) — they read smaller than live.');
    base.push('Resources (.zresrc-section): BOX CARD layout — COPY database-connector-zresrc-cards.css wholesale.');
    base.push('  .zresrc-box > .zresrc-list ×N — each .zresrc-list is a card: padding 35px · radius 12px · box-shadow 0 0 20px rgba(208,208,208,.23) · bg #fff.');
    base.push('  Content: icon img placeholder + h4 + optional p + <a class="learn-more-cta">Learn more</a> (blue #03a9f5 underline + chevron).');
    base.push('  3 items (Athena) = default 3-col; 4 items (SQLite brief) = add class .zresrc-box--4 (2×2). Never flat text columns without the box shadow.');
    base.push('Closing: <section class="zbottom-section" id="conclusion"> — style via end-banner pool, never plain white.');
    base.push('CTA labels: use brief ACCESS ZOHO ANALYTICS on hero + closing (not live Sign up for free unless brief says so).');
    base.push('Trusted brands: skip .trust-section / .tbrand-section when ★ Trusted Brands inject is enabled.');
    base.push('JS: copy scroll/reveal patterns from output/sqlite-db-page-draft-2/script.js when present.');
  }

  if (isWhatIsBiGuide) {
    base.push('');
    base.push('WHAT-IS-BUSINESS-INTELLIGENCE GUIDE (mandatory — sibling sections, NOT article TOC):');
    base.push('Gold STRUCTURE output: output/what-is-business-intelligence-lp-3/');
    base.push('Gold live: https://www.zoho.com/analytics/what-is-business-intelligence.html');
    base.push('Gold CSS snippet (COPY into style.css): z_workflow/gold-snippets/what-is-bi-type-scale.css');
    base.push('Gold CSS URL: https://www.zohowebstatic.com/sites/zweb/css/translation/analytics/39804.css');
    base.push('OPEN output/what-is-business-intelligence-lp-3/index.html and COPY its section order + BEM — compose from brief copy only.');
    base.push('Compose sibling <section> roots in section_order — do NOT use .tabsection / .left-tab / .cont-sec nesting.');
    base.push('Horizontal .tab-section is scrollspy nav only (.tab-btn buttons) — body content stays as sibling sections.');
    base.push('JS: sticky-card scroll, industry feature tabs, FAQ accordion, tab-section scrollspy — copy from output/what-is-business-intelligence-lp-3/script.js (or Reference-Site/Business-Intelligence/script.js).');
    base.push('CTA map: hero Get Started · mid Book a demo · closing Start your BI journey today (distinct labels).');
    base.push('Testimonials: PLACEHOLDER ONLY — header + See all testimonials link + empty .zwc-nav-scroll-section.');
    base.push('  ❌ Do NOT append .zwc-nav-box cards, quotes, names, or photos.');
    base.push('  Include <!-- TODO: INSERT TESTIMONIALS HERE --> for dev handoff.');
    base.push('TYPE SCALE (mandatory — copy z_workflow/gold-snippets/what-is-bi-type-scale.css):');
    base.push('  h1 42px/50.4px · h2 32px/40px (mb 15) · h3 24px/31.2px (mb 10) · p/li 17px/27.2px (p mb 20)');
    base.push('  .page-container .title-desc 20px/32px width 80% (must beat .page-container p) · FAQ h4 18px/25.2px padding 25px · .p-90 = 90px');
    base.push('  ❌ Do NOT use scaffold defaults (h3 20px, p 16px) — they read smaller than live.');
    base.push('  @991: h3→21px, title-desc→17px width 100%, .p-90→60px — do NOT shrink h2/body below live.');
    base.push('WRITER BANNER MARKERS: any brief line "Separate banner for this:" → its following sentence is a SIBLING <section class="pre-banner"> (h2), never appended inside progress-section / sticky-card / use-cases.');
    base.push('  Gold example: after goals → #goals-align-banner.pre-banner with prezoho placeholder bg (cover) + h2 text only — no solid red fill.');
    base.push('FAQ is AFTER closing #conclusion.pre-banner — never in the tab scrollspy list.');
  }

  if (needsDashboardZigzag) {
    base.push('');
    base.push('DASHBOARD ZIGZAG (left/right rows — mandatory, gold standard: output/testing-3/):');
    base.push('- Section class: .dashboard-wrapper with alternating .main-wrapper.right-content / .left-content rows');
    base.push('- Row spacing: padding 100px 0, margin-bottom 50px, gap 40px, align-items center');
    base.push('- Background panels: 55% width ::before rectangles, border-radius 30px, NO clip-path');
    base.push('- Image column vertically centered; copy from brief tables only');
    base.push('- Scroll reveal: data-onscroll + .zwe-om via IntersectionObserver in script.js');
  }

  const needsExcelMigration =
    isSpreadsheetLanding ||
    composite?.section_order?.some((s) => s.class === 'excel-migration-section');
  if (needsExcelMigration || isSpreadsheetLanding) {
    base.push('');
    base.push('SPREADSHEET-REPORTING LANDING — EXACT LIVE BEM (mandatory):');
    base.push('Gold live: https://www.zoho.com/analytics/spreadsheet-reporting.html');
    base.push('Gold CSS: https://www.zohowebstatic.com/sites/zweb/css/translation/analytics/40836.css');
    base.push('Gold CSS snippet (COPY wholesale into style.css): z_workflow/gold-snippets/spreadsheet-reporting-layout.css');
    base.push('Gold output: output/excel-spreadsheet-reporting-lp-3/');
    base.push('Do NOT use testing-3 clip-path / 55% zigzag panels — use cream #fef8eb 871×570 cards from the snippet.');
    base.push('');
    base.push('1) .progress-section — accordion + image panel (NEVER .progress-timeline / .progress-card):');
    base.push('   <div class="table-wrap"><div class="column left"><div class="text-wrapper">');
    base.push('     <div class="acc-wrap current"><h3>…</h3><ul><li>…</li></ul>');
    base.push('       <img class="acc-img" src="https://prezohoweb.zoho.com/" alt="…"></div>');
    base.push('     <div class="acc-wrap">…</div>×2 more');
    base.push('   </div></div><div class="column right"><div class="image-part">');
    base.push('     <img class="step-image active" …><img class="step-image" …>×2');
    base.push('   </div></div></div>');
    base.push('   JS: click/auto-advance .acc-wrap.current + matching .step-image.active (8s progressHeight bar).');
    base.push('');
    base.push('2) .limits-section — .limits-grid > .limit-item > p ×6 + p.limits-closing (not <ul><li>).');
    base.push('');
    base.push('3) .dashboard-wrapper — zigzag .main-wrapper; each li = <span class="check"></span> text;');
    base.push('   cream cards: isolation:isolate; ::before #fef8eb 871×570 radius 30px z-index:0 (NEVER -1);');
    base.push('   image/content z-index:1; img.dashboard-image border 5px #000 radius 20px.');
    base.push('');
    base.push('4) .comparison-table-section — column ORDER Features | Zoho Analytics | Excel;');
    base.push('   .comparison-table > table; th/td.analytics-light + td.analytics-dark; Zoho col gold border #eca91c.');
    base.push('');
    base.push('5) .excel-migration-section — .migration-wrapper.left-content > image + content;');
    base.push('   .migration-steps > .migration-step > .step-icon + .step-content > h4 (not bare <ul><li>).');
    base.push('');
    base.push('6) Mid .pre-banner-section AFTER migration: h2 \"Switch to Zoho Analytics today!\"');
    base.push('   primary \"Sign up for free\" (.cta-btn.act-btn) + \"Get a personalized Demo\" (.dwnload-btn).');
    base.push('7) Closing #conclusion.pre-banner-section.light — peach gradient 34deg (EB-06).');
    base.push('   primary \"Start your free trial today!\" (.cta-btn.act-btn) + \"Sign up for free\" (.dwnload-btn).');
    base.push('CTA ANTI-PATTERN: ❌ same \"Try Zoho Analytics for free\" on hero + mid + closing.');
    base.push('Hero keeps \"Try Zoho Analytics for free\" + \"Watch demo\" only.');
    base.push('');
    base.push('TYPE SCALE (copy from gold snippet / live 40836.css — do NOT use smaller scaffold defaults):');
    base.push('  h1 42px/50.4px · h2 32px/40px (mb 15) · h3 24px/31.2px · p/li 17px/25.5px');
    base.push('  .page-container .title-desc 20px/32px · limit-item p 18px · migration-subtitle 22px');
    base.push('  comparison th 24px · td 17px · faq h4 18px padding 25px · section padding 90px (faq 80px)');
  }

  if (trustedBrands) {
    const tbVariant =
      composite?.trusted_brands_inject?.variant ||
      (archetype === 'mobile-apps-landing' || archetype === 'app-connector-landing'
        ? 'branding-section'
        : 'marquee');
    base.push('');
    base.push('TRUSTED BRANDS (pipeline-injected — do NOT build in Phase 6):');
    base.push(`- ★ Trusted Brands checkbox is ON — architecture variant: ${tbVariant}`);
    if (tbVariant === 'branding-section') {
      base.push('- Inject BEM: .branding-section (live mobile-apps / Shopify gold)');
      base.push('- Layout: h2 TRUSTED BY GREAT BRANDS · .branding-wrap · .bc1 pink counter LEFT · .bc2 logo grid RIGHT');
      base.push('- Do NOT add za-brandsCounts, marquee-wrapper, trusted-icon-wrap, trust-icon, or za-cust-counts');
      base.push('- Do NOT compose .branding-section yourself — server injects after hero');
    } else {
      base.push('- Inject BEM: .za-brandsCounts (marquee + 22K/4M counts)');
      base.push('- Do NOT add za-brandsCounts, marquee-wrapper, trusted-icon-wrap, trust-icon, or za-cust-counts');
      base.push('- Gold standard for injected output: output/testing-3/index.html (marquee + counters only)');
    }
    base.push('- Hero ends at first </section>; trusted brands are inserted immediately after by the server');
  }

  if (reportSlider) {
    base.push('');
    base.push('REPORT SLIDER (pipeline-injected — do NOT build in Phase 6):');
    base.push('- This build uses ★ Report Slider — tool injects an EMPTY .reported-section shell');
    base.push('- Do NOT add reported-section, report-slider, aem-report, trust-section.rated-section, or rating-table');
    base.push('- Shell is placed immediately BEFORE #conclusion (closing Ready to build… CTA) — not before mid-page #one-click-cta, not after dashboards mid-page');
    base.push('- Zoho deployment fills .report-slider + .rating-table; leave them empty in agent output');
  }

  if (nestArticleInTabsection) {
    base.push('');
    base.push('ARTICLE TOC LAYOUT (FINAL FORMAT — override any section_order that looks like sibling <section>s):');
    base.push('Gold STRUCTURE page: output/cloud-analytics/index.html  (banner → ONE tabsection → faq-section ONLY)');
    base.push('Gold CSS snippet: z_workflow/gold-snippets/article-toc-layout.css');
    base.push('Live reference: https://www.zoho.com/analytics/cloud-reporting-tools.html');
    base.push('');
    base.push('OPEN output/cloud-analytics/index.html and COPY its nesting. Top-level body sections are ONLY:');
    base.push('  <section class="banner"> … </section>');
    base.push('  <section class="tabsection p-90"> …LEFT TAB + ALL cont-sec… </section>');
    base.push('  <section class="faq-section"> … </section>');
    base.push('If you emit comparison-table-section / tool-block / cont-sec / pre-banner as sibling <section>s, the build FAILS the gold format.');
    base.push('');
    base.push('1) HTML skeleton (exact nesting):');
    base.push('   <section class="tabsection p-90"><div class="content-wrap">');
    base.push('     <div class="left-tab">');
    base.push('       <h2>In this article</h2>');
    base.push('       <ul class="tabs" id="tabs">');
    base.push('         <li><a href="#…">…</a></li>  <!-- article sections only — NEVER FAQ -->');
    base.push('         <div class="banner"><div class="wrapper">');
    base.push('           <h3>Go from data to insights in minutes using Zoho Analytics</h3>');
    base.push('           <a href="/analytics/signup.html" class="cta-btn act-btn">Access Zoho Analytics</a>');
    base.push('         </div></div>  <!-- peach CTA MUST be LAST CHILD of ul#tabs -->');
    base.push('       </ul>');
    base.push('     </div>');
    base.push('     <div class="right-content" id="right-content">');
    base.push('       <div class="cont-sec" id="step-tldr">…</div>');
    base.push('       <div class="cont-sec" id="step1">…</div>');
    base.push('       <div class="cont-sec" id="comparison-glance"><div class="table-wrap">…</div></div>');
    base.push('       <div class="cont-sec" id="tools">…tool-block…</div>');
    base.push('       <div class="cont-sec" id="how-to-choose">…</div>');
    base.push('       <div class="cont-sec" id="key-features"><div class="table-wrap">…</div></div>');
    base.push('       <div class="cont-sec" id="why-zoho">…optional .pre-banner inside…</div>');
    base.push('     </div>');
    base.push('   </div></section>');
    base.push('   <section class="faq-section">…</section>');
    base.push('');
    base.push('2) CSS — COPY z_workflow/gold-snippets/article-toc-layout.css (+ output/cloud-analytics/style.css):');
    base.push('   - .left-tab { flex:0 0 340px; width:340px; sticky top:100px }');
    base.push('   - ul#tabs { overflow-y:auto; height:calc(100vh - 200px); width:340px }');
    base.push('   - .cont-sec { margin: 0 0 45px 100px }');
    base.push('   - Tables: .table-wrap overflow-x:auto; .comparison-table-7col min-width 1200px; word-break:normal');
    base.push('');
    base.push('3) Scrollspy: output/cloud-analytics/script.js — trigger = scrollY + header + 60; never offsetTop.');
    base.push('validate:output fails if article body is sibling sections, left-tab ≠ 340px, CTA outside ul#tabs, or tables crush.');
  }

  if (endBanner?.id) {
    base.push('');
    base.push('CLOSING END BANNER (mandatory — vary by build, do NOT reuse blue-shadow on every page):');
    base.push(`- Selected type: ${endBanner.id} · ${endBanner.label} (${endBanner.bg_treatment})`);
    base.push(`- Reference folder: ${endBanner.reference}`);
    if (endBanner.webtemplate_examples?.length) {
      base.push(`- Webtemplate colour refs: ${endBanner.webtemplate_examples.join(' · ')}`);
    }
    base.push('- Apply to #conclusion.pre-banner-section (closing CTA before FAQ) ONLY — not hero, not mid-cta .bg-white');
    if (endBanner.html_modifier) {
      base.push(`- HTML modifier class (optional): "${endBanner.html_modifier}" on the closing section when the pattern uses it`);
    }
    if (endBanner.text_color === 'light') {
      base.push('- Text on this band is LIGHT (#fff) — set h2/p color accordingly');
    } else {
      base.push('- Text on this band is DARK — keep headings readable on the light wash');
    }
    base.push('- Copy this CSS skeleton onto #conclusion.pre-banner-section (adapt tokens; keep fingerprints distinct from hero):');
    base.push('```css');
    base.push(`#conclusion.pre-banner-section {\n${endBanner.css_skeleton}\n}`);
    base.push('```');
    base.push('- Never default every build to blue-shadow-with-texture.png — only use it when this selected type is EB-01');
  } else {
    base.push('');
    base.push('CLOSING END BANNER: Read similarity.end_banner in state.json (or pick from end-banner-types.json).');
    base.push('Do NOT reuse the same textured band on every page.');
  }

  if (revise) {
    base.push('');
    if (revise.scope === 'section' && revise.section_name) {
      base.push(`REVISE (section-scoped): rewrite ONLY the "${revise.section_name}" section and only the affected file(s).`);
    } else {
      base.push('REVISE (general): apply this change across the page, rewriting only affected file(s).');
    }
    base.push(`REVISE instruction: ${revise.instruction}`);
    base.push('Do not re-run Phase 0. Keep all other sections unchanged.');
  }
  return base.join('\n');
}

/**
 * Run the external composer command.
 * @returns {Promise<{ok:boolean, reason?:string, manual?:boolean}>}
 */
export function runComposer({ slug, briefFile, revise, archetype, composite, trustedBrands, reportSlider, endBanner, onLog }) {
  return new Promise((resolve) => {
    const prompt = buildComposerPrompt({ slug, briefFile, revise, archetype, composite, trustedBrands, reportSlider, endBanner });

    if (!config.composerSpawn) {
      onLog?.(
        'No COMPOSER_CMD configured. Phase 1/2/6 composition is agent (LLM) work and ' +
          'cannot be performed by a deterministic script.'
      );
      onLog?.('Build context prepared for a human/agent to compose:');
      onLog?.(prompt);
      return resolve({
        ok: false,
        manual: true,
        reason:
          'manual_compose_required: set COMPOSER_CMD (e.g. a Cursor CLI agent) so the tool ' +
          'can drive Phase 1/2/6 automatically, or compose output/' + slug + '/ by hand then Revise.'
      });
    }

    onLog?.(`Invoking composer: ${config.composerSpawn.label}`);

    runComposerProcess({ prompt, slug, onLog }).then(resolve);
  });
}

function runComposerProcess({ prompt, slug, onLog }) {
  return new Promise((resolve) => {
    const { bin, args, useShell } = config.composerSpawn;
    const child = spawn(bin, args, {
      cwd: config.pipelineRoot,
      env: {
        ...process.env,
        ZWPB_SLUG: slug,
        COMPOSER_MODEL: config.composerModel
      },
      shell: useShell,
      windowsHide: true
    });

    try {
      child.stdin.write(prompt);
      child.stdin.end();
    } catch {
      /* wrapper reads stdin */
    }

    child.stdout.on('data', (d) => onLog?.(d.toString()));
    child.stderr.on('data', (d) => onLog?.(d.toString()));

    child.on('error', (err) => {
      resolve({ ok: false, reason: `composer_spawn_failed: ${err.message}` });
    });

    child.on('close', (code) => {
      if (code !== 0) {
        return resolve({
          ok: false,
          reason: `composer_exit_${code}: composition agent failed — retry the build; if it persists, check network/VPN and cursor-agent login`
        });
      }
      const missing = REQUIRED_FILES.filter(
        (f) => !fs.existsSync(path.join(outputDirFor(slug), f))
      );
      const criticalMissing = missing.filter((f) => f !== 'script.js');
      if (criticalMissing.length) {
        return resolve({
          ok: false,
          reason: `composer_missing_files: ${criticalMissing.join(', ')}`
        });
      }
      resolve({ ok: true });
    });
  });
}
