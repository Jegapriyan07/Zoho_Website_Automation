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

  const isSpreadsheetReportingLanding =
    norm.includes('replace excel reporting with zoho analytics') ||
    norm.includes('excel spreadsheet reporting') ||
    (norm.includes('spreadsheet reporting') && norm.includes('excel vs zoho analytics')) ||
    (norm.includes('limits of traditional spreadsheets') &&
      norm.includes('migrate your excel sheets')) ||
    (norm.includes('why move beyond excel for reporting') &&
      norm.includes('excel reporting faqs'));
  const isEmbeddedSalesDoc =
    norm.includes('embedded analytics for sales') ||
    norm.includes('what is embedded analytics in sales');
  if (isSpreadsheetReportingLanding && !isEmbeddedSalesDoc) {
    const spreadsheet = ranked.find((r) => r.id === 'spreadsheet-reporting-landing');
    if (spreadsheet) return spreadsheet;
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

  const isWhatIsBusinessIntelligence =
    (norm.includes('what is business intelligence?') ||
      norm.includes('what-is-business-intelligence.html')) &&
    (norm.includes('traditional bi vs modern bi') ||
      norm.includes('how does business intelligence work') ||
      norm.includes('industrial use cases of business intelligence') ||
      norm.includes('broad goals of business intelligence'));
  if (isWhatIsBusinessIntelligence) {
    const biGuide = ranked.find((r) => r.id === 'what-is-business-intelligence');
    if (biGuide) return biGuide;
  }

  const isBiSoftwareLanding =
    (norm.includes('bi software landing page') ||
      norm.includes('business-intelligence-bi-software.html') ||
      (norm.includes('top business intelligence softwares') &&
        norm.includes('how to choose the best bi software'))) &&
    !norm.includes('traditional bi vs modern bi') &&
    !norm.includes('industrial use cases of business intelligence') &&
    !norm.includes('what-is-business-intelligence.html');
  if (isBiSoftwareLanding) {
    const biSoftware = ranked.find((r) => r.id === 'bi-software-landing');
    if (biSoftware) return biSoftware;
  }

  const isAppConnectorLanding =
    (norm.includes('shopify-advanced-analytics.html') ||
      norm.includes('shopify analytics page') ||
      (norm.includes('shopify') &&
        norm.includes('why choose zoho analytics for your shopify') &&
        (norm.includes('advanced shopify analytics') ||
          norm.includes('try our native shopify analytics')))) &&
    !norm.includes('sqlite database landing') &&
    !norm.includes('amazon-athena.html') &&
    !norm.includes('what is sqlite');
  if (isAppConnectorLanding) {
    const appConnector = ranked.find((r) => r.id === 'app-connector-landing');
    if (appConnector) return appConnector;
  }

  // Mobile Apps main page — must beat database-connector (shared "Zia Insights" signal)
  const isMobileAppsLanding =
    (norm.includes('zoho analytics mobile apps') ||
      norm.includes('za bi app main page') ||
      norm.includes('mobile apps (main page)') ||
      norm.includes('mobile-apps.html') ||
      (norm.includes('enjoy the complete native approach') &&
        norm.includes('analyze your data on-the-move')) ||
      (norm.includes('mobile bi app') && norm.includes('dashboards app'))) &&
    !norm.includes('sqlite database landing') &&
    !norm.includes('amazon-athena.html') &&
    !norm.includes('what is sqlite') &&
    !norm.includes('data import') &&
    !norm.includes('live connect');
  if (isMobileAppsLanding) {
    const mobileApps = ranked.find((r) => r.id === 'mobile-apps-landing');
    if (mobileApps) return mobileApps;
  }

  // Firebird (and similar legacy DB pages) — beat Athena database-connector archetype
  const isFirebirdDbLanding =
    (norm.includes('what is firebird') ||
      norm.includes('firebird.html') ||
      (norm.includes('unleash the power of your firebird') &&
        norm.includes('maximize your firebird data'))) &&
    norm.includes('firebird') &&
    !norm.includes('amazon-athena.html') &&
    !norm.includes('what is sqlite') &&
    !norm.includes('what is amazon athena');
  if (isFirebirdDbLanding) {
    const firebird = ranked.find((r) => r.id === 'firebird-db-landing');
    if (firebird) return firebird;
  }

  const isDatabaseConnectorLanding =
    (norm.includes('amazon-athena.html') ||
      norm.includes('sqlite database landing') ||
      norm.includes('supercharge your sqlite data') ||
      (norm.includes('live connect') &&
        norm.includes('data blending') &&
        norm.includes('data import') &&
        norm.includes('data preparation'))) &&
    (norm.includes('what is sqlite') ||
      norm.includes('what is amazon athena') ||
      norm.includes('how does zoho analytics and sqlite') ||
      norm.includes('how does zoho analytics and amazon athena') ||
      norm.includes('key features that help'));
  if (isDatabaseConnectorLanding) {
    const dbConnector = ranked.find((r) => r.id === 'database-connector-landing');
    if (dbConnector) return dbConnector;
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
