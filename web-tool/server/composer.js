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
    'Every string in section-composites.json → archetype → cta_strings_required MUST appear',
    'as visible .cta-btn.act-btn button text in index.html.',
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
        const cta = s.cta ? ` CTA: "${s.cta}"` : '';
        const notes = s.pattern_notes ? ` — ${s.pattern_notes}` : '';
        base.push(`  ${i + 1}. ${s.type}: <section class="${s.class}"${id}>${slot}${cta}${notes}`);
      });
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
    if (composite.cta_strings_required?.length) {
      base.push(`Required CTA button labels: ${composite.cta_strings_required.map((c) => `"${c}"`).join(', ')}`);
    }
  }

  const needsDashboardZigzag =
    DASHBOARD_ZIGZAG_ARCHETYPES.has(archetype) || compositeUsesDashboardZigzag(composite);

  if (needsDashboardZigzag) {
    base.push('');
    base.push('DASHBOARD ZIGZAG (left/right rows — mandatory, gold standard: output/testing-3/):');
    base.push('- Section class: .dashboard-wrapper with alternating .main-wrapper.right-content / .left-content rows');
    base.push('- Row spacing: padding 100px 0, margin-bottom 50px, gap 40px, align-items center');
    base.push('- Background panels: 55% width ::before rectangles, border-radius 30px, NO clip-path');
    base.push('- Image column vertically centered; copy from brief tables only');
    base.push('- Scroll reveal: data-onscroll + .zwe-om via IntersectionObserver in script.js');
  }

  if (trustedBrands) {
    base.push('');
    base.push('TRUSTED BRANDS (pipeline-injected — do NOT build in Phase 6):');
    base.push('- This build uses ★ Trusted Brands — the tool injects the block after compose');
    base.push('- Do NOT add za-brandsCounts, marquee-wrapper, trusted-icon-wrap, trust-icon, or za-cust-counts');
    base.push('- Hero ends at first </section>; trusted brands are inserted immediately after by the server');
    base.push('- Gold standard for injected output: output/testing-3/index.html (marquee + counters only)');
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
