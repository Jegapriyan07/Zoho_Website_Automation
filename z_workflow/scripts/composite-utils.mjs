#!/usr/bin/env node
/**
 * Load section-composites.json and match brief text to archetypes.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMPOSITES_FILE = path.join(__dirname, '..', 'section-composites.json');

export function loadComposites() {
  return JSON.parse(fs.readFileSync(COMPOSITES_FILE, 'utf8'));
}

export function normalizeBriefText(text) {
  return (text || '').toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Score how well brief text matches an archetype's brief_signals.
 * @returns {{ id: string, score: number, composite: object }[]}
 */
export function rankArchetypes(briefText) {
  const { composites } = loadComposites();
  const norm = normalizeBriefText(briefText);

  return Object.entries(composites)
    .map(([id, composite]) => {
      const signals = composite.brief_signals || [];
      let score = 0;
      for (const signal of signals) {
        const s = signal.toLowerCase().trim();
        if (s.length < 2) continue;
        if (norm.includes(s)) score += s.split(/\s+/).length >= 2 ? 2 : 1;
      }
      return { id, score, composite };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}

/**
 * @param {string} briefText
 * @param {string} [forcedId]
 */
export function resolveArchetype(briefText, forcedId) {
  if (forcedId) {
    const { composites } = loadComposites();
    const composite = composites[forcedId];
    if (!composite) {
      throw new Error(`Unknown archetype: ${forcedId}`);
    }
    return { id: forcedId, score: null, composite };
  }

  const ranked = rankArchetypes(briefText);
  if (!ranked.length) return null;

  const norm = normalizeBriefText(briefText);
  const isSalesExamples =
    norm.includes('sales dashboard examples') ||
    norm.includes('build sales dashboards now') ||
    norm.includes('connect popular crms');
  const hasDresner = norm.includes('dresner advisory');

  if (isSalesExamples && !hasDresner) {
    const sales = ranked.find((r) => r.id === 'dashboard-examples-landing-sales');
    if (sales) return sales;
  }

  if (isSalesExamples && hasDresner) {
    const full = ranked.find((r) => r.id === 'dashboard-examples-landing');
    if (full) return full;
  }

  return ranked[0];
}

export function getRequiredStrings(composite) {
  return composite.required_strings || composite.cta_strings_required || [];
}
