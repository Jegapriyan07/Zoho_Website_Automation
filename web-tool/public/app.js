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
  building: false
};

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
function renderNewBuild(el) {
  el.innerHTML = `
    <div class="build-hero">
      <h1>New build</h1>
      <p>Paste a Zoho Writer document URL. The agent pipeline runs live — Phase 0 → 1 → 2 → 6.</p>
      <div class="url-row">
        <input id="writer-url" type="text" placeholder="https://writer.zoho.com/writer/open/…" />
        <button class="build-btn" id="go">Build</button>
      </div>
      <div class="field-err" id="url-err"></div>
    </div>
    <div class="recent">
      <h3>Recent runs</h3>
      <div id="recent-list"></div>
    </div>`;
  const input = document.getElementById('writer-url');
  const err = document.getElementById('url-err');
  const go = document.getElementById('go');
  const submit = async () => {
    err.textContent = '';
    const url = input.value.trim();
    if (!/writer\.zoho\./i.test(url)) { err.textContent = 'Enter a valid writer.zoho.* document URL.'; return; }
    go.disabled = true; go.textContent = 'Starting…';
    try {
      const { run } = await api('/api/runs', { method: 'POST', body: { writer_doc_url: url } });
      state.runs.unshift(run);
      openRun(run.id);
    } catch (e) {
      err.textContent = e.data?.message || 'Failed to start build.';
      go.disabled = false; go.textContent = 'Build';
    }
  };
  go.onclick = submit;
  input.onkeydown = (e) => { if (e.key === 'Enter') submit(); };

  const recent = document.getElementById('recent-list');
  recent.innerHTML = state.runs.slice(0, 6).map((r) => `
    <div class="thread" data-id="${r.id}" style="margin-top:8px">
      <div class="t-title">${esc(r.page_title || r.slug || 'Untitled')}</div>
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
  return Boolean(
    run?.output_path ||
    run?.slug ||
    state.events.some((e) => e.type === 'output')
  );
}

function renderRun(el) {
  if (!el || !state.run) return;
  const run = state.run;
  const hardStop = state.events.filter((e) => e.type === 'hard_stop').slice(-1)[0];
  const output = state.events.filter((e) => e.type === 'output').slice(-1)[0];
  const previewUrl = output?.payload?.preview_url || getPreviewUrl(run);
  const showOutput = hasGeneratedOutput(run) && run.status !== 'failed' && previewUrl;
  const groups = groupByPhase(state.events);
  const isTerminal = ['approved', 'promoted', 'failed'].includes(run.status);
  const active = !isTerminal && run.status !== 'awaiting_review';

  el.innerHTML = `
    <div class="run-head">
      <div>
        <h2>${esc(run.page_title || run.slug || 'Building…')}</h2>
        <div class="url">${esc(run.writer_doc_url)}</div>
      </div>
      <span class="chip ${run.status}">${run.status.replace(/_/g, ' ')}</span>
    </div>
    ${hardStop ? renderHardStop(hardStop) : ''}
    ${showOutput ? renderOutputCard({ payload: { preview_url: previewUrl, output_path: run.output_path || `output/${run.slug}/` } }) : ''}
    <div id="phases">${groups.map(renderPhase).join('')}</div>
    ${state.revisions.length ? renderRevisionLog() : ''}
    ${['awaiting_review', 'approved', 'revising'].includes(run.status) ? renderReview(run, previewUrl) : ''}
    ${state.reviseOpen ? renderRevisePanel(run) : ''}
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
  if (revise) revise.onclick = () => { state.reviseOpen = !state.reviseOpen; renderRun(document.getElementById('main-inner')); };
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
