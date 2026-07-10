#!/usr/bin/env node
/**
 * Resilient cursor-agent wrapper for autonomous Web Page Builder runs.
 *
 * cursor-agent often logs "Connection lost, reconnecting…" on long compose jobs.
 * Its built-in retries are not always enough. This wrapper:
 *   - runs cursor-agent headless with stable flags (--trust, fast model)
 *   - restarts with --continue when the process exits after connection loss
 *   - detects output stalls and retries
 *
 * Usage (from pipeline root):
 *   echo "<prompt>" | node web-tool/scripts/composer-runner.mjs
 *
 * COMPOSER_CMD should point here instead of cursor-agent directly.
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const MAX_ATTEMPTS = 4;
const STALL_MS = parseInt(process.env.COMPOSER_STALL_MS || '', 10) || 12 * 60 * 1000;
const RETRY_PAUSE_MS = 8000;

const CONNECTION_LOST_RE = /connection lost|reconnecting to https?:\/\/|retry attempt \d/i;
const RECONNECTING_NOTE = '[composer-runner] Composer reconnecting — still working (this is normal on long builds).';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8').trim();
}

const VERSION_DIR_RE = /^\d{4}\.\d{1,2}\.\d{1,2}(-\d{2}-\d{2}-\d{2})?-[a-f0-9]+$/;

function versionSortKey(name) {
  const datePart = name.split('-')[0];
  const [y, m, d] = datePart.split('.');
  return `${y}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`;
}

/** Resolve cursor-agent to a real node.exe + index.js (no .cmd/.ps1 shell shims). */
function resolveAgentSpawn() {
  if (process.env.CURSOR_AGENT_NODE && process.env.CURSOR_AGENT_ENTRY) {
    return {
      bin: process.env.CURSOR_AGENT_NODE,
      argsPrefix: [process.env.CURSOR_AGENT_ENTRY],
      useShell: false
    };
  }

  const installRoot =
    process.env.CURSOR_AGENT_HOME ||
    path.join(process.env.LOCALAPPDATA || process.env.HOME || '', 'cursor-agent');

  const flatNode = path.join(installRoot, 'node.exe');
  const flatIndex = path.join(installRoot, 'index.js');
  if (fs.existsSync(flatNode) && fs.existsSync(flatIndex)) {
    return { bin: flatNode, argsPrefix: [flatIndex], useShell: false };
  }

  const versionsDir = path.join(installRoot, 'versions');
  if (fs.existsSync(versionsDir)) {
    const latest = fs
      .readdirSync(versionsDir)
      .filter((n) => VERSION_DIR_RE.test(n))
      .sort((a, b) => versionSortKey(b).localeCompare(versionSortKey(a)))[0];

    if (latest) {
      const verRoot = path.join(versionsDir, latest);
      const nodePath = path.join(verRoot, 'node.exe');
      const indexPath = path.join(verRoot, 'index.js');
      if (fs.existsSync(nodePath) && fs.existsSync(indexPath)) {
        return { bin: nodePath, argsPrefix: [indexPath], useShell: false };
      }
    }
  }

  return {
    bin: process.platform === 'win32' ? 'cursor-agent.cmd' : 'cursor-agent',
    argsPrefix: [],
    useShell: process.platform === 'win32'
  };
}

function buildArgs(attempt) {
  const args = [
    '-p',
    '--force',
    '--trust',
    '--output-format',
    'text',
    '--model',
    process.env.COMPOSER_MODEL || 'composer-2.5'
  ];
  if (attempt > 1) args.push('--continue');
  return args;
}

function watchOutputActivity(slug, onActivity) {
  if (!slug) return () => {};

  const outputDir = path.join(process.cwd(), 'output', slug);
  let watcher = null;
  let pollTimer = null;

  const attach = () => {
    if (!fs.existsSync(outputDir)) return false;
    try {
      watcher = fs.watch(outputDir, { recursive: true }, onActivity);
      return true;
    } catch {
      return false;
    }
  };

  if (!attach()) {
    pollTimer = setInterval(() => {
      if (attach()) clearInterval(pollTimer);
    }, 5000);
  }

  return () => {
    if (pollTimer) clearInterval(pollTimer);
    if (watcher) watcher.close();
  };
}

function runAgent(prompt, attempt) {
  return new Promise((resolve) => {
    const { bin, argsPrefix, useShell } = resolveAgentSpawn();
    const args = [...argsPrefix, ...buildArgs(attempt)];
    const child = spawn(bin, args, {
      cwd: process.cwd(),
      env: process.env,
      shell: useShell,
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let combined = '';
    let hadConnectionLoss = false;
    let reconnectNoted = false;
    let stallTimer = null;
    let stopOutputWatch = () => {};

    const bumpStall = () => {
      if (stallTimer) clearTimeout(stallTimer);
      stallTimer = setTimeout(() => {
        console.error(
          `[composer-runner] No output or file activity for ${Math.round(STALL_MS / 60000)} min — restarting (attempt ${attempt + 1})…`
        );
        child.kill('SIGTERM');
        setTimeout(() => child.kill('SIGKILL'), 5000);
      }, STALL_MS);
    };

    stopOutputWatch = watchOutputActivity(process.env.ZWPB_SLUG, bumpStall);

    const onData = (chunk) => {
      const text = chunk.toString();
      combined += text;
      if (CONNECTION_LOST_RE.test(text)) {
        hadConnectionLoss = true;
        if (!reconnectNoted) {
          reconnectNoted = true;
          console.error(RECONNECTING_NOTE);
        }
      }
      process.stdout.write(text);
      bumpStall();
    };

    child.stdout.on('data', onData);
    child.stderr.on('data', onData);

    const cleanup = () => {
      if (stallTimer) clearTimeout(stallTimer);
      stopOutputWatch();
    };

    child.on('error', (err) => {
      cleanup();
      resolve({ code: 1, hadConnectionLoss, error: err.message, combined });
    });

    child.on('close', (code) => {
      cleanup();
      resolve({
        code: code ?? 1,
        hadConnectionLoss: hadConnectionLoss || CONNECTION_LOST_RE.test(combined),
        combined
      });
    });

    try {
      child.stdin.write(prompt);
      child.stdin.end();
    } catch {
      /* headless agents may ignore stdin */
    }

    bumpStall();
  });
}

function resumePrompt(original, attempt) {
  if (attempt === 1) return original;
  const header = [
    'RESUME — previous composer run lost connection. Continue the same build.',
    'Check output/ files; finish or repair index.html, style.css, script.js.',
    'Do not re-run Phase 0. Keep archetype section classes exactly as specified.',
    ''
  ].join('\n');
  return `${header}${original}`;
}

async function main() {
  const originalPrompt = await readStdin();
  if (!originalPrompt) {
    console.error('composer-runner: empty prompt on stdin');
    process.exit(1);
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (attempt > 1) {
      console.error(
        `[composer-runner] Retry ${attempt}/${MAX_ATTEMPTS} after connection loss or failure…`
      );
      await sleep(RETRY_PAUSE_MS);
    }

    const prompt = resumePrompt(originalPrompt, attempt);
    const result = await runAgent(prompt, attempt);

    if (result.error) {
      console.error(`[composer-runner] spawn error: ${result.error}`);
    }

    if (result.code === 0) {
      process.exit(0);
    }

    const retryable = result.hadConnectionLoss || result.code !== 0;
    if (!retryable || attempt === MAX_ATTEMPTS) {
      process.exit(result.code || 1);
    }
  }
}

main().catch((err) => {
  console.error(`composer-runner fatal: ${err.message}`);
  process.exit(1);
});
