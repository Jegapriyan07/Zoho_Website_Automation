#!/usr/bin/env node
/**
 * One-time headed Chrome sign-in for Zoho Writer Puppeteer extraction.
 * Writes .zoho-session-ready into the user-data-dir when login succeeds.
 *
 * Usage:
 *   node z_workflow/scripts/warm-writer-session.mjs --user-data-dir <path> [--accounts-url URL]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { zohoSessionMarkerPath } from './extract-writer.mjs';
import { launchPuppeteer, resolveChromeExecutable } from './puppeteer-launch.mjs';
import { isScriptMain } from './workflow-paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const args = {
    userDataDir: null,
    accountsUrl: 'https://accounts.zoho.com/signin',
    loginTimeout: 300000
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--user-data-dir' && argv[i + 1]) args.userDataDir = argv[++i];
    else if (a === '--accounts-url' && argv[i + 1]) args.accountsUrl = argv[++i];
    else if (a === '--login-timeout' && argv[i + 1]) args.loginTimeout = parseInt(argv[++i], 10);
  }
  return args;
}

async function loadPuppeteer() {
  try {
    const mod = await import('puppeteer');
    return mod.default || mod;
  } catch {
    throw new Error(
      'puppeteer is not installed. Run: npm install puppeteer --save-dev (from the repo root).'
    );
  }
}

async function warmSession(options) {
  const chromeExe = resolveChromeExecutable();
  if (!chromeExe) {
    throw new Error(
      'Google Chrome not found. Install Chrome, or run: npx puppeteer browsers install chrome'
    );
  }

  options.onStatus?.('launching', 'Opening Chrome…');

  const puppeteer = await loadPuppeteer();
  const userDataDir = path.resolve(options.userDataDir);
  fs.mkdirSync(userDataDir, { recursive: true });

  const browser = await launchPuppeteer(puppeteer, {
    headless: false,
    userDataDir,
    protocolTimeout: 120000,
    ignoreDefaultArgs: ['--enable-automation'],
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1200,800',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  options.onStatus?.('waiting_signin', 'Chrome opened — sign in to Zoho in the window.');

  try {
    const page = await browser.newPage();
    await page.goto(options.accountsUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });

    if (/accounts\.zoho/i.test(page.url())) {
      console.log('');
      console.log('================================================================');
      console.log(' Sign in to Zoho in the Chrome window that opened.');
      console.log(` Waiting up to ${Math.round(options.loginTimeout / 1000)}s…`);
      console.log(' This is a one-time setup — future builds reuse this session.');
      console.log('================================================================');

      await page
        .waitForFunction(() => !/accounts\.zoho/i.test(location.href), {
          timeout: options.loginTimeout,
          polling: 1000
        })
        .catch(() => {
          throw new Error('Timed out waiting for Zoho sign-in during session warm-up.');
        });
    }

    fs.writeFileSync(
      zohoSessionMarkerPath(userDataDir),
      JSON.stringify({ signed_in_at: new Date().toISOString(), warm_up: true }, null, 2) + '\n'
    );
    await new Promise((r) => setTimeout(r, 1200));
    console.log('Writer browser session ready.');
    options.onStatus?.('ready', 'Writer browser session ready.');
  } finally {
    await browser.close();
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.userDataDir) {
    console.error('Usage: warm-writer-session.mjs --user-data-dir <path> [--accounts-url URL]');
    process.exit(1);
  }
  await warmSession(args);
}

if (isScriptMain(import.meta.url)) {
  main().catch((err) => {
    console.error(err.message || err);
    process.exit(1);
  });
}

export { warmSession };
