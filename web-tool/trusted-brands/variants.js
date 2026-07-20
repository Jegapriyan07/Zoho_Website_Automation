// variants.js — map archetype / section-composites → Trusted Brands inject variant.
// Composer + ★ Trusted Brands checkbox must agree on which block to inject.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMPOSITES_FILE = path.join(__dirname, '..', '..', 'z_workflow', 'section-composites.json');

/** @typedef {'marquee' | 'branding-section'} TrustedBrandsVariant */

export const TRUSTED_BRANDS_VARIANTS = {
  marquee: {
    id: 'marquee',
    label: 'Marquee + stats card',
    bem: 'za-brandsCounts',
    description: 'Logo marquee track + 22K/4M counts card (BI software / default inject)',
    gold: 'testing-3 / bi-software za-brandsCounts'
  },
  'branding-section': {
    id: 'branding-section',
    label: 'Counter + logo grid',
    bem: 'branding-section',
    description: 'TRUSTED BY GREAT BRANDS · pink bc1 counter LEFT · logo grid RIGHT (mobile-apps / Shopify)',
    gold: 'https://www.zoho.com/analytics/mobile-apps.html'
  }
};

/** Archetypes that use live solutions branding-section when ★ Trusted Brands is on. */
export const BRANDING_SECTION_ARCHETYPES = new Set([
  'mobile-apps-landing',
  'app-connector-landing'
]);

function loadComposites() {
  try {
    return JSON.parse(fs.readFileSync(COMPOSITES_FILE, 'utf8')).composites || {};
  } catch {
    return {};
  }
}

/**
 * Resolve inject variant from composite.trusted_brands_inject or archetype id.
 * @param {string|null|undefined} archetypeId
 * @param {object|null|undefined} [composite]
 * @returns {{ variant: TrustedBrandsVariant, meta: object, source: string }}
 */
export function resolveTrustedBrandsVariant(archetypeId, composite = null) {
  const composites = composite ? null : loadComposites();
  const comp = composite || (archetypeId ? composites[archetypeId] : null);
  const fromComposite = comp?.trusted_brands_inject?.variant;

  let variant = 'marquee';
  let source = 'default';

  if (fromComposite === 'branding-section' || fromComposite === 'marquee') {
    variant = fromComposite;
    source = 'section-composites.trusted_brands_inject';
  } else if (archetypeId && BRANDING_SECTION_ARCHETYPES.has(archetypeId)) {
    variant = 'branding-section';
    source = 'archetype-map';
  }

  const meta = {
    ...TRUSTED_BRANDS_VARIANTS[variant],
    heading: comp?.trusted_brands_inject?.heading || 'TRUSTED BY GREAT BRANDS',
    archetype: archetypeId || null
  };

  return { variant, meta, source };
}
