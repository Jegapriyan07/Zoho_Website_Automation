import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { config } from './config.js';

// ── Durable JSON-file datastore ────────────────────────────────
// Implements the §6 data model (User, Run, RunEvent, Revision, Approval).
// Deliberately behind a small repository API so it can be swapped for
// SQLite/Postgres later without touching callers. Durable across restarts.

const FILES = {
  users: 'users.json',
  runs: 'runs.json',
  events: 'run_events.json',
  revisions: 'revisions.json',
  approvals: 'approvals.json'
};

function ensureDir() {
  if (!fs.existsSync(config.dataDir)) fs.mkdirSync(config.dataDir, { recursive: true });
}

function filePath(key) {
  return path.join(config.dataDir, FILES[key]);
}

function load(key) {
  ensureDir();
  const p = filePath(key);
  if (!fs.existsSync(p)) return [];
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return [];
  }
}

function sleepSync(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    /* busy-wait: Node has no sync sleep, and save must stay sync for callers */
  }
}

/**
 * Windows-safe atomic-ish write. Rapid renameSync on a hot file often throws
 * EPERM/EBUSY while Defender / Indexer still hold the previous handle — that
 * previously crashed the orchestrator mid validate:output and left runs stuck
 * on VALIDATING.
 */
function save(key, rows) {
  ensureDir();
  const p = filePath(key);
  const payload = JSON.stringify(rows) + '\n';
  const tmp = `${p}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, payload);

  let lastErr = null;
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      try {
        if (fs.existsSync(p)) fs.unlinkSync(p);
      } catch {
        /* dest may be locked — rename or write below may still succeed */
      }
      fs.renameSync(tmp, p);
      return;
    } catch (err) {
      lastErr = err;
      const retryable = err && ['EPERM', 'EACCES', 'EBUSY', 'ENOENT'].includes(err.code);
      if (!retryable) break;
      sleepSync(15 * (attempt + 1));
    }
  }

  try {
    fs.writeFileSync(p, payload);
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* ignore */
    }
    return;
  } catch (err) {
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* ignore */
    }
    throw lastErr || err;
  }
}

export function newId(prefix = '') {
  return `${prefix}${prefix ? '_' : ''}${crypto.randomBytes(9).toString('base64url')}`;
}

const now = () => new Date().toISOString();

// ── Events cache ───────────────────────────────────────────────
// validate:output / composer streams can emit dozens of log lines in <100ms.
// Coalesce disk writes so we don't rewrite a multi-100KB run_events.json
// once per line (the EPERM failure mode on Windows).

const eventsCache = {
  rows: null,
  dirty: false,
  timer: null
};

function getEventsRows() {
  if (!eventsCache.rows) eventsCache.rows = load('events');
  return eventsCache.rows;
}

function flushEventsSync() {
  if (eventsCache.timer) {
    clearTimeout(eventsCache.timer);
    eventsCache.timer = null;
  }
  if (!eventsCache.dirty || !eventsCache.rows) return;
  save('events', eventsCache.rows);
  eventsCache.dirty = false;
}

function scheduleEventsFlush() {
  eventsCache.dirty = true;
  if (eventsCache.timer) return;
  eventsCache.timer = setTimeout(() => {
    eventsCache.timer = null;
    try {
      flushEventsSync();
    } catch (err) {
      console.error('[store] deferred run_events flush failed:', err.message);
    }
  }, 75);
}

function invalidateEventsCache() {
  flushEventsSync();
  eventsCache.rows = null;
}

process.on('exit', () => {
  try {
    flushEventsSync();
  } catch {
    /* best effort */
  }
});
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(sig, () => {
    try {
      flushEventsSync();
    } catch {
      /* best effort */
    }
  });
}

// ── Users ──────────────────────────────────────────────────────

export const Users = {
  findByZohoId(zohoUserId) {
    return load('users').find((u) => u.zoho_user_id === zohoUserId) || null;
  },
  get(id) {
    return load('users').find((u) => u.id === id) || null;
  },
  upsertByZohoId({ zoho_user_id, email, display_name, tokens_enc }) {
    const rows = load('users');
    let user = rows.find((u) => u.zoho_user_id === zoho_user_id);
    if (user) {
      if (email) user.email = email;
      if (display_name) user.display_name = display_name;
      if (tokens_enc) user.tokens_enc = tokens_enc;
      user.updated_at = now();
    } else {
      user = {
        id: newId('user'),
        zoho_user_id,
        email: email || '',
        display_name: display_name || email || zoho_user_id,
        tokens_enc: tokens_enc || null,
        created_at: now(),
        updated_at: now()
      };
      rows.push(user);
    }
    save('users', rows);
    return user;
  },
  setTokens(id, tokens_enc) {
    const rows = load('users');
    const user = rows.find((u) => u.id === id);
    if (!user) return null;
    user.tokens_enc = tokens_enc;
    user.updated_at = now();
    save('users', rows);
    return user;
  }
};

// ── Runs ───────────────────────────────────────────────────────

export const Runs = {
  create({ user_id, writer_doc_url, slug, page_title, trusted_brands, template_id }) {
    const rows = load('runs');
    const run = {
      id: newId('run'),
      user_id,
      writer_doc_url,
      slug: slug || null,
      page_title: page_title || null,
      status: 'extracting',
      failed_reason: null,
      output_path: null,
      revise_rounds: 0,
      approved: false,
      trusted_brands: trusted_brands === true, // whether to inject the brand marquee
      template_id: template_id || null,         // optional page-structure template hint
      created_at: now(),
      updated_at: now()
    };
    rows.push(run);
    save('runs', rows);
    return run;
  },
  get(id) {
    return load('runs').find((r) => r.id === id) || null;
  },
  update(id, patch) {
    const rows = load('runs');
    const run = rows.find((r) => r.id === id);
    if (!run) return null;
    Object.assign(run, patch, { updated_at: now() });
    save('runs', rows);
    return run;
  },
  listByUser(user_id) {
    return load('runs')
      .filter((r) => r.user_id === user_id)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }
};

// ── RunEvents (powers live console + chat replay) ──────────────

export const RunEvents = {
  append(run_id, phase, type, payload = {}) {
    const rows = getEventsRows();
    const ev = {
      id: newId('ev'),
      run_id,
      phase, // 0 | 1 | 2 | 6 | 'validation' | 'system'
      type, // 'phase_start' | 'log' | 'phase_done' | 'hard_stop' | 'output' | 'review' | ...
      payload,
      created_at: now()
    };
    rows.push(ev);
    // High-frequency log storms (validate:output inventory dumps) are coalesced.
    // Critical lifecycle events flush immediately so status survives a crash.
    if (type === 'log') {
      scheduleEventsFlush();
    } else {
      flushEventsSync();
    }
    return ev;
  },
  listByRun(run_id) {
    flushEventsSync();
    return getEventsRows()
      .filter((e) => e.run_id === run_id)
      .sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
  },
  /** Force any deferred log writes to disk (tests / graceful shutdown). */
  flush() {
    flushEventsSync();
  },
  /** Drop in-memory cache after external edits of run_events.json. */
  reload() {
    invalidateEventsCache();
  }
};

// ── Revisions ──────────────────────────────────────────────────

export const Revisions = {
  create({ run_id, round, scope, section_name, instruction }) {
    const rows = load('revisions');
    const rev = {
      id: newId('rev'),
      run_id,
      round,
      scope, // 'general' | 'section'
      section_name: section_name || null,
      instruction,
      created_at: now()
    };
    rows.push(rev);
    save('revisions', rows);
    return rev;
  },
  listByRun(run_id) {
    return load('revisions')
      .filter((r) => r.run_id === run_id)
      .sort((a, b) => a.round - b.round);
  }
};

// ── Approvals ──────────────────────────────────────────────────

export const Approvals = {
  create({ run_id, approved_by }) {
    const rows = load('approvals');
    const ap = {
      id: newId('ap'),
      run_id,
      approved_by,
      approved_at: now()
    };
    rows.push(ap);
    save('approvals', rows);
    return ap;
  },
  getByRun(run_id) {
    return load('approvals').find((a) => a.run_id === run_id) || null;
  }
};
