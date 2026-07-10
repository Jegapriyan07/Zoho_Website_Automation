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

function save(key, rows) {
  ensureDir();
  const p = filePath(key);
  const tmp = `${p}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(rows, null, 2) + '\n');
  fs.renameSync(tmp, p);
}

export function newId(prefix = '') {
  return `${prefix}${prefix ? '_' : ''}${crypto.randomBytes(9).toString('base64url')}`;
}

const now = () => new Date().toISOString();

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
    const rows = load('events');
    const ev = {
      id: newId('ev'),
      run_id,
      phase, // 0 | 1 | 2 | 6 | 'validation' | 'system'
      type, // 'phase_start' | 'log' | 'phase_done' | 'hard_stop' | 'output' | 'review' | ...
      payload,
      created_at: now()
    };
    rows.push(ev);
    save('events', rows);
    return ev;
  },
  listByRun(run_id) {
    return load('events')
      .filter((e) => e.run_id === run_id)
      .sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
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
