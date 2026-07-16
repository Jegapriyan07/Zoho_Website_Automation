#!/usr/bin/env node
/**
 * Select a closing end-banner type for a build (deterministic by slug).
 *
 * Usage:
 *   node z_workflow/scripts/select-end-banner.mjs --slug testing-5
 *   node z_workflow/scripts/select-end-banner.mjs --slug foo --archetype dashboard-examples-landing-sales --json
 */

import fs from 'fs';
import path from 'path';
import { ROOT, STATE_FILE, isScriptMain } from './workflow-paths.mjs';

const CATALOG_PATH = path.join(ROOT, 'z_workflow', 'end-banner-types.json');

export function loadEndBannerCatalog() {
  return JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
}

function hashSlug(slug) {
  let h = 0;
  const s = String(slug || 'page');
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * @param {string} slug
 * @param {string|null} archetype
 * @returns {object} selected type + meta
 */
export function selectEndBanner(slug, archetype = null) {
  const catalog = loadEndBannerCatalog();
  const prefs =
    (archetype && catalog.archetype_prefs[archetype]) ||
    catalog.archetype_prefs._default ||
    catalog.types.map((t) => t.id);

  const idx = hashSlug(slug) % prefs.length;
  const id = prefs[idx];
  const type = catalog.types.find((t) => t.id === id) || catalog.types[0];

  return {
    id: type.id,
    name: type.name,
    label: type.label,
    bg_treatment: type.bg_treatment,
    html_modifier: type.html_modifier || '',
    text_color: type.text_color || 'dark',
    reference: type.reference,
    webtemplate_examples: type.webtemplate_examples || [],
    css_markers: type.css_markers || [],
    css_skeleton: type.css_skeleton,
    html_note: type.html_note || '',
    notes: type.notes || '',
    pool: prefs,
    catalog_version: catalog.version
  };
}

/**
 * True if CSS fingerprint matches the selected (or any) end-banner type.
 * @param {string} css
 * @param {object|null} selected
 */
export function cssMatchesEndBanner(css, selected = null) {
  const catalog = loadEndBannerCatalog();
  const types = selected
    ? catalog.types.filter((t) => t.id === selected.id)
    : catalog.types;

  const blob = css || '';
  // Prefer matching the selected type; fall back to any catalog type.
  const checkList = types.length ? types : catalog.types;
  for (const t of checkList) {
    const markers = t.css_markers || [];
    if (!markers.length) continue;
    if (t.requires_any_marker) {
      if (markers.some((m) => blob.includes(m))) return { ok: true, matched: t.id };
    } else if (markers.every((m) => blob.includes(m)) || markers.some((m) => blob.includes(m))) {
      // At least one strong marker is enough for soft washes / multi-token types
      return { ok: true, matched: t.id };
    }
  }

  // Soft acceptance: any closing treatment that is clearly not plain white mid-cta
  if (
    /#conclusion\.pre-banner-section|\.pre-banner-section\s*\{/.test(blob) &&
    (/background(-image|-color)?:/i.test(blob) || /linear-gradient|radial-gradient|blue-shadow/i.test(blob)) &&
    !/^\s*background(-color)?:\s*#fff(fff)?\s*;/im.test(blob)
  ) {
    return { ok: true, matched: 'generic-non-white' };
  }

  return { ok: false, matched: null };
}

function parseArgs(argv) {
  const args = { slug: null, archetype: null, json: false, fromState: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--slug') args.slug = argv[++i];
    else if (argv[i] === '--archetype') args.archetype = argv[++i];
    else if (argv[i] === '--json') args.json = true;
    else if (argv[i] === '--from-state') args.fromState = true;
  }
  return args;
}

if (isScriptMain(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  let slug = args.slug;
  let archetype = args.archetype;
  if (args.fromState && fs.existsSync(STATE_FILE)) {
    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    slug = slug || state.page_slug;
    archetype = archetype || state.writer_brief?.archetype || state.similarity?.archetype;
  }
  if (!slug) {
    console.error('Pass --slug <page-slug> or --from-state');
    process.exit(1);
  }
  const picked = selectEndBanner(slug, archetype);
  if (args.json) {
    console.log(JSON.stringify(picked, null, 2));
  } else {
    console.log(`${picked.id} · ${picked.label}`);
    console.log(`  treatment: ${picked.bg_treatment}`);
    console.log(`  reference: ${picked.reference}`);
    console.log(`  pool: ${picked.pool.join(', ')}`);
  }
}
