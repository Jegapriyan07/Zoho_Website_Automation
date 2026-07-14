// Zoho Web Page Builder — SPA client
const appEl = document.getElementById('app');

const state = {
  auth: null,
  runs: [],
  view: 'new', // 'new' | 'run'
  activeRunId: null,
  run: null,
  events: [],
  revisions: [],
  approval: null,
  es: null,
  reviseOpen: false,
  reviseScope: 'general',
  building: false,
  selectedTemplate: null  // null = auto-detect, or a template id string
};

// ── Template catalogue ─────────────────────────────────────────
const TEMPLATES = [
  {
    id: null,
    name: 'Auto-detect',
    desc: 'Let the AI pick the best structure',
    url: null,
    isAuto: true,
    thumb: null  // rendered as emoji
  },
  {
    id: 'saas-landing',
    name: 'SaaS Landing',
    desc: 'Hero · Features · Pricing · CTA',
    url: 'https://www.zoho.com/analytics/features/agentic-ai.html',
    thumb: `<svg viewBox="0 0 220 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="220" height="100" fill="#0f172a"/>
      <rect x="0" y="0" width="220" height="100" fill="url(#g1)"/>
      <defs><linearGradient id="g1" x1="0" y1="0" x2="220" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#1e3a5f"/><stop offset="100%" stop-color="#0f172a"/>
      </linearGradient></defs>
      <rect x="30" y="18" width="100" height="9" rx="4" fill="#38bdf8" opacity=".9"/>
      <rect x="30" y="32" width="70" height="5" rx="2" fill="#94a3b8" opacity=".6"/>
      <rect x="30" y="42" width="50" height="5" rx="2" fill="#94a3b8" opacity=".4"/>
      <rect x="30" y="55" width="36" height="11" rx="5" fill="#3b82f6"/>
      <rect x="130" y="12" width="72" height="52" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
      <rect x="137" y="18" width="58" height="6" rx="2" fill="#38bdf8" opacity=".5"/>
      <rect x="137" y="28" width="40" height="4" rx="2" fill="#64748b"/>
      <rect x="137" y="36" width="50" height="4" rx="2" fill="#64748b" opacity=".6"/>
      <rect x="137" y="44" width="30" height="4" rx="2" fill="#64748b" opacity=".4"/>
      <rect x="0" y="76" width="220" height="1" fill="#1e293b"/>
      <rect x="20" y="83" width="40" height="4" rx="2" fill="#334155"/>
      <rect x="70" y="83" width="40" height="4" rx="2" fill="#334155"/>
      <rect x="120" y="83" width="40" height="4" rx="2" fill="#334155"/>
    </svg>`
  },
  {
    id: 'dashboard',
    name: 'SaaS Dashboard',
    desc: 'Metrics · Charts · Activity feed',
    url: 'https://www.zoho.com/analytics/dashboard/saas.html',
    thumb: `<svg viewBox="0 0 220 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="220" height="100" fill="#111827"/>
      <rect x="0" y="0" width="44" height="100" fill="#1f2937"/>
      <circle cx="22" cy="16" r="8" fill="#374151"/>
      <rect x="8" y="30" width="28" height="5" rx="2" fill="#4b5563"/>
      <rect x="8" y="40" width="28" height="5" rx="2" fill="#374151"/>
      <rect x="8" y="50" width="28" height="5" rx="2" fill="#374151"/>
      <rect x="8" y="60" width="28" height="5" rx="2" fill="#374151"/>
      <rect x="52" y="8" width="50" height="22" rx="4" fill="#1e3a5f" stroke="#1d4ed8" stroke-width=".8"/>
      <rect x="57" y="13" width="20" height="4" rx="2" fill="#93c5fd" opacity=".8"/>
      <rect x="57" y="20" width="30" height="5" rx="2" fill="#3b82f6"/>
      <rect x="108" y="8" width="50" height="22" rx="4" fill="#1a3d2e" stroke="#16a34a" stroke-width=".8"/>
      <rect x="113" y="13" width="20" height="4" rx="2" fill="#86efac" opacity=".8"/>
      <rect x="113" y="20" width="30" height="5" rx="2" fill="#22c55e"/>
      <rect x="164" y="8" width="48" height="22" rx="4" fill="#3b1f0a" stroke="#d97706" stroke-width=".8"/>
      <rect x="169" y="13" width="20" height="4" rx="2" fill="#fcd34d" opacity=".8"/>
      <rect x="169" y="20" width="30" height="5" rx="2" fill="#f59e0b"/>
      <rect x="52" y="36" width="105" height="40" rx="4" fill="#1f2937" stroke="#374151" stroke-width=".8"/>
      <polyline points="60,68 75,55 90,60 105,45 120,50 135,38 145,42" fill="none" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round"/>
      <rect x="163" y="36" width="49" height="40" rx="4" fill="#1f2937" stroke="#374151" stroke-width=".8"/>
      <rect x="168" y="50" width="8" height="18" rx="2" fill="#3b82f6"/>
      <rect x="180" y="44" width="8" height="24" rx="2" fill="#22c55e"/>
      <rect x="192" y="48" width="8" height="20" rx="2" fill="#f59e0b"/>
      <rect x="204" y="41" width="8" height="27" rx="2" fill="#a855f7"/>
    </svg>`
  },
  {
    id: 'analytics',
    name: 'Analytics Report',
    desc: 'KPIs · Trends · Insights',
    url: 'https://www.zoho.com/analytics/ecommerce-analytics.html',
    thumb: `<svg viewBox="0 0 220 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="220" height="100" fill="#fafafa"/>
      <rect x="0" y="0" width="220" height="14" fill="#f1f5f9"/>
      <rect x="8" y="4" width="50" height="6" rx="2" fill="#94a3b8"/>
      <rect x="180" y="4" width="32" height="6" rx="2" fill="#e2e8f0"/>
      <rect x="8" y="20" width="44" height="18" rx="4" fill="#fff" stroke="#e2e8f0" stroke-width="1"/>
      <rect x="13" y="25" width="16" height="4" rx="1" fill="#cbd5e1"/>
      <rect x="13" y="31" width="30" height="5" rx="1" fill="#3b82f6"/>
      <rect x="58" y="20" width="44" height="18" rx="4" fill="#fff" stroke="#e2e8f0" stroke-width="1"/>
      <rect x="63" y="25" width="16" height="4" rx="1" fill="#cbd5e1"/>
      <rect x="63" y="31" width="30" height="5" rx="1" fill="#22c55e"/>
      <rect x="108" y="20" width="44" height="18" rx="4" fill="#fff" stroke="#e2e8f0" stroke-width="1"/>
      <rect x="113" y="25" width="16" height="4" rx="1" fill="#cbd5e1"/>
      <rect x="113" y="31" width="30" height="5" rx="1" fill="#f59e0b"/>
      <rect x="158" y="20" width="54" height="18" rx="4" fill="#fff" stroke="#e2e8f0" stroke-width="1"/>
      <rect x="163" y="25" width="16" height="4" rx="1" fill="#cbd5e1"/>
      <rect x="163" y="31" width="30" height="5" rx="1" fill="#a855f7"/>
      <rect x="8" y="44" width="130" height="46" rx="4" fill="#fff" stroke="#e2e8f0" stroke-width="1"/>
      <polyline points="18,82 35,68 55,72 75,58 95,63 115,50 128,55" fill="none" stroke="#3b82f6" stroke-width="1.5"/>
      <polyline points="18,82 35,74 55,78 75,70 95,72 115,64 128,67" fill="none" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="3,2"/>
      <rect x="144" y="44" width="68" height="46" rx="4" fill="#fff" stroke="#e2e8f0" stroke-width="1"/>
      <rect x="150" y="50" width="8" height="32" rx="2" fill="#bfdbfe"/>
      <rect x="162" y="56" width="8" height="26" rx="2" fill="#3b82f6"/>
      <rect x="174" y="58" width="8" height="24" rx="2" fill="#bfdbfe"/>
      <rect x="186" y="48" width="8" height="34" rx="2" fill="#3b82f6"/>
      <rect x="198" y="52" width="8" height="30" rx="2" fill="#bfdbfe"/>
    </svg>`
  },
  {
    id: 'portfolio',
    name: 'Portfolio / Agency',
    desc: 'Hero · Work · Services · Contact',
    url: 'https://www.zoho.com/sites/portfolio-website.html',
    thumb: `<svg viewBox="0 0 220 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="220" height="100" fill="#18181b"/>
      <rect x="0" y="0" width="220" height="44" fill="url(#gp)"/>
      <defs><linearGradient id="gp" x1="0" y1="0" x2="220" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#7c3aed"/><stop offset="100%" stop-color="#2563eb"/>
      </linearGradient></defs>
      <rect x="24" y="10" width="80" height="9" rx="4" fill="#fff" opacity=".95"/>
      <rect x="24" y="24" width="55" height="5" rx="2" fill="#e9d5ff" opacity=".7"/>
      <rect x="24" y="33" width="36" height="8" rx="4" fill="#fff" opacity=".15"/>
      <rect x="140" y="6" width="64" height="32" rx="6" fill="#312e81" stroke="#4c1d95" stroke-width="1"/>
      <rect x="145" y="11" width="54" height="17" rx="3" fill="#1e1b4b"/>
      <rect x="145" y="32" width="28" height="3" rx="1" fill="#a78bfa" opacity=".6"/>
      <rect x="8" y="52" width="62" height="38" rx="4" fill="#27272a"/>
      <rect x="14" y="57" width="50" height="24" rx="2" fill="#3f3f46"/>
      <rect x="14" y="84" width="30" height="3" rx="1" fill="#52525b"/>
      <rect x="78" y="52" width="62" height="38" rx="4" fill="#27272a"/>
      <rect x="84" y="57" width="50" height="24" rx="2" fill="#a855f7" opacity=".3"/>
      <rect x="84" y="84" width="30" height="3" rx="1" fill="#52525b"/>
      <rect x="148" y="52" width="62" height="38" rx="4" fill="#27272a"/>
      <rect x="154" y="57" width="50" height="24" rx="2" fill="#3b82f6" opacity=".3"/>
      <rect x="154" y="84" width="30" height="3" rx="1" fill="#52525b"/>
    </svg>`
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce',
    desc: 'Products · Reviews · Checkout',
    url: 'https://www.zoho.com/commerce/',
    thumb: `<svg viewBox="0 0 220 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="220" height="100" fill="#fff"/>
      <rect x="0" y="0" width="220" height="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width=".5"/>
      <rect x="8" y="5" width="30" height="6" rx="2" fill="#1e293b"/>
      <rect x="160" y="4" width="20" height="8" rx="2" fill="#f1f5f9"/>
      <rect x="186" y="4" width="26" height="8" rx="4" fill="#e11d48"/>
      <rect x="0" y="16" width="220" height="28" fill="url(#ge)"/>
      <defs><linearGradient id="ge" x1="0" y1="0" x2="220" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#fdf2f8"/><stop offset="100%" stop-color="#fce7f3"/>
      </linearGradient></defs>
      <rect x="16" y="22" width="70" height="7" rx="3" fill="#be185d"/>
      <rect x="16" y="33" width="46" height="5" rx="2" fill="#9d174d" opacity=".5"/>
      <rect x="130" y="18" width="74" height="20" rx="3" fill="#fda4af" opacity=".4"/>
      <rect x="8" y="50" width="46" height="42" rx="4" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
      <rect x="12" y="54" width="38" height="22" rx="2" fill="#ffe4e6"/>
      <rect x="12" y="79" width="24" height="4" rx="1" fill="#94a3b8"/>
      <rect x="12" y="86" width="18" height="4" rx="1" fill="#e11d48"/>
      <rect x="60" y="50" width="46" height="42" rx="4" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
      <rect x="64" y="54" width="38" height="22" rx="2" fill="#dbeafe"/>
      <rect x="64" y="79" width="24" height="4" rx="1" fill="#94a3b8"/>
      <rect x="64" y="86" width="18" height="4" rx="1" fill="#e11d48"/>
      <rect x="112" y="50" width="46" height="42" rx="4" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
      <rect x="116" y="54" width="38" height="22" rx="2" fill="#d1fae5"/>
      <rect x="116" y="79" width="24" height="4" rx="1" fill="#94a3b8"/>
      <rect x="116" y="86" width="18" height="4" rx="1" fill="#e11d48"/>
      <rect x="164" y="50" width="48" height="42" rx="4" fill="#fff7ed" stroke="#fed7aa" stroke-width="1"/>
      <rect x="168" y="54" width="40" height="8" rx="2" fill="#c2410c" opacity=".1"/>
      <rect x="168" y="65" width="32" height="4" rx="1" fill="#94a3b8"/>
      <rect x="168" y="72" width="24" height="4" rx="1" fill="#94a3b8" opacity=".6"/>
      <rect x="168" y="80" width="40" height="10" rx="4" fill="#e11d48"/>
    </svg>`
  },
  {
    id: 'docs',
    name: 'Documentation Hub',
    desc: 'Nav · Sidebar · Code examples',
    url: 'https://www.zoho.com/learn/documentation-hub.html',
    thumb: `<svg viewBox="0 0 220 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="220" height="100" fill="#fff"/>
      <rect x="0" y="0" width="220" height="14" fill="#f8fafc" stroke="#e2e8f0" stroke-width=".5"/>
      <rect x="8" y="4" width="30" height="6" rx="2" fill="#1e293b"/>
      <rect x="56" y="4" width="22" height="6" rx="2" fill="#94a3b8"/>
      <rect x="84" y="4" width="22" height="6" rx="2" fill="#94a3b8"/>
      <rect x="112" y="4" width="22" height="6" rx="2" fill="#94a3b8"/>
      <rect x="0" y="14" width="56" height="86" fill="#f8fafc" stroke="#e2e8f0" stroke-width=".5"/>
      <rect x="6" y="20" width="44" height="5" rx="2" fill="#cbd5e1"/>
      <rect x="6" y="30" width="36" height="4" rx="2" fill="#3b82f6"/>
      <rect x="6" y="38" width="40" height="4" rx="2" fill="#94a3b8"/>
      <rect x="6" y="46" width="32" height="4" rx="2" fill="#94a3b8"/>
      <rect x="6" y="54" width="38" height="4" rx="2" fill="#94a3b8"/>
      <rect x="6" y="62" width="30" height="4" rx="2" fill="#94a3b8"/>
      <rect x="6" y="70" width="42" height="4" rx="2" fill="#94a3b8"/>
      <rect x="62" y="18" width="80" height="7" rx="3" fill="#1e293b"/>
      <rect x="62" y="30" width="150" height="4" rx="2" fill="#64748b" opacity=".5"/>
      <rect x="62" y="38" width="130" height="4" rx="2" fill="#64748b" opacity=".4"/>
      <rect x="62" y="50" width="60" height="5" rx="2" fill="#1e293b" opacity=".7"/>
      <rect x="62" y="60" width="150" height="24" rx="4" fill="#0f172a"/>
      <rect x="68" y="65" width="60" height="4" rx="2" fill="#22d3ee" opacity=".7"/>
      <rect x="68" y="73" width="40" height="4" rx="2" fill="#a78bfa" opacity=".7"/>
      <rect x="68" y="81" width="80" height="4" rx="2" fill="#94a3b8" opacity=".5"/>
    </svg>`
  },
  {
    id: 'event',
    name: 'Event / Conference',
    desc: 'Countdown · Speakers · Schedule',
    url: 'https://www.zoho.com/backstage/',
    thumb: `<svg viewBox="0 0 220 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="220" height="100" fill="url(#gev)"/>
      <defs><linearGradient id="gev" x1="0" y1="0" x2="220" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#1a0533"/><stop offset="100%" stop-color="#0c1445"/>
      </linearGradient></defs>
      <circle cx="60" cy="10" r="30" fill="#a855f7" opacity=".07"/>
      <circle cx="180" cy="80" r="40" fill="#3b82f6" opacity=".07"/>
      <rect x="60" y="6" width="100" height="8" rx="4" fill="#e9d5ff" opacity=".9"/>
      <rect x="80" y="18" width="60" height="5" rx="2" fill="#c4b5fd" opacity=".6"/>
      <rect x="42" y="30" width="32" height="22" rx="4" fill="#4c1d95" stroke="#7c3aed" stroke-width=".8"/>
      <rect x="47" y="35" width="10" height="5" rx="2" fill="#a78bfa"/>
      <rect x="47" y="43" width="20" height="6" rx="2" fill="#c4b5fd"/>
      <rect x="82" y="30" width="32" height="22" rx="4" fill="#1e3a5f" stroke="#3b82f6" stroke-width=".8"/>
      <rect x="87" y="35" width="10" height="5" rx="2" fill="#93c5fd"/>
      <rect x="87" y="43" width="20" height="6" rx="2" fill="#bfdbfe"/>
      <rect x="122" y="30" width="32" height="22" rx="4" fill="#3b1f0a" stroke="#d97706" stroke-width=".8"/>
      <rect x="127" y="35" width="10" height="5" rx="2" fill="#fcd34d"/>
      <rect x="127" y="43" width="20" height="6" rx="2" fill="#fde68a"/>
      <rect x="162" y="30" width="32" height="22" rx="4" fill="#1a3d2e" stroke="#16a34a" stroke-width=".8"/>
      <rect x="167" y="35" width="10" height="5" rx="2" fill="#86efac"/>
      <rect x="167" y="43" width="20" height="6" rx="2" fill="#bbf7d0"/>
      <rect x="20" y="60" width="180" height="30" rx="4" fill="#ffffff" opacity=".05" stroke="#ffffff" stroke-width=".5" stroke-opacity=".15"/>
      <rect x="26" y="66" width="40" height="4" rx="2" fill="#a78bfa" opacity=".8"/>
      <rect x="26" y="74" width="60" height="3" rx="1" fill="#6d28d9" opacity=".4"/>
      <rect x="100" y="66" width="40" height="4" rx="2" fill="#60a5fa" opacity=".8"/>
      <rect x="100" y="74" width="60" height="3" rx="1" fill="#1d4ed8" opacity=".4"/>
      <rect x="76" y="82" width="68" height="10" rx="5" fill="#7c3aed"/>
      <rect x="88" y="85" width="44" height="4" rx="2" fill="#fff" opacity=".9"/>
    </svg>`
  },
  {
    id: 'nonprofit',
    name: 'Nonprofit / NGO',
    desc: 'Mission · Impact · Donate',
    url: 'https://www.zoho.com/creator/nonprofit.html',
    thumb: `<svg viewBox="0 0 220 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="220" height="100" fill="#f0fdf4"/>
      <rect x="0" y="0" width="220" height="38" fill="url(#gnp)"/>
      <defs><linearGradient id="gnp" x1="0" y1="0" x2="220" y2="38" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#14532d"/><stop offset="100%" stop-color="#166534"/>
      </linearGradient></defs>
      <rect x="24" y="8" width="80" height="8" rx="4" fill="#fff" opacity=".9"/>
      <rect x="24" y="20" width="55" height="4" rx="2" fill="#bbf7d0" opacity=".7"/>
      <rect x="24" y="28" width="40" height="8" rx="4" fill="#22c55e"/>
      <rect x="130" y="8" width="72" height="26" rx="6" fill="#ffffff" opacity=".08" stroke="#fff" stroke-width=".5" stroke-opacity=".2"/>
      <rect x="136" y="13" width="32" height="4" rx="2" fill="#fff" opacity=".5"/>
      <rect x="136" y="21" width="54" height="9" rx="3" fill="#16a34a"/>
      <rect x="8" y="44" width="38" height="24" rx="4" fill="#fff" stroke="#d1fae5" stroke-width="1"/>
      <rect x="13" y="49" width="16" height="4" rx="2" fill="#16a34a" opacity=".6"/>
      <rect x="13" y="56" width="26" height="7" rx="2" fill="#22c55e"/>
      <rect x="52" y="44" width="38" height="24" rx="4" fill="#fff" stroke="#d1fae5" stroke-width="1"/>
      <rect x="57" y="49" width="16" height="4" rx="2" fill="#16a34a" opacity=".6"/>
      <rect x="57" y="56" width="26" height="7" rx="2" fill="#16a34a"/>
      <rect x="96" y="44" width="38" height="24" rx="4" fill="#fff" stroke="#d1fae5" stroke-width="1"/>
      <rect x="101" y="49" width="16" height="4" rx="2" fill="#16a34a" opacity=".6"/>
      <rect x="101" y="56" width="26" height="7" rx="2" fill="#4ade80"/>
      <rect x="8" y="74" width="126" height="18" rx="4" fill="#fff" stroke="#d1fae5" stroke-width="1"/>
      <rect x="13" y="79" width="50" height="4" rx="2" fill="#94a3b8"/>
      <rect x="13" y="86" width="36" height="3" rx="1" fill="#cbd5e1"/>
      <rect x="140" y="74" width="72" height="18" rx="4" fill="#16a34a"/>
      <rect x="150" y="79" width="52" height="4" rx="2" fill="#fff" opacity=".9"/>
      <rect x="155" y="86" width="42" height="3" rx="1" fill="#bbf7d0" opacity=".7"/>
    </svg>`
  }
];

// ── API helpers ────────────────────────────────
async function api(pathname, opts = {}) {
  const res = await fetch(pathname, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  if (res.status === 401) { state.auth = { authenticated: false }; renderLogin(); throw new Error('auth'); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'error'), { data });
  return data;
}

function esc(s) { return String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function fmtTime(iso) { try { return new Date(iso).toLocaleString(); } catch { return iso; } }
function fmtBytes(n) { return n > 1024 ? (n / 1024).toFixed(1) + ' KB' : n + ' B'; }

const PHASE_META = {
  0: 'Phase 0 — Acquire brief · Catalog · Match',
  1: 'Phase 1 — Design tokens',
  2: 'Phase 2 — Page blueprint',
  6: 'Phase 6 — Production build',
  validation: 'Validation — validate:output'
};
const HARD_STOP_TITLES = {
  login_wall: 'Zoho login wall',
  extraction_failed: 'Writer extraction failed',
  confidential_content: 'Confidential content detected',
  validate_brief_failed: 'Brief validation failed',
  validate_output_failed: 'Output validation failed',
  manual_compose_required: 'Manual composition required',
  compose_failed: 'Composition failed'
};

// ── Bootstrap ──────────────────────────────────
async function boot() {
  try {
    state.auth = await (await fetch('/auth/status')).json();
  } catch {
    state.auth = { authenticated: false };
  }
  if (!state.auth.authenticated) return renderLogin();
  await loadRuns();
  renderShell();
}

async function loadRuns() {
  const { runs } = await api('/api/runs');
  state.runs = runs;
}

// ── Login ──────────────────────────────────────
function renderLogin() {
  const dev = state.auth?.dev_login;
  appEl.innerHTML = `
    <div class="login">
      <div class="login-card">
        <span class="zoho-mark" aria-hidden="true"></span>
        <h1>Web Page Builder</h1>
        <p>Internal tool — sign in to build pages from a Writer document.</p>
        <a class="btn-zoho" href="/auth/zoho/login">Sign in with Zoho</a>
        ${dev ? `
          <div class="dev-login">
            <input id="dev-email" type="email" placeholder="you@local (dev login)" />
            <button class="build-btn" id="dev-btn">Dev</button>
          </div>
          <p class="dev-note">Zoho OAuth not configured — local dev login enabled.</p>
        ` : ''}
      </div>
    </div>`;
  if (dev) {
    document.getElementById('dev-btn').onclick = async () => {
      const email = document.getElementById('dev-email').value || 'dev@local';
      await api('/auth/dev-login', { method: 'POST', body: { email } });
      boot();
    };
  }
}

// ── Shell ──────────────────────────────────────
function renderShell() {
  appEl.innerHTML = `
    <header class="topbar">
      <div class="topbar-inner">
        <div class="topbar-brand">
          <span class="zoho-mark" aria-hidden="true"></span>
          <span class="product-name">Web Page Builder</span>
          <span class="product-badge">Internal</span>
        </div>
        <div class="topbar-actions">
          <span class="topbar-user">${esc(state.auth.user?.display_name || state.auth.user?.email || '')}</span>
          <button class="topbar-signout" id="logout">Sign out</button>
        </div>
      </div>
    </header>
    <div class="shell">
      <aside class="sidebar">
        <div class="sidebar-head">
          <div class="logo">Build history</div>
        </div>
        <button class="new-btn" id="new-build">+ New build</button>
        <div class="thread-list" id="thread-list"></div>
      </aside>
      <main class="main"><div class="main-inner" id="main-inner"></div></main>
    </div>`;
  document.getElementById('new-build').onclick = () => { closeStream(); state.view = 'new'; state.activeRunId = null; renderMain(); renderThreads(); };
  document.getElementById('logout').onclick = async () => { await api('/auth/logout', { method: 'POST' }); location.reload(); };
  renderThreads();
  renderMain();
}

function renderThreads() {
  const el = document.getElementById('thread-list');
  if (!el) return;
  if (!state.runs.length) { el.innerHTML = `<h4>History</h4><div style="padding:8px;color:var(--muted);font-size:12px">No builds yet.</div>`; return; }
  el.innerHTML = `<h4>History</h4>` + state.runs.map((r) => `
    <div class="thread ${r.id === state.activeRunId ? 'active' : ''}" data-id="${r.id}">
      <div class="t-title">${esc(r.page_title || r.slug || 'Untitled build')}</div>
      <div class="t-meta"><span class="chip ${r.status}">${r.status.replace(/_/g, ' ')}</span><span>${fmtTime(r.created_at).split(',')[0]}</span></div>
    </div>`).join('');
  el.querySelectorAll('.thread').forEach((t) => { t.onclick = () => openRun(t.dataset.id); });
}

function renderMain() {
  const el = document.getElementById('main-inner');
  if (state.view === 'new') return renderNewBuild(el);
  return renderRun(el);
}

// ── New build ──────────────────────────────────
function renderCatalogue() {
  return `
    <div class="catalogue-section">
      <div class="catalogue-grid" id="catalogue-grid">
        ${TEMPLATES.map((t) => `
          <div class="tpl-card${t.isAuto ? ' auto-card' : ''}${state.selectedTemplate === t.id ? ' selected' : ''}" data-tpl-id="${t.id ?? '__auto__'}" role="button" tabindex="0" aria-pressed="${state.selectedTemplate === t.id ? 'true' : 'false'}">
            <div class="tpl-check" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            ${t.isAuto
              ? `<div class="tpl-thumb-auto">✨</div>`
              : `<div class="tpl-thumb">${t.thumb}</div>`
            }
            <div class="tpl-info">
              <div class="tpl-name-row">
                <div class="tpl-name">${esc(t.name)}</div>
                ${t.url ? `<a href="${t.url}" target="_blank" class="tpl-preview-link" title="Preview Reference Site" aria-label="Preview Template"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-external-link"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a>` : ''}
              </div>
              <div class="tpl-desc">${esc(t.desc)}</div>
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}

function renderNewBuild(el) {
  el.innerHTML = `
    <div class="build-hero">
      <div class="build-hero-header">
        <h1>New build</h1>
        <p>Build a landing page from a Zoho Writer doc or by uploading a <strong>.docx</strong> file.</p>
      </div>

      <!-- Step 1: Source tabs -->
      <div class="step-section">
        <h3 class="step-title">1. Choose your source</h3>
        <div class="src-tabs" role="tablist">
          <button class="src-tab active" id="tab-url" role="tab" aria-selected="true"  aria-controls="panel-url">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 8h12M8 2l6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Writer URL
          </button>
          <button class="src-tab" id="tab-docx" role="tab" aria-selected="false" aria-controls="panel-docx">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M9 1H4a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V6L9 1z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 1v5h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Upload DOCX
          </button>
        </div>

        <!-- Writer URL panel -->
        <div id="panel-url" class="src-panel active" role="tabpanel">
          <div class="url-row">
            <input id="writer-url" type="text" placeholder="https://writer.zoho.com/writer/open/…" />
          </div>
          <div class="field-err" id="url-err"></div>
        </div>

        <!-- DOCX upload panel -->
        <div id="panel-docx" class="src-panel" role="tabpanel" style="display:none">
          <div class="upload-zone" id="upload-zone" tabindex="0" role="button" aria-label="Click or drag a .docx file here">
            <div class="upload-zone-inner">
              <svg class="upload-icon" width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M12 15V3m0 0L8 7m4-4l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
              <p class="upload-hint">Drag &amp; drop a <strong>.docx</strong> file here, or <span class="upload-link">browse</span></p>
              <p class="upload-sub">Extracts text directly from the file — no Puppeteer, no login required</p>
              <p class="upload-filename" id="upload-filename"></p>
            </div>
            <input type="file" id="docx-file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" style="display:none" />
          </div>
          <div class="field-err" id="docx-err"></div>
        </div>
      </div>

      <!-- Step 2: Template Selection -->
      <div class="step-section catalogue-step">
        <div class="step-header-row">
          <h3 class="step-title">2. Select a template</h3>
          <div id="tpl-badge-container">
            <div id="tpl-badge-url"></div>
            <div id="tpl-badge-docx"></div>
          </div>
        </div>
        ${renderCatalogue()}
      </div>

      <!-- Step 3: Build Actions -->
      <div class="step-section build-step">
        <h3 class="step-title">3. Build your page</h3>
        
        <!-- URL Action Buttons -->
        <div id="actions-url" class="build-btn-group">
          <button class="build-btn build-btn-brands" id="go-brands" title="Include animated brand logo marquee after hero">
            ★ Build with Trusted Brands
          </button>
          <button class="build-btn build-btn-plain" id="go-plain">
            Build without Trusted Brands
          </button>
        </div>

        <!-- DOCX Action Buttons -->
        <div id="actions-docx" class="build-btn-group" style="display:none">
          <button class="build-btn build-btn-brands" id="go-brands-docx" title="Include animated brand logo marquee after hero" disabled>
            ★ Build with Trusted Brands
          </button>
          <button class="build-btn build-btn-plain" id="go-plain-docx" disabled>
            Build without Trusted Brands
          </button>
        </div>
      </div>
    </div>

    <div class="recent">
      <h3>Recent runs</h3>
      <div id="recent-list"></div>
    </div>`;

  // ── Catalogue selection ─────────────────────
  function updateTemplateBadges() {
    const tpl = TEMPLATES.find((t) => t.id === state.selectedTemplate);
    const badgeHtml = tpl && !tpl.isAuto
      ? `<div class="tpl-active-badge">🎨 ${esc(tpl.name)} template selected <button id="clear-tpl" aria-label="Clear template">✕</button></div>`
      : '';
    const badgeUrl  = document.getElementById('tpl-badge-url');
    const badgeDocx = document.getElementById('tpl-badge-docx');
    if (badgeUrl)  badgeUrl.innerHTML  = badgeHtml;
    if (badgeDocx) badgeDocx.innerHTML = badgeHtml;
    document.querySelectorAll('#clear-tpl').forEach((btn) => {
      btn.onclick = (e) => { e.stopPropagation(); state.selectedTemplate = null; renderNewBuild(el); };
    });
  }

  document.getElementById('catalogue-grid').addEventListener('click', (e) => {
    const card = e.target.closest('.tpl-card');
    if (!card) return;
    const raw = card.dataset.tplId;
    const chosen = raw === '__auto__' ? null : raw;
    state.selectedTemplate = chosen;
    document.querySelectorAll('.tpl-card').forEach((c) => {
      const cid = c.dataset.tplId === '__auto__' ? null : c.dataset.tplId;
      c.classList.toggle('selected', cid === chosen);
      c.setAttribute('aria-pressed', String(cid === chosen));
    });
    updateTemplateBadges();
  });
  document.getElementById('catalogue-grid').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') e.target.closest('.tpl-card')?.click();
  });
  updateTemplateBadges();

  // ── Tab switching ──────────────────────────────
  const tabUrl  = document.getElementById('tab-url');
  const tabDocx = document.getElementById('tab-docx');
  const panelUrl  = document.getElementById('panel-url');
  const panelDocx = document.getElementById('panel-docx');

  tabUrl.onclick = () => {
    tabUrl.classList.add('active'); tabUrl.setAttribute('aria-selected', 'true');
    tabDocx.classList.remove('active'); tabDocx.setAttribute('aria-selected', 'false');
    panelUrl.style.display = ''; panelDocx.style.display = 'none';
    document.getElementById('actions-url').style.display = '';
    document.getElementById('actions-docx').style.display = 'none';
  };
  tabDocx.onclick = () => {
    tabDocx.classList.add('active'); tabDocx.setAttribute('aria-selected', 'true');
    tabUrl.classList.remove('active'); tabUrl.setAttribute('aria-selected', 'false');
    panelDocx.style.display = ''; panelUrl.style.display = 'none';
    document.getElementById('actions-docx').style.display = '';
    document.getElementById('actions-url').style.display = 'none';
  };

  // ── Writer URL flow ────────────────────────────
  const input    = document.getElementById('writer-url');
  const err      = document.getElementById('url-err');
  const goBrands = document.getElementById('go-brands');
  const goPlain  = document.getElementById('go-plain');

  const startBuild = async (trusted_brands) => {
    err.textContent = '';
    const url = input.value.trim();
    if (!/writer\.zoho\./i.test(url)) { err.textContent = 'Enter a valid writer.zoho.* document URL.'; return; }
    goBrands.disabled = true; goPlain.disabled = true;
    goBrands.textContent = trusted_brands ? 'Starting…' : '★ Build with Trusted Brands';
    goPlain.textContent  = trusted_brands ? 'Build without Trusted Brands' : 'Starting…';
    try {
      const { run } = await api('/api/runs', { method: 'POST', body: { writer_doc_url: url, trusted_brands, template_id: state.selectedTemplate } });
      state.runs.unshift(run);
      openRun(run.id);
    } catch (e) {
      err.textContent = e.data?.message || 'Failed to start build.';
      goBrands.disabled = false; goPlain.disabled = false;
      goBrands.textContent = '★ Build with Trusted Brands';
      goPlain.textContent  = 'Build without Trusted Brands';
    }
  };

  goBrands.onclick = () => startBuild(true);
  goPlain.onclick  = () => startBuild(false);
  input.onkeydown  = (e) => { if (e.key === 'Enter') startBuild(false); };

  // ── DOCX upload flow ───────────────────────────
  const zone         = document.getElementById('upload-zone');
  const fileInput    = document.getElementById('docx-file');
  const fileLabel    = document.getElementById('upload-filename');
  const docxErr      = document.getElementById('docx-err');
  const goBrandsDocx = document.getElementById('go-brands-docx');
  const goPlainDocx  = document.getElementById('go-plain-docx');

  let selectedFile = null;

  function setFile(f) {
    if (!f || !f.name.toLowerCase().endsWith('.docx')) {
      docxErr.textContent = 'Please select a .docx file.';
      selectedFile = null;
      goBrandsDocx.disabled = true; goPlainDocx.disabled = true;
      fileLabel.textContent = '';
      zone.classList.remove('has-file');
      return;
    }
    selectedFile = f;
    docxErr.textContent = '';
    fileLabel.textContent = `📄 ${f.name} (${(f.size / 1024).toFixed(0)} KB)`;
    zone.classList.add('has-file');
    goBrandsDocx.disabled = false; goPlainDocx.disabled = false;
  }

  zone.onclick = () => fileInput.click();
  zone.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') fileInput.click(); };
  fileInput.onchange = () => setFile(fileInput.files[0]);

  zone.ondragover = (e) => { e.preventDefault(); zone.classList.add('drag-over'); };
  zone.ondragleave = () => zone.classList.remove('drag-over');
  zone.ondrop = (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    setFile(e.dataTransfer.files[0]);
  };

  const startDocxBuild = async (trusted_brands) => {
    if (!selectedFile) { docxErr.textContent = 'Choose a .docx file first.'; return; }
    docxErr.textContent = '';
    goBrandsDocx.disabled = true; goPlainDocx.disabled = true;
    goBrandsDocx.textContent = trusted_brands ? 'Uploading…' : '★ Build with Trusted Brands';
    goPlainDocx.textContent  = trusted_brands ? 'Build without Trusted Brands' : 'Uploading…';

    try {
      const fd = new FormData();
      fd.append('docx', selectedFile, selectedFile.name);
      fd.append('trusted_brands', trusted_brands ? 'true' : 'false');
      fd.append('doc_title', selectedFile.name.replace(/\.docx$/i, ''));
      if (state.selectedTemplate) fd.append('template_id', state.selectedTemplate);

      const res = await fetch('/api/runs/docx', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw Object.assign(new Error(data.message || 'Upload failed'), { data });

      state.runs.unshift(data.run);
      openRun(data.run.id);
    } catch (e) {
      docxErr.textContent = e.data?.message || e.message || 'Upload failed.';
      goBrandsDocx.disabled = false; goPlainDocx.disabled = false;
      goBrandsDocx.textContent = '★ Build with Trusted Brands';
      goPlainDocx.textContent  = 'Build without Trusted Brands';
    }
  };

  goBrandsDocx.onclick = () => startDocxBuild(true);
  goPlainDocx.onclick  = () => startDocxBuild(false);

  // ── Recent runs list ───────────────────────────
  const recent = document.getElementById('recent-list');
  recent.innerHTML = state.runs.slice(0, 6).map((r) => `
    <div class="thread" data-id="${r.id}" style="margin-top:8px">
      <div class="t-title">${esc(r.page_title || r.slug || 'Untitled')}${
        r.trusted_brands ? ' <span class="chip tb-chip">Trusted Brands</span>' : ''}${
        r.writer_doc_url?.startsWith('docx://') ? ' <span class="chip docx-chip">DOCX</span>' : ''}${
        r.template_id ? ` <span class="chip tpl-chip">📐 ${esc(TEMPLATES.find((t)=>t.id===r.template_id)?.name||r.template_id)}</span>` : ''}</div>
      <div class="t-meta"><span class="chip ${r.status}">${r.status.replace(/_/g, ' ')}</span><span>${fmtTime(r.created_at)}</span></div>
    </div>`).join('') || `<div class="empty">Nothing yet.</div>`;
  recent.querySelectorAll('.thread').forEach((t) => { t.onclick = () => openRun(t.dataset.id); });
}


// ── Open a run (live or replay) ────────────────
async function openRun(id) {
  closeStream();
  state.view = 'run';
  state.activeRunId = id;
  state.reviseOpen = false;
  const data = await api(`/api/runs/${id}`);
  state.run = data.run; state.events = data.events; state.revisions = data.revisions; state.approval = data.approval;
  renderThreads();
  renderRun(document.getElementById('main-inner'));
  // Stream live if the run is still active.
  const terminal = ['approved', 'promoted', 'failed'].includes(state.run.status);
  connectStream(id);
  if (terminal) { /* stream will just replay history then idle */ }
}

function connectStream(id) {
  const es = new EventSource(`/api/runs/${id}/stream`);
  state.es = es;
  const onEvt = (e) => {
    try {
      const ev = JSON.parse(e.data);
      handleEvent(ev);
    } catch { /* ignore ping */ }
  };
  // Named events + default
  ['log', 'phase_start', 'phase_done', 'hard_stop', 'output', 'status', 'extract_result',
   'validate_brief_ok', 'match_result', 'design_tokens', 'blueprint', 'files_written',
   'validate_output_ok', 'awaiting_review', 'run_failed', 'approved', 'revise_start',
   'revise_requested', 'run_created', 'run_failed'].forEach((t) => es.addEventListener(t, onEvt));
  es.onmessage = onEvt;
  es.onerror = () => { /* browser auto-retries */ };
}

function closeStream() { if (state.es) { state.es.close(); state.es = null; } }

function handleEvent(ev) {
  if (ev.type === 'status') {
    if (state.run) state.run.status = ev.status;
    const r = state.runs.find((x) => x.id === state.activeRunId); if (r) r.status = ev.status;
    renderThreads();
    // refresh run header + review bar
    if (state.run) { state.run = { ...state.run, ...(ev.payload || {}) }; }
    renderRun(document.getElementById('main-inner'));
    return;
  }
  // Dedup by id
  if (ev.id && state.events.some((e) => e.id === ev.id)) return;
  state.events.push(ev);
  if (state.view === 'run') renderRun(document.getElementById('main-inner'));

  if (ev.type === 'output' && ev.payload?.open_in_new_tab && ev.payload?.preview_url) {
    // Auto-open the generated page in a new tab (once).
    if (!openRun._opened) openRun._opened = new Set();
    if (!openRun._opened.has(ev.payload.preview_url)) {
      openRun._opened.add(ev.payload.preview_url);
      window.open(ev.payload.preview_url, '_blank');
    }
  }
}

// ── Render a run (console + review) ────────────
function groupByPhase(events) {
  const order = [0, 1, 2, 6, 'validation'];
  const groups = new Map();
  for (const key of order) groups.set(String(key), { key, title: PHASE_META[key], logs: [], data: {}, started: false, done: false, failed: false });
  for (const ev of events) {
    const key = String(ev.phase);
    if (!groups.has(key)) continue;
    const g = groups.get(key);
    if (ev.type === 'phase_start') g.started = true;
    if (ev.type === 'phase_done') g.done = true;
    if (ev.type === 'hard_stop') g.failed = true;
    if (ev.type === 'log') g.logs.push(ev);
    if (['extract_result', 'validate_brief_ok', 'match_result', 'design_tokens', 'blueprint', 'files_written', 'validate_output_ok'].includes(ev.type)) {
      g.data[ev.type] = ev.payload;
    }
  }
  return order.map((k) => groups.get(String(k)));
}

function getPreviewUrl(run) {
  if (!run?.slug) return null;
  return `/preview/${run.slug}/index.html`;
}

function hasGeneratedOutput(run) {
  if (state.events.some((e) => e.type === 'output')) return true;
  if (run?.output_path && ['awaiting_review', 'approved', 'revising', 'promoted'].includes(run?.status)) {
    return true;
  }
  return false;
}

function renderRun(el) {
  if (!el || !state.run) return;
  const run = state.run;
  const hardStop = state.events.filter((e) => e.type === 'hard_stop').slice(-1)[0];
  const output = state.events.filter((e) => e.type === 'output').slice(-1)[0];
  const outputReady = hasGeneratedOutput(run);
  const previewUrl = outputReady
    ? (output?.payload?.preview_url || getPreviewUrl(run))
    : null;
  const showOutput = outputReady && run.status !== 'failed' && previewUrl;
  const groups = groupByPhase(state.events);
  const isTerminal = ['approved', 'promoted', 'failed'].includes(run.status);
  const active = !isTerminal && run.status !== 'awaiting_review';

  el.innerHTML = `
    <div class="run-head">
      <div>
        <h2>${esc(run.page_title || run.slug || 'Building…')}</h2>
        <div class="url">${esc(run.writer_doc_url)}</div>
        ${run.trusted_brands ? '<span class="chip tb-chip" title="Trusted brands marquee will be injected after the hero section">★ Trusted Brands</span>' : ''}
        ${run.template_id ? `<span class="chip tpl-chip" title="Built with ${esc(TEMPLATES.find((t)=>t.id===run.template_id)?.name||run.template_id)} template">📐 ${esc(TEMPLATES.find((t)=>t.id===run.template_id)?.name||run.template_id)}</span>` : ''}
      </div>
      <span class="chip ${run.status}">${run.status.replace(/_/g, ' ')}</span>
    </div>
    ${hardStop ? renderHardStop(hardStop) : ''}
    ${showOutput ? renderOutputCard({ payload: { preview_url: previewUrl, output_path: run.output_path || `output/${run.slug}/` } }) : ''}
    <div id="phases">${groups.map(renderPhase).join('')}</div>
    ${state.revisions.length ? renderRevisionLog() : ''}
    ${['awaiting_review', 'approved', 'revising'].includes(run.status) ? renderReviewDock(run, previewUrl) : ''}
  `;
  wireRun(run);
  // Auto-scroll active logs
  el.querySelectorAll('.log').forEach((l) => { l.scrollTop = l.scrollHeight; });
}

function renderPhase(g) {
  if (!g.started && !g.logs.length && !Object.keys(g.data).length) {
    return `<div class="phase collapsed"><div class="phase-head" data-toggle><span class="dot"></span>${esc(g.title)}<span class="caret">▾</span></div><div class="phase-body"><div style="color:var(--muted);font-size:12px">Pending…</div></div></div>`;
  }
  const cls = g.failed ? 'failed' : g.done ? 'done' : 'active';
  let body = '';
  const d = g.data;
  if (d.extract_result) {
    const x = d.extract_result;
    body += `<div style="font-size:13px;margin-bottom:8px">Extracted <b>${x.pages ?? '?'}</b> page(s) · <b>${x.chars ?? '?'}</b> chars${x.footer_chars ? ` / footer ${x.footer_chars}` : ''}${x.archetype_guess ? ` · archetype: <b>${esc(x.archetype_guess)}</b>` : ''}</div>`;
  }
  if (d.validate_brief_ok) {
    body += `<div style="font-size:13px;margin-bottom:8px">Brief valid · archetype <b>${esc(d.validate_brief_ok.archetype || 'n/a')}</b></div>`;
  }
  if (d.match_result) {
    const m = d.match_result;
    body += `<div style="font-size:13px;margin-bottom:8px">Primary source: <b>${esc(m.primary_source || 'n/a')}</b></div>`;
    if (m.ranked?.length) body += `<div class="log" style="max-height:120px">${m.ranked.map((r) => `#${r.rank} ${esc(r.site)} — ${r.score}/10`).join('\n')}</div>`;
  }
  if (d.design_tokens) body += renderTokens(d.design_tokens);
  if (d.blueprint) {
    body += `<ol class="blueprint-list">${(d.blueprint.sections || []).map((s, i) => `<li><span class="num">${i + 1}.</span> ${esc(s)}</li>`).join('')}</ol>`;
  }
  if (d.files_written) {
    body += `<div class="files">${(d.files_written.files || []).map((f) => `<div class="file-row"><span>${esc(f.file)}</span><span>${fmtBytes(f.bytes)}</span></div>`).join('')}</div>`;
  }
  if (d.validate_output_ok) body += `<div style="font-size:13px;color:var(--green)">✓ validate:output passed</div>`;
  if (g.logs.length) {
    body += `<div class="log">${g.logs.map((l) => `<span class="ts">${fmtTime(l.created_at).split(', ')[1] || ''}</span>  ${esc(l.payload.message)}`).join('\n')}</div>`;
  }
  return `<div class="phase ${cls}"><div class="phase-head" data-toggle><span class="dot"></span>${esc(g.title)}<span class="caret">▾</span></div><div class="phase-body">${body || '<div style="color:var(--muted)">…</div>'}</div></div>`;
}

function renderTokens(tokens) {
  const colors = [];
  const walk = (obj) => { for (const [k, v] of Object.entries(obj || {})) { if (typeof v === 'string' && /^#|rgb|hsl/.test(v)) colors.push([k, v]); else if (typeof v === 'object') walk(v); } };
  walk(tokens);
  if (!colors.length) return `<div class="log" style="max-height:140px">${esc(JSON.stringify(tokens, null, 2))}</div>`;
  return `<div class="swatches">${colors.slice(0, 12).map(([k, v]) => `<div class="swatch"><div class="chipc" style="background:${esc(v)}"></div>${esc(k)}</div>`).join('')}</div>`;
}

function renderHardStop(ev) {
  const reason = ev.payload.reason;
  return `<div class="hardstop">
    <div class="hs-title">⛔ Hard stop — ${esc(HARD_STOP_TITLES[reason] || reason)}</div>
    <div class="hs-reason">${esc(reason)}</div>
    <div class="hs-msg">${esc(ev.payload.message || '')}</div>
  </div>`;
}

function renderOutputCard(ev) {
  const url = ev.payload.preview_url;
  return `<div class="output-card">
    <div><div style="font-weight:600">Page generated</div><div style="color:var(--muted);font-size:12px">${esc(ev.payload.output_path)}</div></div>
    <a class="oc-open" href="${esc(url)}" target="_blank">Open page ↗</a>
  </div>`;
}

function renderReviewDock(run, previewUrl) {
  return `<div class="review-dock${state.reviseOpen ? ' revise-open' : ''}">
    ${state.reviseOpen ? renderRevisePanel(run) : ''}
    ${renderReview(run, previewUrl)}
  </div>`;
}

function renderReview(run, previewUrl) {
  const approved = run.status === 'approved';
  const revising = run.status === 'revising';
  const openBtn = previewUrl
    ? `<a class="oc-open review-open" href="${esc(previewUrl)}" target="_blank">Open page ↗</a>`
    : '';
  return `<div class="review-bar">
    ${approved ? `<span class="chip approved">approved</span><span class="review-note">Promote happens later, by the dev team.</span>`
      : revising ? `<span class="chip revising">revising…</span>`
      : `<button class="accept-btn" id="accept">Accept</button>
         <button class="revise-btn" id="revise">Revise ▾</button>
         <span class="review-note">Round ${run.revise_rounds || 0}</span>`}
    <div class="review-bar-end">
      ${openBtn}
      ${approved ? `<button class="revise-btn" id="revise">Revise again ▾</button>` : ''}
    </div>
  </div>`;
}

function renderRevisePanel(run) {
  const sections = getSectionOptions();
  return `<div class="revise-panel">
    <div class="tabs">
      <div class="tab ${state.reviseScope === 'general' ? 'active' : ''}" data-scope="general">General revise</div>
      <div class="tab ${state.reviseScope === 'section' ? 'active' : ''}" data-scope="section">Revise specific content</div>
    </div>
    ${state.reviseScope === 'section' ? `<select id="rev-section">${sections.map((s) => `<option value="${esc(s)}">${esc(s)}</option>`).join('')}</select>` : ''}
    <textarea id="rev-text" placeholder="${state.reviseScope === 'section' ? 'What should change in this section?' : 'What should change across the page?'}"></textarea>
    <div class="revise-actions">
      <button class="submit-revise" id="rev-submit">Submit revision</button>
      <button class="cancel-revise" id="rev-cancel">Cancel</button>
    </div>
  </div>`;
}

function getSectionOptions() {
  const bp = state.events.filter((e) => e.type === 'blueprint').slice(-1)[0];
  if (bp?.payload?.sections?.length) return bp.payload.sections;
  return ['hero', 'features', 'testimonials', 'steps', 'integrations', 'cta', 'faq'];
}

function renderRevisionLog() {
  return `<div class="phase"><div class="phase-head" data-toggle><span class="dot" style="background:var(--amber)"></span>Revisions (${state.revisions.length})<span class="caret">▾</span></div>
    <div class="phase-body">${state.revisions.map((r) => `<div class="file-row" style="margin-bottom:6px"><span>#${r.round} · ${esc(r.scope)}${r.section_name ? ' · ' + esc(r.section_name) : ''}</span><span style="color:var(--muted)">${fmtTime(r.created_at)}</span></div><div style="font-size:13px;margin:2px 0 12px">${esc(r.instruction)}</div>`).join('')}</div></div>`;
}

function wireRun(run) {
  document.querySelectorAll('[data-toggle]').forEach((h) => { h.onclick = () => h.closest('.phase').classList.toggle('collapsed'); });
  const accept = document.getElementById('accept');
  if (accept) accept.onclick = async () => {
    accept.disabled = true; accept.textContent = 'Accepting…';
    const res = await api(`/api/runs/${run.id}/accept`, { method: 'POST' });
    state.run = res.run;
    const r = state.runs.find((x) => x.id === run.id);
    if (r) Object.assign(r, res.run);
    renderThreads(); renderRun(document.getElementById('main-inner'));
  };
  const revise = document.getElementById('revise');
  if (revise) revise.onclick = () => {
    state.reviseOpen = !state.reviseOpen;
    renderRun(document.getElementById('main-inner'));
    if (state.reviseOpen) {
      const panel = document.querySelector('.revise-panel textarea');
      panel?.focus();
      panel?.closest('.review-dock')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  };
  document.querySelectorAll('.tab').forEach((t) => { t.onclick = () => { state.reviseScope = t.dataset.scope; renderRun(document.getElementById('main-inner')); }; });
  const cancel = document.getElementById('rev-cancel');
  if (cancel) cancel.onclick = () => { state.reviseOpen = false; renderRun(document.getElementById('main-inner')); };
  const submit = document.getElementById('rev-submit');
  if (submit) submit.onclick = async () => {
    const instruction = document.getElementById('rev-text').value.trim();
    if (!instruction) return;
    const scope = state.reviseScope;
    const section_name = scope === 'section' ? document.getElementById('rev-section').value : null;
    submit.disabled = true; submit.textContent = 'Submitting…';
    const { revision } = await api(`/api/runs/${run.id}/revise`, { method: 'POST', body: { scope, section_name, instruction } });
    state.revisions.push(revision);
    state.reviseOpen = false;
    openRun._opened?.clear?.();
    renderRun(document.getElementById('main-inner'));
  };
}

boot();
