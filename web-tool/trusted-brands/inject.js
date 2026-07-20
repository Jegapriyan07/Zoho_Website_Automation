// trusted-brands/inject.js
// Post-compose injection + verification (single source for all build paths).
// Variant is chosen from section-composites / archetype (composer agreement).

import fs from 'node:fs';
import { buildMarqueeSnippet, stripTrustedBrandsBlock } from './marquee-template.js';
import { buildBrandingSectionSnippet } from './branding-section-template.js';
import { DEFAULT_BRAND_LIST } from './brands-data.js';
import { resolveTrustedBrandsVariant } from './variants.js';

/**
 * @param {'marquee'|'branding-section'} variant
 * @param {Array} brands
 */
function buildSnippetForVariant(variant, brands) {
  if (variant === 'branding-section') {
    return buildBrandingSectionSnippet();
  }
  return buildMarqueeSnippet(brands);
}

/**
 * Insert the trusted-brands snippet after the first </section> (hero close).
 * @param {string} html
 * @param {Array} [brands]
 * @param {{ variant?: string, archetype?: string, composite?: object }} [opts]
 * @returns {string}
 */
export function injectTrustedBrandsIntoHtml(html, brands = DEFAULT_BRAND_LIST, opts = {}) {
  const cleaned = stripTrustedBrandsBlock(html);
  const resolved =
    opts.variant === 'marquee' || opts.variant === 'branding-section'
      ? { variant: opts.variant, meta: {}, source: 'explicit' }
      : resolveTrustedBrandsVariant(opts.archetype, opts.composite);
  const snippet = buildSnippetForVariant(resolved.variant, brands);

  const firstSectionEnd = cleaned.indexOf('</section>');
  if (firstSectionEnd === -1) {
    const bodyOpen = cleaned.search(/<body[^>]*>/i);
    if (bodyOpen === -1) return cleaned + snippet;
    const bodyTagEnd = cleaned.indexOf('>', bodyOpen) + 1;
    return cleaned.slice(0, bodyTagEnd) + '\n' + snippet + cleaned.slice(bodyTagEnd);
  }

  const insertAt = firstSectionEnd + '</section>'.length;
  return cleaned.slice(0, insertAt) + '\n' + snippet + cleaned.slice(insertAt);
}

/**
 * Verify injected trusted-brands block for the resolved variant.
 * @param {string} html
 * @param {{ variant?: string, archetype?: string, composite?: object }} [opts]
 * @returns {{ ok: boolean, errors: string[], warnings: string[], variant: string }}
 */
export function verifyTrustedBrandsHtml(html, opts = {}) {
  const errors = [];
  const warnings = [];
  const resolved =
    opts.variant === 'marquee' || opts.variant === 'branding-section'
      ? { variant: opts.variant }
      : resolveTrustedBrandsVariant(opts.archetype, opts.composite);
  const variant = resolved.variant;

  if (!html.includes('TRUSTED BRANDS SECTION — auto-injected by Web Page Builder')) {
    errors.push('Missing auto-injected trusted brands marker comments');
  }

  if (variant === 'branding-section') {
    if (!html.includes('class="branding-section"') && !html.includes("class='branding-section'")) {
      errors.push('Missing .branding-section (architecture expects counter + logo grid, not marquee)');
    }
    if (html.includes('data-tb-variant="marquee"') || html.includes('class="za-brandsCounts"')) {
      errors.push(
        'Wrong Trusted Brands variant: found marquee (.za-brandsCounts) but archetype requires branding-section'
      );
    }
    if (!html.includes('branding-wrap') || !html.includes('branding-count bc1') || !html.includes('branding-count bc2')) {
      errors.push('Missing .branding-wrap / .bc1 / .bc2 layout (live mobile-apps gold)');
    }
    if (!html.includes('Trusted by Great Brands') && !html.includes('TRUSTED BY GREAT BRANDS')) {
      errors.push('Missing TRUSTED BY GREAT BRANDS heading');
    }
    if (!html.includes('za-thousand-customers') || !html.includes('za-million-users')) {
      errors.push('Missing za-thousand-customers / za-million-users counter attributes');
    }
    if (!html.includes('zp-trust-brands-sprite.png')) {
      errors.push('Missing live zp-trust-brands-sprite.png (IKEA/HP sprite logos — not India marquee imgs)');
    }
    if (!html.includes('zicon-ikea') || !html.includes('zicon-hp-wrap') || !html.includes('zicon-johnson')) {
      errors.push('Missing live sprite icon classes (zicon-ikea / zicon-hp-wrap / zicon-johnson)');
    }
    if (!html.includes('tb-scaleEffect') || !html.includes('line-animated')) {
      errors.push('Missing one-by-one logo entrance (tb-scaleEffect / line-animated scroll reveal)');
    }
    if (html.includes('otherbrandlogos/hdfc') || html.includes('otherbrandlogos/nippon-paint')) {
      errors.push('India marquee logos found in branding-section — use live sprite set only');
    }
    const iconCount = (html.match(/zicon-/g) || []).length;
    if (iconCount < 9) {
      errors.push(`Expected at least 9 branding-section sprite icons, found ${iconCount}`);
    }
  } else {
    if (!html.includes('class="za-brandsCounts"')) {
      errors.push('Missing .za-brandsCounts section');
    }
    if (html.includes('data-tb-variant="branding-section"')) {
      errors.push('Wrong Trusted Brands variant: found branding-section but architecture expects marquee');
    }
    if (!html.includes('dashboard-wrapper')) {
      warnings.push('No .dashboard-wrapper found — expected for dashboard zigzag builds');
    }
    if (!html.includes('trusted-icon-wrap')) {
      errors.push('Missing .trusted-icon-wrap marquee container');
    }
    if (!html.includes('za-cust-counts') || !html.includes('data-onscroll')) {
      errors.push('Missing .za-cust-counts[data-onscroll] stats block');
    }
    if (!html.includes('za-thousand-customers') || !html.includes('za-million-users')) {
      errors.push('Missing za-thousand-customers / za-million-users counter attributes');
    }
    if (!html.includes('SLICK_STEP_PX')) {
      errors.push('Missing live-calibrated marquee speed (SLICK_STEP_PX)');
    }
    if (!html.includes('--tb-scroll-end')) {
      errors.push('Missing pixel-based marquee scroll distance (--tb-scroll-end)');
    }
    if (!html.includes('loading="lazy"')) {
      errors.push('Brand logo images must use loading="lazy"');
    }
    if (!html.includes('https://prezohoweb.zoho.com/sites/zweb/images/otherbrandlogos/')) {
      errors.push('Brand logos must use https://prezohoweb.zoho.com/ image paths');
    }

    const logoCount = (html.match(/class="ae-icon"/g) || []).length;
    const expectedMin = DEFAULT_BRAND_LIST.length;
    if (logoCount < expectedMin) {
      errors.push(`Expected at least ${expectedMin} brand logos, found ${logoCount}`);
    }

    const leftRows = (html.match(/main-wrapper left-content/g) || []).length;
    const rightRows = (html.match(/main-wrapper right-content/g) || []).length;
    if (html.includes('dashboard-wrapper') && (leftRows < 1 || rightRows < 1)) {
      errors.push('dashboard-wrapper must include alternating .left-content and .right-content rows');
    }
  }

  return { ok: errors.length === 0, errors, warnings, variant };
}

/**
 * Inject into output/<slug>/index.html on disk.
 * @param {string} htmlPath
 * @param {Array} [brands]
 * @param {{ variant?: string, archetype?: string, composite?: object }} [opts]
 * @returns {{ ok: boolean, path?: string, placement?: string, verify?: object, variant?: string, reason?: string }}
 */
export function injectTrustedBrandsFile(htmlPath, brands = DEFAULT_BRAND_LIST, opts = {}) {
  if (!fs.existsSync(htmlPath)) {
    return { ok: false, reason: 'index.html not found' };
  }

  const resolved =
    opts.variant === 'marquee' || opts.variant === 'branding-section'
      ? { variant: opts.variant }
      : resolveTrustedBrandsVariant(opts.archetype, opts.composite);

  const html = fs.readFileSync(htmlPath, 'utf8');
  const updated = injectTrustedBrandsIntoHtml(html, brands, {
    ...opts,
    variant: resolved.variant
  });
  fs.writeFileSync(htmlPath, updated, 'utf8');

  const placement = html.indexOf('</section>') === -1 ? 'after-body' : 'after-hero';
  const verify = verifyTrustedBrandsHtml(updated, { ...opts, variant: resolved.variant });

  return { ok: true, path: htmlPath, placement, verify, variant: resolved.variant };
}

export { resolveTrustedBrandsVariant };
