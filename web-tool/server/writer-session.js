import fs from 'node:fs';
import path from 'node:path';
import { config, zohoConfigured } from './config.js';
import { getWriterApiStatus } from './writer-api.js';

/** @type {Map<string, { status: string, message?: string, error?: string, started_at: number }>} */
const warmupByUser = new Map();

const STALE_WARMUP_MS = 2 * 60 * 1000;

/** Per-user persistent Chrome profile used by Puppeteer extraction. */
export function chromeProfileDir(userId) {
  const dir = path.join(config.dataDir, 'chrome-profiles', userId);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function sessionMarkerPath(profileDir) {
  return path.join(profileDir, '.zoho-session-ready');
}

export function isBrowserSessionReady(userId) {
  return fs.existsSync(sessionMarkerPath(chromeProfileDir(userId)));
}

function getWarmupState(userId) {
  return warmupByUser.get(userId) || null;
}

function isWarmupInProgress(userId) {
  const w = getWarmupState(userId);
  if (!w) return false;
  if (w.status !== 'launching' && w.status !== 'waiting_signin') return false;
  if (Date.now() - (w.started_at || 0) > STALE_WARMUP_MS) {
    clearWarmupState(userId);
    return false;
  }
  return true;
}

export function clearWarmupState(userId) {
  warmupByUser.delete(userId);
}

export function getWriterSessionStatus(user) {
  const profileDir = chromeProfileDir(user.id);
  const browserReady = fs.existsSync(sessionMarkerPath(profileDir));
  const { api_ready, api_status } = getWriterApiStatus(user);
  const warmup = getWarmupState(user.id);
  let signedInAt = null;
  if (browserReady) {
    try {
      const marker = JSON.parse(fs.readFileSync(sessionMarkerPath(profileDir), 'utf8'));
      signedInAt = marker.signed_in_at || null;
    } catch { /* ignore */ }
  }

  return {
    api_ready,
    api_status,
    browser_ready: browserReady,
    writer_ready: api_ready,
    zoho_configured: zohoConfigured(),
    signed_in_at: signedInAt,
    profile_dir: profileDir,
    warmup: warmup
      ? {
          status: warmup.status,
          message: warmup.message || null,
          error: warmup.error || null
        }
      : null
  };
}

function setWarmupState(userId, patch) {
  const prev = warmupByUser.get(userId) || { status: 'idle', started_at: Date.now() };
  warmupByUser.set(userId, { ...prev, ...patch });
}

/** Opens headed Chrome once so future browser fallbacks skip login. */
export async function startBrowserSessionWarmup(user, { onLog, force = false } = {}) {
  if (isBrowserSessionReady(user.id)) {
    clearWarmupState(user.id);
    return { ok: true, already_ready: true };
  }

  if (force) clearWarmupState(user.id);
  else if (isWarmupInProgress(user.id)) {
    return { ok: true, in_progress: true, ...getWarmupState(user.id) };
  }

  const profileDir = chromeProfileDir(user.id);
  const accountsBase = config.zoho.accountsBase.replace(/\/$/, '');

  setWarmupState(user.id, {
    status: 'launching',
    message: 'Opening Chrome…',
    error: null,
    started_at: Date.now()
  });

  process.env.PUPPETEER_CACHE_DIR = config.puppeteerCacheDir;

  try {
    const { warmSession } = await import('../../z_workflow/scripts/warm-writer-session.mjs');

    await warmSession({
      userDataDir: profileDir,
      accountsUrl: `${accountsBase}/signin`,
      loginTimeout: 300000,
      onLog: (line) => onLog?.(line),
      onStatus: (status, message) => {
        setWarmupState(user.id, { status, message, error: null, started_at: Date.now() });
        onLog?.(message);
      }
    });

    clearWarmupState(user.id);
    return { ok: true };
  } catch (e) {
    const message = e.message || String(e);
    setWarmupState(user.id, {
      status: 'failed',
      message: 'Could not open Chrome for Zoho sign-in.',
      error: message,
      started_at: Date.now()
    });
    throw e;
  }
}
