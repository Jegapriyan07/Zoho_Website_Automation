import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// web-tool/ lives inside the pipeline repo. Root is the parent of web-tool/.
const WEB_TOOL_DIR = path.resolve(__dirname, '..');
const AUTO_PIPELINE_ROOT = path.resolve(WEB_TOOL_DIR, '..');

// Puppeteer looks up its downloaded Chrome via PUPPETEER_CACHE_DIR. Some launch
// environments (e.g. Cursor's sandbox) inject a *temporary* cache path that gets
// wiped, which makes extraction hard-stop with "Could not find Chrome". Ignore any
// ephemeral temp path and fall back to the standard, persistent per-user cache.
function resolvePuppeteerCacheDir() {
  const fromEnv = process.env.PUPPETEER_CACHE_DIR;
  const isEphemeral = fromEnv && /[\\/](temp|tmp|cursor-sandbox-cache)[\\/]/i.test(fromEnv);
  if (fromEnv && !isEphemeral) return path.resolve(fromEnv);
  return path.join(os.homedir(), '.cache', 'puppeteer');
}

export const config = {
  port: parseInt(process.env.PORT || '4310', 10),
  appBaseUrl: (process.env.APP_BASE_URL || 'http://localhost:4310').replace(/\/$/, ''),

  tokenEncKey: process.env.TOKEN_ENC_KEY || '',
  sessionSecret: process.env.SESSION_SECRET || 'dev-insecure-session-secret',

  zoho: {
    clientId: process.env.ZOHO_CLIENT_ID || '',
    clientSecret: process.env.ZOHO_CLIENT_SECRET || '',
    accountsBase: (process.env.ZOHO_ACCOUNTS_BASE || 'https://accounts.zoho.com').replace(/\/$/, ''),
    scope: process.env.ZOHO_SCOPE || 'ZohoWriter.documents.READ,AaaServer.profile.READ'
  },

  pipelineRoot: process.env.PIPELINE_ROOT
    ? path.resolve(process.env.PIPELINE_ROOT)
    : AUTO_PIPELINE_ROOT,

  webToolDir: WEB_TOOL_DIR,
  dataDir: path.join(WEB_TOOL_DIR, 'data'),
  publicDir: path.join(WEB_TOOL_DIR, 'public'),

  puppeteerCacheDir: resolvePuppeteerCacheDir(),

  composerSpawn: resolveComposerSpawn(process.env.COMPOSER_CMD || ''),
  // Default to composer-2.5 for lower token cost. Override with COMPOSER_MODEL in
  // .env (e.g. claude-sonnet-5-thinking-high or claude-opus-4-8-thinking-high).
  composerModel: process.env.COMPOSER_MODEL || 'composer-2.5'
};

/**
 * Structured spawn target — avoids shell-quoting bugs when the repo path has spaces
 * (e.g. `Web-pages (1)`).
 */
function resolveComposerSpawn(cmd) {
  const trimmed = String(cmd || '').trim();
  if (!trimmed) return null;

  const wrapper = path.join(WEB_TOOL_DIR, 'scripts', 'composer-runner.mjs');
  const isDirectAgent = /^(cursor-agent(?:\.cmd)?|agent)(?:\s|$)/i.test(trimmed);
  if (isDirectAgent) {
    return {
      bin: process.execPath,
      args: [wrapper],
      useShell: false,
      label: 'composer-runner (cursor-agent + retries)'
    };
  }

  return parseComposerSpawn(trimmed);
}

/** Parse COMPOSER_CMD strings; quoted segments survive spaces. */
function parseComposerSpawn(cmd) {
  const tokens = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m;
  while ((m = re.exec(cmd)) !== null) {
    tokens.push(m[1] ?? m[2] ?? m[3]);
  }
  if (!tokens.length) return null;
  return {
    bin: tokens[0],
    args: tokens.slice(1),
    useShell: false,
    label: cmd
  };
}

export const redirectUri = `${config.appBaseUrl}/auth/zoho/callback`;

export function zohoConfigured() {
  return Boolean(config.zoho.clientId && config.zoho.clientSecret);
}

export function isDevAuthAllowed() {
  // When Zoho isn't configured we permit a local "dev login" so the tool is
  // runnable/testable without real OAuth credentials. Never enabled in prod.
  return !zohoConfigured() && config.appBaseUrl.includes('localhost');
}
