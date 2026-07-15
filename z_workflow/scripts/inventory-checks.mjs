#!/usr/bin/env node
/**
 * Shared brief + output inventory checks for section-composites archetypes.
 */

/**
 * @param {string} text
 */
export function inventoryBrief(text) {
  const norm = text.replace(/\r\n/g, '\n');
  const lower = norm.toLowerCase();

  const stepMatches = [...norm.matchAll(/step\s*(\d+)/gi)];
  const stepNumbers = [...new Set(stepMatches.map((m) => parseInt(m[1], 10)))].sort((a, b) => a - b);

  const faqHeadingIdx = lower.search(/\b(frequently asked questions|faqs?)\b/i);
  let faqCount = 0;
  if (faqHeadingIdx >= 0) {
    const faqBlock = norm.slice(faqHeadingIdx);
    faqCount = (faqBlock.match(/\?\s*\n/g) || []).length;
    if (faqCount === 0) {
      faqCount = (faqBlock.match(/\n[A-Z][^\n]+\?\n/g) || []).length;
    }
    if (faqCount === 0) {
      // Writer MCP extract often merges FAQ lines — count question marks in FAQ block
      faqCount = (faqBlock.match(/\?/g) || []).length;
    }
  }

  const pageMarkers = [...norm.matchAll(/---\s*PAGE\s+(\d+)\s*---/gi)];
  const pages = pageMarkers.map((m) => parseInt(m[1], 10));

  const ratingPlatforms = ['GetApp', 'FinancesOnline', 'Capterra', 'G2', 'Google Workspace Marketplace', 'Software Advice']
    .filter((p) => norm.includes(p));

  const imagePlaceholders = (norm.match(/<<image>>/gi) || []).length;

  return {
    step_count: stepNumbers.length,
    step_numbers: stepNumbers,
    faq_count: faqCount,
    page_markers: pages,
    image_placeholder_count: imagePlaceholders,
    has_testimonials_heading: /hear from our (happy )?customers/i.test(norm),
    has_see_all_testimonials: /see all testimonials/i.test(norm),
    has_dresner: /dresner advisory/i.test(norm),
    has_how_it_works: /how .+ works for agencies/i.test(norm),
    rating_platforms: ratingPlatforms,
    char_count: norm.length
  };
}

/**
 * Count how many marker strings appear in brief text (case-insensitive).
 * @param {string} text
 * @param {string[]} markers
 */
export function countBriefMarkers(text, markers = []) {
  const lower = (text || '').toLowerCase();
  let found = 0;
  const missing = [];
  for (const raw of markers) {
    const needle = raw.toLowerCase();
    if (lower.includes(needle)) found += 1;
    else missing.push(raw);
  }
  return { found, missing, expected: markers.length };
}

/**
 * @param {object} inventory — from inventoryBrief + marker counts
 * @param {object} composite
 * @returns {{ issues: string[], warnings: string[] }}
 *
 * Honest gate design: a real Writer doc legitimately varies in length from the
 * archetype's gold-standard template (fewer FAQs, steps, features, etc.). Those
 * count shortfalls are advisory WARNINGS — they must not hard-stop an otherwise
 * complete brief. Genuine content problems (missing required strings, no archetype
 * match) are handled by the caller as hard errors; truncated extraction is caught
 * by the orchestrator's partial-extraction gate. Only explicit `require_*` flags
 * that the archetype actually turns on remain hard issues here.
 */
export function checkBriefInventory(inventory, composite) {
  const issues = [];
  const warnings = [];
  const checks = composite.section_inventory_checks || {};

  if (checks.min_steps != null && inventory.step_count < checks.min_steps) {
    warnings.push(`Fewer steps than template (found ${inventory.step_count}, template ~${checks.min_steps}) — composing what the doc contains`);
  }
  if (checks.min_faq != null && inventory.faq_count < checks.min_faq) {
    warnings.push(`Fewer FAQ items than template (found ${inventory.faq_count}, template ~${checks.min_faq}) — composing what the doc contains`);
  }
  if (checks.min_rating_platforms != null && inventory.rating_platforms.length < checks.min_rating_platforms) {
    warnings.push(`Fewer rating platforms than template (found ${inventory.rating_platforms.length}, template ~${checks.min_rating_platforms})`);
  }
  if (checks.min_example_rows != null) {
    const count = inventory.example_row_count ?? inventory.image_placeholder_count ?? 0;
    if (count < checks.min_example_rows) {
      warnings.push(`Fewer example rows than template (found ${count}, template ~${checks.min_example_rows})`);
    }
  }
  if (checks.min_impl_steps != null && (inventory.impl_step_count ?? 0) < checks.min_impl_steps) {
    warnings.push(`Fewer implementation steps than template (found ${inventory.impl_step_count ?? 0}, template ~${checks.min_impl_steps})`);
  }
  if (checks.min_feature_blocks != null && (inventory.feature_block_count ?? 0) < checks.min_feature_blocks) {
    warnings.push(`Fewer feature blocks than template (found ${inventory.feature_block_count ?? 0}, template ~${checks.min_feature_blocks})`);
  }
  if (checks.min_persona_blocks != null && (inventory.persona_block_count ?? 0) < checks.min_persona_blocks) {
    warnings.push(`Fewer persona blocks than template (found ${inventory.persona_block_count ?? 0}, template ~${checks.min_persona_blocks})`);
  }
  if (checks.min_benefit_blocks != null && (inventory.benefit_block_count ?? 0) < checks.min_benefit_blocks) {
    warnings.push(`Fewer benefit blocks than template (found ${inventory.benefit_block_count ?? 0}, template ~${checks.min_benefit_blocks})`);
  }
  if (checks.min_customer_stories != null && (inventory.customer_story_count ?? 0) < checks.min_customer_stories) {
    warnings.push(`Fewer customer stories than template (found ${inventory.customer_story_count ?? 0}, template ~${checks.min_customer_stories})`);
  }

  // Explicit archetype requirements stay hard — but only when the archetype
  // actually turns them on (these default to false for docs that don't need them).
  if (checks.require_testimonials_heading && !inventory.has_testimonials_heading) {
    issues.push('Missing testimonials heading (e.g. "Hear from our happy customers")');
  }
  if (checks.require_see_all_testimonials && !inventory.has_see_all_testimonials) {
    issues.push('Missing "See all testimonials" link text');
  }
  if (checks.require_dresner && !inventory.has_dresner) {
    issues.push('Missing Dresner Advisory recognition block');
  }
  if (checks.require_how_it_works && !inventory.has_how_it_works) {
    issues.push('Missing how-it-works heading');
  }

  return { issues, warnings };
}

/**
 * Enrich brief inventory with marker-based counts from section_inventory_checks.
 * @param {string} briefText
 * @param {object} composite
 */
export function enrichBriefInventory(briefText, composite) {
  const base = inventoryBrief(briefText);
  const checks = composite.section_inventory_checks || {};

  const exampleMarkers = checks.example_row_markers || [];
  const implMarkers = checks.impl_step_markers || [];
  const featureMarkers = checks.feature_markers || [];
  const personaMarkers = checks.persona_markers || [];
  const benefitMarkers = checks.benefit_markers || [];
  const storyMarkers = checks.customer_story_markers || [];

  const exampleRows = countBriefMarkers(briefText, exampleMarkers);
  const implSteps = countBriefMarkers(briefText, implMarkers);
  const features = countBriefMarkers(briefText, featureMarkers);
  const personas = countBriefMarkers(briefText, personaMarkers);
  const benefits = countBriefMarkers(briefText, benefitMarkers);
  const stories = countBriefMarkers(briefText, storyMarkers);

  return {
    ...base,
    example_row_count: exampleMarkers.length ? exampleRows.found : base.image_placeholder_count,
    example_row_missing: exampleRows.missing,
    impl_step_count: implMarkers.length ? implSteps.found : base.step_count,
    impl_step_missing: implSteps.missing,
    feature_block_count: features.found,
    feature_block_missing: features.missing,
    persona_block_count: personas.found,
    persona_block_missing: personas.missing,
    benefit_block_count: benefits.found,
    benefit_block_missing: benefits.missing,
    customer_story_count: stories.found,
    customer_story_missing: stories.missing
  };
}

/**
 * @param {string} html
 * @param {string} css
 */
export function inventoryOutput(html, css) {
  const countClass = (className) => {
    const re = new RegExp(`class=["'][^"']*\\b${className}\\b`, 'gi');
    return (html.match(re) || []).length;
  };

  const countSelectorOccurrences = (selector) => {
    const classMatch = selector.match(/^\.([a-zA-Z0-9_-]+)$/);
    if (classMatch) return countClass(classMatch[1]);
    if (selector === '.z-accordianBox') return countClass('z-accordianBox');
    return 0;
  };

  const ctaMatches = [...html.matchAll(/class=["'][^"']*\bcta-btn\b[^"']*\bact-btn\b[^"']*["'][^>]*>([^<]+)</gi)];
  const ctaTexts = ctaMatches.map((m) => m[1].trim()).filter(Boolean);

  const hasNavPlaceholder = /nav\s*—\s*team template|insert global nav|NAV\s*—\s*TEAM TEMPLATE/i.test(html);
  const hasFooterPlaceholder = /footer\s*—\s*team template|insert global footer|FOOTER\s*—\s*TEAM TEMPLATE/i.test(html);
  const hasPageContainer = /class=["'][^"']*\bpage-container\b/.test(html);
  const hasZohoPlaceholder = /prezohoweb\.zoho\.com/.test(html);
  const hasPlaceholdCo = /placehold\.co/i.test(html);
  const hasLocalAssets = /src=["']\.\/assets\//i.test(html);

  const h1Count = (html.match(/<h1\b/gi) || []).length;

  return {
    example_row: countClass('example-row'),
    impl_step: countClass('impl-step'),
    feature_block: countClass('feature-block'),
    persona_block: countClass('persona-block'),
    benefit_block: countClass('benefit-block'),
    za_inner_testimonials: countClass('za-inner-testimonials'),
    z_accordian_box: countClass('z-accordianBox'),
    cont_sec: countClass('cont-sec'),
    banner: countClass('banner'),
    tabsection: countClass('tabsection'),
    faq_section: countClass('faq-section'),
    cta_button_count: ctaTexts.length,
    cta_texts: ctaTexts,
    h1_count: h1Count,
    has_page_container: hasPageContainer,
    has_nav_placeholder: hasNavPlaceholder,
    has_footer_placeholder: hasFooterPlaceholder,
    has_zoho_placeholder: hasZohoPlaceholder,
    has_placehold_co: hasPlaceholdCo,
    has_local_assets: hasLocalAssets,
    has_cta_visibility_override: /\.page-container\s+\.cta-btn\.act-btn/.test(css) &&
      /display:\s*inline-block/.test(css),
    has_brand_cta_token: /--primary-btn-color:\s*#e42527/i.test(css) || /--color-brand-cta:\s*#e42527/i.test(css),
    pre_banner_section: countClass('pre-banner-section'),
    has_pre_banner_background: /\.pre-banner-section/.test(css) &&
      (/background-image/.test(css) ||
        /blue-shadow-with-texture/.test(css) ||
        /radial-gradient|linear-gradient/.test(css) ||
        /#f8f9fc|#eef5ff|#e7f6f1|#ebe7ff|#053643|#362546/.test(css) ||
        /#conclusion\.pre-banner-section/.test(css)),
    countSelectorOccurrences
  };
}

/**
 * Extract the body of the first top-level CSS rule for a selector.
 * @param {string} css
 * @param {string} selector
 */
export function extractTopLevelRule(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`${escaped}(?![\\w-])\\s*\\{`, 'i');
  const start = css.search(re);
  if (start < 0) return '';
  const braceStart = css.indexOf('{', start);
  let depth = 1;
  let i = braceStart + 1;
  while (i < css.length && depth > 0) {
    if (css[i] === '{') depth += 1;
    else if (css[i] === '}') depth -= 1;
    i += 1;
  }
  return css.slice(braceStart + 1, i - 1);
}

/**
 * Normalize background-related declarations for comparison.
 * @param {string} ruleBody
 */
export function extractBgFingerprint(ruleBody) {
  if (!ruleBody) return '';
  const parts = [];
  const bgColor = ruleBody.match(/background-color\s*:\s*([^;]+)/i);
  const bgImage = ruleBody.match(/background-image\s*:\s*([^;]+)/i);
  const bgShorthand = ruleBody.match(/(?:^|[\s{])background\s*:\s*([^;]+)/i);
  if (bgColor) parts.push(`background-color:${bgColor[1].trim()}`);
  if (bgImage) parts.push(`background-image:${bgImage[1].trim()}`);
  if (!bgColor && !bgImage && bgShorthand) parts.push(`background:${bgShorthand[1].trim()}`);
  return parts.join(';').replace(/\s+/g, ' ').toLowerCase();
}

/**
 * @param {string} html
 * @param {string} css
 * @param {object} composite
 */
export function checkBannerSlots(html, css, composite) {
  const issues = [];
  const warnings = [];
  const sections = composite.section_order || [];
  const slots = sections.filter((s) => s.banner_slot);
  if (!slots.length) return { issues, warnings, banner_audit: null };

  const checks = composite.output_inventory_checks || {};
  const heroSlot = slots.find((s) => s.banner_slot === 'hero');
  const midSlot = slots.find((s) => s.banner_slot === 'mid-cta');
  const closingSlot = slots.find((s) => s.banner_slot === 'closing-cta');

  if (heroSlot) {
    const heroClass = heroSlot.class || '';
    if (heroClass === 'banner-section' && !/\bbanner-section\b/.test(html)) {
      issues.push(`Hero must use \`.${heroClass}\` (banner_slot: hero)`);
    }
    if (heroClass === 'banner' && !/<section class=["'][^"']*\bbanner\b/.test(html)) {
      issues.push('Hero must use `banner` section (banner_slot: hero)');
    }
    if (heroClass === 'za-banner-section' && !/\bza-banner-section\b/.test(html)) {
      issues.push('Hero must use `za-banner-section` (banner_slot: hero)');
    }
  }

  if (midSlot && midSlot.bg_treatment === 'bg-white') {
    const hasOneClickWhite =
      /id=["']one-click-cta["'][^>]*class=["'][^"']*\bbg-white\b/i.test(html) ||
      /class=["'][^"']*\bbg-white\b[^"']*["'][^>]*id=["']one-click-cta["']/i.test(html);
    if (!hasOneClickWhite) {
      issues.push('Mid-page one-click CTA must be `pre-banner-section bg-white` with id="one-click-cta"');
    }
    if (!/\.pre-banner-section\.bg-white/.test(css)) {
      warnings.push('Add `.pre-banner-section.bg-white { background-color: #fff; }` for one-click CTA band');
    }
  }

  if (closingSlot) {
    if (!/id=["']conclusion["']/i.test(html) && closingSlot.id === 'conclusion') {
      warnings.push('Closing CTA should use id="conclusion" on pre-banner-section');
    }
    if (closingSlot.bg_treatment === 'gradient-closing' &&
        /id=["']conclusion["'][^>]*\bbg-white\b/i.test(html)) {
      issues.push('Closing CTA (#conclusion) must not use bg-white — use gradient-closing treatment');
    }
    // texture-closing / end-banner-pool: any catalogued end-banner treatment is OK
    // (EB-01 soft-texture, EB-02 flat-neutral, EB-03 dark-teal, EB-04 theme-wash, …)
    const closingTreatment = closingSlot.bg_treatment || '';
    const usesEndBannerPool =
      closingTreatment === 'texture-closing' ||
      closingTreatment === 'end-banner-pool' ||
      /closing$/i.test(closingTreatment);

    if (usesEndBannerPool) {
      const conclusionRule =
        extractTopLevelRule(css, '#conclusion.pre-banner-section') ||
        extractTopLevelRule(css, '.pre-banner-section');
      const hasConcreteBg =
        /background(-image|-color)?\s*:/i.test(conclusionRule) &&
        !/background(-color)?\s*:\s*#fff(f{0,3})?\s*;/i.test(conclusionRule) &&
        !/background(-color)?\s*:\s*white\s*;/i.test(conclusionRule);

      if (!hasConcreteBg) {
        issues.push(
          'Closing CTA (#conclusion) needs a real end-banner background from z_workflow/end-banner-types.json — not plain white'
        );
      }
    }
  }

  const heroSelectors = [
    '.banner-section',
    '.banner .banner-bg',
    '.banner-bg',
    '.za-banner-section'
  ];
  let heroBg = '';
  for (const sel of heroSelectors) {
    const fp = extractBgFingerprint(extractTopLevelRule(css, sel));
    if (fp) {
      heroBg = fp;
      break;
    }
  }

  const closingBg = extractBgFingerprint(extractTopLevelRule(css, '.pre-banner-section'));
  const midWhiteBg = extractBgFingerprint(extractTopLevelRule(css, '.pre-banner-section.bg-white'));

  const requireDistinct =
    checks.require_distinct_hero_closing_bg !== false &&
    heroSlot &&
    closingSlot;

  if (requireDistinct && heroBg && closingBg && heroBg === closingBg) {
    issues.push(
      'Hero and closing `.pre-banner-section` share identical background CSS — use different banner_slot treatments (see banner-selection-guide.md)'
    );
  }

  // Closing may use theme radials (EB-04) etc. — only fail when fingerprints are identical
  // (already checked above). Soft warn if closing looks like a clone of hero tokens.
  if (
    heroSlot?.bg_treatment === 'gradient-hero' &&
    closingSlot?.banner_slot === 'closing-cta' &&
    heroBg &&
    closingBg &&
    heroBg.replace(/\s+/g, '') === closingBg.replace(/\s+/g, '')
  ) {
    issues.push(
      'Closing CTA background matches hero exactly — pick a different end-banner type from end-banner-types.json'
    );
  }

  if (midSlot && closingSlot && midWhiteBg && closingBg && midWhiteBg === closingBg) {
    issues.push('Mid-page one-click and closing CTA bands must not share the same background CSS');
  }

  if (heroSlot && closingSlot && heroSlot.class === closingSlot.class && heroBg && closingBg && heroBg === closingBg) {
    issues.push(
      `Hero and closing both use \`.${heroSlot.class}\` with identical background — pick distinct bg_treatment per banner_slot`
    );
  }

  return {
    issues,
    warnings,
    banner_audit: {
      hero_bg_fingerprint: heroBg || null,
      closing_bg_fingerprint: closingBg || null,
      mid_white_bg_fingerprint: midWhiteBg || null,
      slots: slots.map((s) => ({
        type: s.type,
        class: s.class,
        banner_slot: s.banner_slot,
        bg_treatment: s.bg_treatment,
        id: s.id
      }))
    }
  };
}

/**
 * @param {object} inventory — from inventoryOutput
 * @param {object} composite
 * @param {{ html?: string, css?: string }} files
 * @param {object|null} briefInventory — enriched brief counts, used to scale
 *   count minimums down to what the source doc actually contains. The page must
 *   include everything the doc has (no dropped sections), but we never demand more
 *   blocks than the doc provides. Length-richness metrics become warnings.
 */
export function checkOutputInventory(inventory, composite, files = {}, briefInventory = null) {
  const issues = [];
  const warnings = [];
  const checks = composite.output_inventory_checks || {};
  const selectors = checks.selectors || {};

  // Map an output selector key → the brief inventory field that supplies it.
  const BRIEF_FIELD_FOR_SELECTOR = {
    example_row: 'example_row_count',
    impl_step: 'impl_step_count',
    feature_block: 'feature_block_count',
    persona_block: 'persona_block_count',
    benefit_block: 'benefit_block_count',
    za_inner_testimonials: 'customer_story_count',
    z_accordian_box: 'faq_count'
  };

  const effectiveMin = (key, templateMin) => {
    const field = BRIEF_FIELD_FOR_SELECTOR[key];
    if (briefInventory && field && briefInventory[field] != null) {
      // Require at least what the doc provides, capped at the template expectation.
      return Math.max(0, Math.min(templateMin, briefInventory[field]));
    }
    return templateMin;
  };

  for (const [key, rule] of Object.entries(selectors)) {
    const templateMin = rule.min ?? 0;
    const min = effectiveMin(key, templateMin);
    const count = inventory[key] ?? inventory.countSelectorOccurrences(rule.selector || `.${key}`);
    if (count < min) {
      issues.push(`Expected ≥${min} \`${rule.selector || key}\`, found ${count}${min < templateMin ? ` (scaled from template ~${templateMin} to match brief)` : ''}`);
    }
  }

  for (const cls of checks.required_classes || []) {
    const key = cls.replace(/-/g, '_');
    const count = inventory[key] ?? inventory.countSelectorOccurrences(`.${cls}`);
    if (!count) {
      issues.push(`Missing required class \`.${cls}\` in HTML`);
    }
  }

  if (checks.min_cont_sec != null && inventory.cont_sec < checks.min_cont_sec) {
    // Content-section richness scales with doc length — advisory, not a hard stop.
    warnings.push(`Fewer \`.cont-sec\` blocks than template (found ${inventory.cont_sec}, template ~${checks.min_cont_sec})`);
  }

  const ctaRequired = composite.cta_strings_required || [];
  const htmlLower = (files.html || '').toLowerCase();
  for (const cta of ctaRequired) {
    if (!htmlLower.includes(cta.toLowerCase())) {
      issues.push(`Missing required CTA text: "${cta}"`);
    }
  }

  if (checks.require_cta_visibility_override !== false && !inventory.has_cta_visibility_override) {
    issues.push('Missing `.page-container .cta-btn.act-btn { display: inline-block; … }` override in style.css');
  }

  if (checks.require_brand_cta_token !== false && !inventory.has_brand_cta_token) {
    issues.push('Missing brand CTA token `--primary-btn-color: #e42527` in style.css');
  }

  // Article TOC layout (comparison-guide / cloud-reporting-tools format)
  // Gold: output/cloud-analytics — 340px left-tab + 100px cont-sec gutter
  if (checks.require_article_toc_layout) {
    const css = files.css || '';
    const html = files.html || '';
    if (!/\.left-tab\b/.test(html) && !/class="[^"]*left-tab/.test(html)) {
      issues.push('Article TOC: missing `.left-tab` in HTML (gold: output/cloud-analytics)');
    }
    if (!/id=["']tabs["']/.test(html) && !/class="[^"]*\btabs\b/.test(html)) {
      issues.push('Article TOC: missing `ul#tabs` / `.tabs` sidebar links');
    }
    if (!/Go from data to insights/i.test(html)) {
      warnings.push('Article TOC: peach sidebar CTA copy ("Go from data to insights…") not found');
    }
    // Peach CTA must be inside ul#tabs (live appendChild) — not a sibling after </ul>
    if (
      /id=["']tabs["'][\s\S]*?<\/ul>/i.test(html) &&
      /Go from data to insights/i.test(html) &&
      !/id=["']tabs["'][\s\S]*?Go from data to insights[\s\S]*?<\/ul>/i.test(html)
    ) {
      issues.push(
        'Article TOC: peach `.banner` CTA must be INSIDE `ul#tabs` (scrolls with TOC) — gold: output/cloud-analytics'
      );
    }
    const has340 =
      /flex:\s*0\s+0\s+340px/i.test(css) ||
      (/\.left-tab\s*\{[^}]{0,400}width:\s*340px/i.test(css) &&
        /width:\s*340px/i.test(css));
    if (!has340) {
      issues.push(
        'Article TOC: `.left-tab` must be 340px wide (live cloud-reporting-tools / output/cloud-analytics) — do not shrink rail'
      );
    }
    const hasGutter =
      /margin(?:-left)?:\s*[^;]*100px/i.test(css) &&
      (/\.cont-sec\s*\{[^}]{0,200}100px/i.test(css) ||
        /margin:\s*0\s+0\s+45px\s+100px/i.test(css));
    if (!hasGutter) {
      issues.push(
        'Article TOC: `.cont-sec` must use `margin-left: 100px` so content starts late (gold: output/cloud-analytics)'
      );
    }
    if (/href=["']#faqs?["']/i.test(html) && /left-tab[\s\S]{0,2500}href=["']#faqs?["']/i.test(html)) {
      issues.push('Article TOC: do not list FAQ in left-tab sidebar (keep `.faq-section` after tabsection)');
    }
    // Gold structure: only banner + tabsection + faq as top-level article shells
    // (fail when agent follows section_order as sibling <section>s)
    const badSiblingSection =
      /<section[^>]*class="[^"]*(?:comparison-table-section|comparison-table|tool-block)[^"]*"/i.test(
        html
      ) ||
      /<section[^>]*class="[^"]*\bcont-sec\b[^"]*"/i.test(html);
    if (badSiblingSection) {
      issues.push(
        'Article TOC STRUCTURE: nest comparison/tools/steps as .cont-sec INSIDE #right-content — do NOT emit sibling <section class="comparison-table-section|tool-block|cont-sec"> (gold: output/cloud-analytics)'
      );
    }
    // Between tabsection open and faq-section open (tag starts), no other <section>
    const tabOpen = html.search(/<section[^>]*class="[^"]*\btabsection\b/i);
    const faqOpen = html.search(/<section[^>]*class="[^"]*\bfaq-section\b/i);
    if (tabOpen >= 0 && faqOpen > tabOpen) {
      const between = html.slice(tabOpen, faqOpen);
      // Close of .tabsection = first </section> at depth 0 after open (simple: first close, nested sections rare)
      const tabEnd = between.indexOf('</section>');
      if (tabEnd >= 0) {
        const afterTabClose = between.slice(tabEnd + '</section>'.length);
        if (/<section\b/i.test(afterTabClose)) {
          issues.push(
            'Article TOC STRUCTURE: found <section> between .tabsection and .faq-section — gold has ONLY those two + hero (output/cloud-analytics)'
          );
        }
      }
    }
    // Scrollable TOC height (live: calc(100vh - 200px))
    if (!/100vh\s*-\s*200px/i.test(css) && !/calc\(\s*100vh\s*-\s*200px\s*\)/i.test(css)) {
      warnings.push(
        'Article TOC: ul#tabs should use height: calc(100vh - 200px) so peach CTA scrolls inside (gold-snippets/article-toc-layout.css)'
      );
    }
    // Horizontal table scroll (crushing mid-word = fail)
    if (/\.table-wrap|comparison-table/i.test(html + css)) {
      if (!/\.table-wrap\s*\{[^}]{0,300}overflow-x:\s*auto/i.test(css)) {
        issues.push(
          'Comparison tables: `.table-wrap` must have `overflow-x: auto` (gold: output/cloud-analytics / gold-snippets/article-toc-layout.css)'
        );
      }
      const hasWideMin =
        /min-width:\s*(960|1[12]\d{2})px/i.test(css) || /min-width:\s*1200px/i.test(css);
      if (!hasWideMin) {
        issues.push(
          'Comparison tables: use min-width ≥960px (3-col) / 1200px (.comparison-table-7col) so cells scroll, not crush'
        );
      }
      if (/word-break:\s*break-word/i.test(css) && !/word-break:\s*normal/i.test(css)) {
        warnings.push(
          'Comparison tables: prefer `word-break: normal` (avoid mid-word breaks like live cloud-reporting-tools)'
        );
      }
    }
  }

  for (const snippet of composite.mandatory_css || []) {
    const normCss = (files.css || '').replace(/\s+/g, ' ').toLowerCase();
    const css = files.css || '';
    const snippetChecks = [];
    if (/--color-brand-cta:\s*#e42527/i.test(snippet)) {
      snippetChecks.push(/--color-brand-cta:\s*#e42527/i.test(css));
    }
    if (/--primary-btn-color:\s*#e42527/i.test(snippet)) {
      snippetChecks.push(/--primary-btn-color:\s*#e42527/i.test(css));
    }
    if (/\.page-container\s+\.cta-btn\.act-btn/.test(snippet)) {
      snippetChecks.push(/\.page-container\s+\.cta-btn\.act-btn/.test(css) &&
        /display:\s*inline-block/.test(css));
    }
    if (/\.left-tab/.test(snippet) && /340px/.test(snippet)) {
      snippetChecks.push(
        /flex:\s*0\s+0\s+340px/i.test(css) || /\.left-tab\s*\{[^}]{0,400}width:\s*340px/i.test(css)
      );
    }
    if (/\.cont-sec/.test(snippet) && /100px/.test(snippet)) {
      snippetChecks.push(
        /margin(?:-left)?:\s*[^;]*100px/i.test(css) &&
          (/\.cont-sec\s*\{[^}]{0,200}100px/i.test(css) ||
            /margin:\s*0\s+0\s+45px\s+100px/i.test(css))
      );
    }
    if (!snippetChecks.length) {
      const normSnippet = snippet.replace(/\s+/g, ' ').trim().toLowerCase();
      if (!normCss.includes(normSnippet)) {
        warnings.push(`Mandatory CSS snippet may be missing or altered: ${snippet.slice(0, 60)}…`);
      }
    } else if (snippetChecks.some((ok) => !ok)) {
      warnings.push(`Mandatory CSS rule may be missing or altered: ${snippet.slice(0, 60)}…`);
    }
  }

  if (inventory.h1_count !== 1) {
    issues.push(`Expected exactly 1 H1, found ${inventory.h1_count}`);
  }

  if (!inventory.has_page_container) {
    issues.push('Missing `.page-container` wrapper');
  }

  if (checks.require_nav_placeholder && !inventory.has_nav_placeholder) {
    warnings.push('Nav placeholder comment not found (expected dev handoff slot)');
  }

  if (checks.require_footer_placeholder && !inventory.has_footer_placeholder) {
    warnings.push('Footer placeholder comment not found (expected dev handoff slot)');
  }

  if (inventory.has_placehold_co) {
    issues.push('Found forbidden placehold.co URL — use https://prezohoweb.zoho.com/');
  }

  if (inventory.has_local_assets) {
    issues.push('Found ./assets/ image paths — use placeholder URL during scaffold phase');
  }

  if (checks.require_zoho_placeholder && !inventory.has_zoho_placeholder) {
    warnings.push('No prezohoweb.zoho.com placeholder images found');
  }

  const ctaSections = (composite.section_order || []).filter((s) => s.type === 'cta');
  const needsPreBanner = ctaSections.some((s) =>
    /pre-banner-section/.test(s.class || '')
  );
  if (needsPreBanner) {
    if (!inventory.pre_banner_section) {
      issues.push('Missing `.pre-banner-section` — mid-page/closing red CTAs must sit inside a styled end-banner band');
    } else if (!inventory.has_pre_banner_background && checks.require_pre_banner_background !== false) {
      const closingSlot = (composite.section_order || []).find((s) => s.banner_slot === 'closing-cta');
      // Accept any catalogued end-banner treatment (#f8f9fc, dark gradient, warm pastel, texture, …)
      const conclusionCss =
        extractTopLevelRule(files.css || '', '#conclusion.pre-banner-section') ||
        extractTopLevelRule(files.css || '', '.pre-banner-section');
      const hasEndBannerBg =
        /background(-image|-color)?\s*:/i.test(conclusionCss) &&
        (/#f8f9fc|blue-shadow|linear-gradient|radial-gradient|#053643|#362546|#eef5ff|#e7f6f1|#ebe7ff|rgba\(248,\s*243,\s*192/i.test(
          conclusionCss
        ) ||
          /var\(--pre-banner-texture\)/i.test(conclusionCss));
      if (closingSlot && !hasEndBannerBg) {
        issues.push(
          'Closing `#conclusion.pre-banner-section` needs a catalogued end-banner background (see z_workflow/end-banner-types.json) — not plain white'
        );
      }
    }
  }

  const bannerSlotCheck = checkBannerSlots(files.html || '', files.css || '', composite);
  issues.push(...bannerSlotCheck.issues);
  warnings.push(...bannerSlotCheck.warnings);

  return { issues, warnings, banner_audit: bannerSlotCheck.banner_audit };
}
