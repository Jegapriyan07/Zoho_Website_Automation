#!/usr/bin/env node
/**
 * Find webtemplate pages whose section descriptions match a brief section need.
 *
 * Usage:
 *   node z_workflow/scripts/find-webtemplate-section.mjs hero "split left"
 *   node z_workflow/scripts/find-webtemplate-section.mjs faq --category "Core Features"
 *   node z_workflow/scripts/find-webtemplate-section.mjs zigzag --limit 5
 */

import fs from 'fs';
import path from 'path';
import { ROOT, isScriptMain } from './workflow-paths.mjs';

const SITEMAP_PATH = path.join(ROOT, 'webtemplate', 'sitemap-categorized.json');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { type: null, query: [], category: null, limit: 10 };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--category') opts.category = args[++i];
    else if (args[i] === '--limit') opts.limit = parseInt(args[++i], 10) || 10;
    else if (!opts.type) opts.type = args[i].toLowerCase();
    else opts.query.push(args[i].toLowerCase());
  }
  return opts;
}

function scoreEntry(entry, opts) {
  if (!entry.sections?.length) return -1;

  let best = 0;
  const hits = [];

  for (const sec of entry.sections) {
    let score = 0;
    const blob = `${sec.type} ${sec.class} ${sec.layout} ${sec.description}`.toLowerCase();

    if (opts.type && sec.type === opts.type) score += 4;
    else if (opts.type && blob.includes(opts.type)) score += 2;

    for (const q of opts.query) {
      if (blob.includes(q)) score += 3;
    }

    if (score > best) {
      best = score;
      hits.length = 0;
      hits.push(sec);
    } else if (score === best && score > 0) {
      hits.push(sec);
    }
  }

  if (best <= 0) return -1;
  return { score: best, section: hits[0] };
}

export function findWebtemplateSections(opts = parseArgs()) {
  const sitemap = JSON.parse(fs.readFileSync(SITEMAP_PATH, 'utf8'));
  const results = [];

  for (const [category, entries] of Object.entries(sitemap)) {
    if (category.startsWith('_')) continue;
    if (opts.category && category !== opts.category) continue;

    for (const entry of entries) {
      const match = scoreEntry(entry, opts);
      if (match === -1) continue;
      results.push({
        score: match.score,
        category,
        name: entry.name,
        url: entry.url,
        page_topic: entry.page_topic || '',
        matched_section: match.section
      });
    }
  }

  results.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  return results.slice(0, opts.limit);
}

if (isScriptMain(import.meta.url)) {
  const opts = parseArgs();
  if (!opts.type && !opts.query.length) {
    console.error('Usage: find-webtemplate-section.mjs <section-type> [layout keywords] [--category NAME] [--limit N]');
    process.exit(1);
  }

  const results = findWebtemplateSections(opts);
  if (!results.length) {
    console.log('No matches. Run: npm run audit:webtemplate');
    process.exit(0);
  }

  for (const r of results) {
    const s = r.matched_section;
    console.log(`${r.score} · ${r.category} · ${r.name}`);
    console.log(`   ${r.url}`);
    console.log(`   §${s.order} ${s.type} · ${s.class} · ${s.layout}`);
    if (s.description) console.log(`   ${s.description}`);
    console.log('');
  }
}
