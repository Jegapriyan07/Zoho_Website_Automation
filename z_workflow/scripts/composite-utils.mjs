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
  const isFinanceExamples =
    norm.includes('finance dashboard examples') ||
    norm.includes('build finance dashboards now') ||
    norm.includes('connect popular finance tools');
  const hasDresner = norm.includes('dresner advisory');

  if (isSalesExamples && !hasDresner) {
    const sales = ranked.find((r) => r.id === 'dashboard-examples-landing-sales');
    if (sales) return sales;
  }

  if (isFinanceExamples && !hasDresner) {
    const finance = ranked.find((r) => r.id === 'dashboard-examples-landing-finance');
    if (finance) return finance;
  }

  const isCloudAnalyticsGuide =
    norm.includes('cloud analytics tools guide') ||
    norm.includes('cloud analytics tools at a glance') ||
    norm.includes('top 5 cloud analytics tools in 2026');
  const isAiPoweredAnalyticsGuide =
    norm.includes('ai powered data analytics') &&
    (norm.includes('tools at a glance') ||
      norm.includes('comparison matrix') ||
      norm.includes('key takeaways'));
  if (isCloudAnalyticsGuide || isAiPoweredAnalyticsGuide) {
    const guide = ranked.find((r) => r.id === 'comparison-guide');
    if (guide) return guide;
  }

  const isWhiteLabelReporting =
    norm.includes('white label reporting tool for customizable') ||
    norm.includes('key features of white label reporting software') ||
    norm.includes('build vs. buy white label reporting');
  if (isWhiteLabelReporting) {
    const wl = ranked.find((r) => r.id === 'white-label-reporting-landing');
    if (wl) return wl;
  }

  const isEmbeddedSalesAnalytics =
    norm.includes('embedded analytics for sales') ||
    (norm.includes('embedded analytics in sales') &&
      norm.includes('what is embedded analytics in sales') &&
      norm.includes('start free trial'));
  if (isEmbeddedSalesAnalytics) {
    const embedded = ranked.find((r) => r.id === 'embedded-sales-analytics');
    if (embedded) return embedded;
  }

  const isClientDashboardSoftwareLanding =
    (norm.includes('client dashboard software built for agencies') ||
      norm.includes('client dashboard software that makes the monthly report')) &&
    norm.includes('ready to give every client a dashboard') &&
    !norm.includes('what key features to look for in a client dashboard tool') &&
    !norm.includes('dresner advisory') &&
    !norm.includes('hear from our happy customers') &&
    !norm.includes('how client dashboard tool works');
  if (isClientDashboardSoftwareLanding) {
    const cds = ranked.find((r) => r.id === 'client-dashboard-software-landing');
    if (cds) return cds;
  }

  const isPpcAgencyClientDashboard =
    norm.includes('what key features to look for in a client dashboard tool') &&
    norm.includes('ready to give every client a dashboard') &&
    !norm.includes('dresner advisory') &&
    !norm.includes('hear from our happy customers') &&
    !norm.includes('how client dashboard tool works');
  if (isPpcAgencyClientDashboard) {
    const ppc = ranked.find((r) => r.id === 'ppc-agency-client-dashboard');
    if (ppc) return ppc;
  }

  if ((isSalesExamples || isFinanceExamples) && hasDresner) {
    const full = ranked.find((r) => r.id === 'dashboard-examples-landing');
    if (full) return full;
  }

  return ranked[0];
}

export function getRequiredStrings(composite) {
  return composite.required_strings || composite.cta_strings_required || [];
}
