/**
 * Reliable Puppeteer launch — avoids Cursor/sandbox temp PUPPETEER_CACHE_DIR
 * and falls back to the user's installed Google Chrome on Windows/macOS/Linux.
 */

import fs from 'fs';
import os from 'os';
import path from 'path';

export function resolvePuppeteerCacheDir() {
  const fromEnv = process.env.PUPPETEER_CACHE_DIR;
  const isEphemeral = fromEnv && /[\\/](temp|tmp|cursor-sandbox-cache)[\\/]/i.test(fromEnv);
  if (fromEnv && !isEphemeral) return path.resolve(fromEnv);
  return path.join(os.homedir(), '.cache', 'puppeteer');
}

function systemChromeCandidates() {
  if (process.platform === 'win32') {
    return [
      path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'Application', 'chrome.exe')
    ];
  }
  if (process.platform === 'darwin') {
    return ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
  }
  return [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser'
  ];
}

function findCachedChromeExecutable(cacheDir) {
  const root = path.join(cacheDir, 'chrome');
  if (!fs.existsSync(root)) return null;

  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isFile() && ent.name === 'chrome.exe') return full;
      if (ent.isFile() && ent.name === 'Google Chrome for Testing') return full;
      if (ent.isDirectory()) stack.push(full);
    }
  }
  return null;
}

/** Resolve a Chrome binary — cached Puppeteer build first, then system install. */
export function resolveChromeExecutable() {
  const cacheDir = resolvePuppeteerCacheDir();
  const cached = findCachedChromeExecutable(cacheDir);
  if (cached) return cached;

  for (const candidate of systemChromeCandidates()) {
    if (candidate && fs.existsSync(candidate)) return candidate;
  }
  return null;
}

/** Apply cache dir + executablePath before puppeteer.launch(). */
export function buildPuppeteerLaunchOptions(baseOptions = {}) {
  const cacheDir = resolvePuppeteerCacheDir();
  process.env.PUPPETEER_CACHE_DIR = cacheDir;

  const opts = { ...baseOptions };
  const exe = resolveChromeExecutable();
  if (exe) {
    opts.executablePath = exe;
  }
  return opts;
}

export async function launchPuppeteer(puppeteer, baseOptions = {}) {
  const opts = buildPuppeteerLaunchOptions(baseOptions);

  if (opts.executablePath) {
    return puppeteer.launch(opts);
  }

  // Puppeteer can locate Chrome via channel when installed system-wide.
  try {
    return await puppeteer.launch({ ...opts, channel: 'chrome' });
  } catch {
    return puppeteer.launch(opts);
  }
}
