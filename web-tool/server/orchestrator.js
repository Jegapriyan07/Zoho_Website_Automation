import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { config } from './config.js';
import { Runs, RunEvents, Users } from './store.js';
import { publish } from './sse.js';
import { runComposer, outputDirFor } from './composer.js';

// ── Phase orchestrator ─────────────────────────────────────────
// Drives the existing pipeline scripts in the documented order and streams
// every phase to the Live Agent Console via SSE + persists RunEvents.
//   extract-writer.mjs  ->  validate:brief  ->  match  ->  compose(agent)  ->  validate:output
// Hard stops use the workflow's own failure vocabulary.

const BRIEFS_DIR = path.join(config.pipelineRoot, 'z_workflow', 'briefs');
const STATE_FILE = path.join(config.pipelineRoot, 'z_workflow', 'state.json');
const SCRIPTS = path.join(config.pipelineRoot, 'z_workflow', 'scripts');

function emit(run, phase, type, payload = {}) {
  const ev = RunEvents.append(run.id, phase, type, payload);
  publish(run.id, ev);
  return ev;
}

function log(run, phase, message) {
  return emit(run, phase, 'log', { message: String(message).replace(/\s+$/, '') });
}

function setStatus(run, status, extra = {}) {
  const updated = Runs.update(run.id, { status, ...extra });
  publish(run.id, {
    type: 'status',
    run_id: run.id,
    status,
    payload: { status, ...extra },
    created_at: new Date().toISOString()
  });
  return updated;
}

function hardStop(run, phase, reason, message) {
  emit(run, phase, 'hard_stop', { reason, message });
  setStatus(run, 'failed', { failed_reason: reason });
  emit(run, 'system', 'run_failed', { reason, message });
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function stripLandingSuffix(text) {
  return String(text || '')
    .replace(/\u200b/g, '')
    .replace(/\s*[-–—|]\s*landing\s*page.*$/i, '')
    .replace(/\s+landing\s*page\s*$/i, '')
    .trim();
}

/** Derive a human page title + folder slug from Writer doc name / brief header. */
function derivePageTitleAndSlug(briefText, writerDocTitle) {
  const candidates = [
    writerDocTitle,
    briefText.split('\n').find((l) => l.trim())?.trim(),
    briefText.match(/H1:\s*(.+)/i)?.[1]?.trim()
  ].filter(Boolean).map(stripLandingSuffix);

  for (const raw of candidates) {
    const slug = slugify(raw);
    if (slug.length >= 3) {
      return { pageTitle: raw.slice(0, 140), baseSlug: slug };
    }
  }
  return { pageTitle: null, baseSlug: null };
}

/** Pick a slug that does not collide with existing brief/output folders (adds -2, -3, …). */
function allocateUniqueSlug(baseSlug, { briefsDir, outputRoot, exceptSlug = null } = {}) {
  if (!baseSlug) return null;
  let slug = baseSlug;
  let n = 2;
  while (n < 100) {
    const briefTaken =
      fs.existsSync(path.join(briefsDir, `${slug}.txt`)) && slug !== exceptSlug;
    const outputTaken =
      fs.existsSync(path.join(outputRoot, slug)) && slug !== exceptSlug;
    if (!briefTaken && !outputTaken) return slug;
    slug = `${baseSlug}-${n}`;
    n += 1;
  }
  return `${baseSlug}-${Date.now().toString(36)}`;
}

function renameBriefArtifacts(fromPath, toPath) {
  if (fromPath === toPath) return;
  fs.renameSync(fromPath, toPath);
  for (const ext of ['.extract.json', '.validation.json']) {
    const from = fromPath.replace(/\.txt$/, ext);
    const to = toPath.replace(/\.txt$/, ext);
    if (fs.existsSync(from)) fs.renameSync(from, to);
  }
}

function renameOutputDir(fromSlug, toSlug) {
  if (!fromSlug || !toSlug || fromSlug === toSlug) return;
  const fromDir = outputDirFor(fromSlug);
  const toDir = outputDirFor(toSlug);
  if (!fs.existsSync(fromDir) || fs.existsSync(toDir)) return;
  fs.renameSync(fromDir, toDir);
}

/** Spawn a node script under the pipeline root, streaming stdout/stderr. */
function runScript(run, phase, scriptFile, args, { onLine } = {}) {
  return new Promise((resolve) => {
    const scriptPath = path.join(SCRIPTS, scriptFile);
    // Force a persistent Puppeteer cache dir so headless Chrome is found even when
    // the launching environment injected an ephemeral/temp PUPPETEER_CACHE_DIR.
    const child = spawn(process.execPath, [scriptPath, ...args], {
      cwd: config.pipelineRoot,
      env: { ...process.env, PUPPETEER_CACHE_DIR: config.puppeteerCacheDir }
    });
    let out = '';
    let err = '';

    const handle = (chunk, isErr) => {
      const text = chunk.toString();
      if (isErr) err += text;
      else out += text;
      for (const line of text.split('\n')) {
        if (line.trim()) {
          log(run, phase, line);
          onLine?.(line);
        }
      }
    };

    child.stdout.on('data', (c) => handle(c, false));
    child.stderr.on('data', (c) => handle(c, true));
    child.on('error', (e) => resolve({ code: 1, out, err: err + e.message }));
    child.on('close', (code) => resolve({ code: code ?? 1, out, err }));
  });
}

function readJsonSafe(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

// ── Phase 0: extraction ────────────────────────────────────────

function isLoginWallOutput(combined) {
  return /Redirected to Zoho Accounts|sign in first/i.test(combined);
}

function isRetryableExtractFailure(combined) {
  return (
    isLoginWallOutput(combined) ||
    /Navigation timeout|timeout.*exceeded|Timed out waiting/i.test(combined)
  );
}

async function runExtractScript(run, { url, briefPath, profileDir, headed }) {
  const args = [
    '--url', url,
    '--out', briefPath,
    '--user-data-dir', profileDir,
    '--timeout', '240000',
    '--skip-validate',
    '--allow-partial'
  ];
  if (headed) args.push('--headed');
  return runScript(run, 0, 'extract-writer.mjs', args);
}

function isPartialExtraction(sidecar) {
  const thinPages = (sidecar?.per_page_lengths || []).filter((p) => p.len < 120);
  const charRatio =
    sidecar?.footer_chars && sidecar?.merged_length
      ? sidecar.merged_length / sidecar.footer_chars
      : 1;
  const extractionErrors = sidecar?.quality?.errors || [];
  return thinPages.length >= 3 || charRatio < 0.75 || extractionErrors.length > 0;
}

async function phase0Extract(run, user, briefPath) {
  emit(run, 0, 'phase_start', { title: 'Phase 0 — Acquire brief · Catalog · Match' });
  setStatus(run, 'extracting');
  log(run, 0, `Extracting Writer document: ${run.writer_doc_url}`);

  const profileDir = path.join(config.dataDir, 'chrome-profiles', user.id);
  fs.mkdirSync(profileDir, { recursive: true });

  // 1) Try headless first (fast path when session cookies are already on disk).
  let { code, out, err } = await runExtractScript(run, {
    url: run.writer_doc_url,
    briefPath,
    profileDir,
    headed: false
  });

  let combined = `${out}\n${err}`;

  // 2) Headless often hits Zoho login or navigation timeouts — retry with a
  //    visible Chrome window so the user can sign in without running a separate
  //    terminal command. This uses the SAME profile folder as the web tool.
  if (isRetryableExtractFailure(combined) || (code !== 0 && !fs.existsSync(briefPath))) {
    const reason = isLoginWallOutput(combined)
      ? 'Zoho login wall'
      : /timeout/i.test(combined)
        ? 'navigation timeout'
        : 'headless extraction failed';
    log(
      run, 0,
      `Headless extraction hit ${reason}. Opening Chrome — sign in to Zoho if prompted, then wait…`
    );
    emit(run, 0, 'login_prompt', {
      message:
        'Chrome is opening on this machine. Sign in to Zoho if prompted. ' +
        'The build continues automatically once the Writer document loads.'
    });

    ({ code, out, err } = await runExtractScript(run, {
      url: run.writer_doc_url,
      briefPath,
      profileDir,
      headed: true
    }));
    combined = `${out}\n${err}`;
  }

  if (isLoginWallOutput(combined)) {
    hardStop(
      run, 0, 'login_wall',
      'Zoho login wall hit during extraction. Sign-in timed out or was not completed in the Chrome window. Retry the build and finish Zoho sign-in when prompted.'
    );
    return null;
  }
  if (code !== 0 || !fs.existsSync(briefPath)) {
    hardStop(run, 0, 'extraction_failed', `Writer extraction failed.\n${err || out}`.trim());
    return null;
  }

  // 3) Section-reference blocks often hydrate only in a visible Chrome window.
  //    Retry once with --headed before failing the build.
  let sidecar = readJsonSafe(briefPath.replace(/\.txt$/, '.extract.json'));
  if (isPartialExtraction(sidecar)) {
    log(
      run, 0,
      'Partial extraction detected — reopening Chrome in headed mode for section-reference hydration…'
    );
    emit(run, 0, 'login_prompt', {
      message:
        'Extraction was incomplete. Chrome is reopening — keep the Writer tab in Edit mode until extraction finishes.'
    });

    ({ code, out, err } = await runExtractScript(run, {
      url: run.writer_doc_url,
      briefPath,
      profileDir,
      headed: true
    }));
    combined = `${out}\n${err}`;

    if (code !== 0 || !fs.existsSync(briefPath)) {
      hardStop(run, 0, 'extraction_failed', `Writer headed retry failed.\n${err || out}`.trim());
      return null;
    }
    sidecar = readJsonSafe(briefPath.replace(/\.txt$/, '.extract.json'));
  }

  const briefText = fs.readFileSync(briefPath, 'utf8');

  // Confidential-content hard stop.
  if (/\b(confidential|do not distribute|do not share|internal use only|nda)\b/i.test(briefText)) {
    hardStop(
      run, 0, 'confidential_content',
      'Confidential-content markers detected in the brief. Halting per workflow §3.1.'
    );
    return null;
  }

  const thinPages = (sidecar?.per_page_lengths || []).filter((p) => p.len < 120);
  const charRatio =
    sidecar?.footer_chars && sidecar?.merged_length
      ? sidecar.merged_length / sidecar.footer_chars
      : 1;
  const extractionErrors = sidecar?.quality?.errors || [];

  if (isPartialExtraction(sidecar)) {
    const thinList = thinPages.map((p) => p.page).join(', ') || 'none';
    hardStop(
      run, 0, 'partial_extraction',
      [
        'Writer extraction incomplete — lazy-loaded pages were not fully hydrated.',
        `Extracted ${sidecar?.merged_length ?? '?'} chars vs Writer footer ${sidecar?.footer_chars ?? '?'}.`,
        thinPages.length ? `Thin/empty pages: ${thinList}.` : '',
        'Open the document in Edit mode (not read-only preview), sign in if prompted, then retry the build.',
        extractionErrors.length ? extractionErrors.map((e) => `• ${e}`).join('\n') : ''
      ].filter(Boolean).join('\n')
    );
    return null;
  }

  emit(run, 0, 'extract_result', {
    pages: sidecar?.page_count ?? null,
    chars: sidecar?.merged_length ?? null,
    footer_chars: sidecar?.footer_chars ?? null,
    archetype_guess: sidecar?.archetype_guess ?? null
  });

  return { briefText, sidecar };
}

function finalizeRunSlug(run, briefPath, briefText, sidecar) {
  const outputRoot = path.join(config.pipelineRoot, 'output');
  const provisional = run.slug;
  const writerTitle = sidecar?.writer_doc_title || null;
  const { pageTitle, baseSlug } = derivePageTitleAndSlug(briefText, writerTitle);
  const finalSlug =
    allocateUniqueSlug(baseSlug, { briefsDir: BRIEFS_DIR, outputRoot, exceptSlug: provisional }) ||
    provisional;

  if (finalSlug !== provisional) {
    const finalPath = path.join(BRIEFS_DIR, `${finalSlug}.txt`);
    renameBriefArtifacts(briefPath, finalPath);
    renameOutputDir(provisional, finalSlug);
    briefPath = finalPath;
    run.slug = finalSlug;
  }

  Runs.update(run.id, {
    slug: run.slug,
    page_title: pageTitle || run.page_title || run.slug
  });
  run.page_title = pageTitle || run.page_title || run.slug;

  return briefPath;
}

// ── Phase 0: validate brief ────────────────────────────────────

async function phase0ValidateBrief(run, briefPath) {
  log(run, 0, 'Running validate:brief …');
  const { code } = await runScript(run, 0, 'validate-brief.mjs', ['--file', briefPath]);
  const report = readJsonSafe(briefPath.replace(/\.txt$/, '.validation.json'));
  if (code !== 0) {
    hardStop(
      run, 0, 'validate_brief_failed',
      `validate:brief failed.${report?.errors?.length ? '\n- ' + report.errors.join('\n- ') : ''}`
    );
    return null;
  }
  emit(run, 0, 'validate_brief_ok', {
    archetype: report?.archetype || null,
    inventory: report?.inventory || null
  });
  return report;
}

// ── Phase 0: match ─────────────────────────────────────────────

async function phase0Match(run, briefText) {
  setStatus(run, 'matching');
  log(run, 0, 'Running similarity match …');
  const keywords = briefText.split('\n').slice(0, 6).join(' ').slice(0, 220);
  const { out } = await runScript(run, 0, 'match-sites.mjs', ['--brief', keywords]);

  // Parse "  #1  Executive-Dashboards  8.5/10 …"
  const topMatch = out.match(/#1\s+(.+?)\s+([\d.]+)\/10/);
  const primary = topMatch ? topMatch[1].trim() : null;
  const ranked = [...out.matchAll(/#(\d)\s+(.+?)\s+([\d.]+)\/10/g)].map((m) => ({
    rank: Number(m[1]),
    site: m[2].trim(),
    score: Number(m[3])
  }));
  emit(run, 0, 'match_result', { primary_source: primary, ranked });
  return primary;
}

// ── Seed state.json for the composer/agent ─────────────────────

function seedState(run, briefPath, validation, primarySource) {
  const rel = path.relative(config.pipelineRoot, briefPath).replace(/\\/g, '/');
  const state = readJsonSafe(STATE_FILE) || {};
  const seeded = {
    ...state,
    run_id: run.id,
    page_slug: run.slug,
    writer_url: run.writer_doc_url,
    writer_brief: {
      ...(state.writer_brief || {}),
      source_url: run.writer_doc_url,
      raw_content_file: rel,
      page_title: run.page_title,
      archetype: validation?.archetype || null,
      inventory: validation?.inventory || null
    },
    similarity: {
      structure_mode: 'compose',
      archetype: validation?.archetype || null,
      primary_source: primarySource || null,
      source_map: state.similarity?.source_map || []
    },
    phase_6: {
      ...(state.phase_6 || {}),
      output_path: `output/${run.slug}/`,
      approved: false,
      revise_rounds: run.revise_rounds || 0
    }
  };
  fs.writeFileSync(STATE_FILE, JSON.stringify(seeded, null, 2) + '\n');
}

// ── Phase 1/2/6: compose (agent) ───────────────────────────────

async function composeAndReport(run, briefPath, revise) {
  emit(run, 1, 'phase_start', { title: 'Phase 1 — Design tokens' });
  setStatus(run, 'tokens');
  emit(run, 2, 'phase_start', { title: 'Phase 2 — Page blueprint' });
  setStatus(run, 'blueprint');
  emit(run, 6, 'phase_start', { title: 'Phase 6 — Production build' });
  setStatus(run, 'building');

  const state = readJsonSafe(STATE_FILE) || {};
  const archetypeId = state.writer_brief?.archetype || state.similarity?.archetype || null;
  let composite = null;
  if (archetypeId) {
    try {
      const { composites } = await import('../../z_workflow/scripts/composite-utils.mjs').then((m) => m.loadComposites());
      composite = composites[archetypeId] || null;
    } catch {
      composite = null;
    }
  }

  const result = await runComposer({
    slug: run.slug,
    briefFile: path.relative(config.pipelineRoot, briefPath).replace(/\\/g, '/'),
    revise,
    archetype: archetypeId,
    composite,
    onLog: (line) => {
      for (const l of String(line).split('\n')) if (l.trim()) log(run, 6, l);
    }
  });

  if (!result.ok) {
    hardStop(
      run, 6,
      result.manual ? 'manual_compose_required' : 'compose_failed',
      result.reason
    );
    return false;
  }

  // Report Phase 1 tokens + Phase 2 blueprint from state.json if the agent wrote them.
  if (state.phase_1?.design_tokens) {
    emit(run, 1, 'design_tokens', { tokens: state.phase_1.design_tokens });
  }
  const blueprint = state.phase_2?.webpage_blueprint || state.similarity?.source_map || [];
  emit(run, 2, 'blueprint', {
    sections: Array.isArray(blueprint)
      ? blueprint.map((s) => s.section || s.brief_section || s.source_section_id || s.class).filter(Boolean)
      : Object.keys(blueprint)
  });

  // Phase 6 file report.
  const dir = outputDirFor(run.slug);
  const files = ['index.html', 'style.css', 'script.js']
    .filter((f) => fs.existsSync(path.join(dir, f)))
    .map((f) => ({ file: f, bytes: fs.statSync(path.join(dir, f)).size }));
  emit(run, 6, 'files_written', { output_path: `output/${run.slug}/`, files });
  return true;
}

// ── Validation + handoff ───────────────────────────────────────

async function phaseValidateOutput(run) {
  setStatus(run, 'validating');
  emit(run, 'validation', 'phase_start', { title: 'Validation — validate:output' });

  log(run, 'validation', 'Running output auto-fix for archetype section classes…');
  const { out: fixOut } = await runScript(run, 'validation', 'fix-output-archetype.mjs', [
    '--slug', run.slug, '--no-validate'
  ]);
  const fixLines = String(fixOut).split('\n').filter((l) => /^\s*✓/.test(l));
  if (fixLines.length) {
    log(run, 'validation', 'Auto-fixed output before validation:');
    fixLines.forEach((l) => log(run, 'validation', l.trim()));
  }

  const { code } = await runScript(run, 'validation', 'validate-output.mjs', ['--slug', run.slug]);
  const report = readJsonSafe(path.join(outputDirFor(run.slug), 'validation.json'));
  if (code !== 0) {
    hardStop(
      run, 'validation', 'validate_output_failed',
      `validate:output failed.${report?.errors?.length ? '\n- ' + report.errors.join('\n- ') : ''}`
    );
    return { ok: false, report };
  }
  emit(run, 'validation', 'validate_output_ok', { report });
  return { ok: true, report };
}

function finishAwaitingReview(run) {
  const previewUrl = `/preview/${run.slug}/index.html`;
  Runs.update(run.id, { status: 'awaiting_review', output_path: `output/${run.slug}/` });
  emit(run, 6, 'output', {
    preview_url: previewUrl,
    output_path: `output/${run.slug}/`,
    open_in_new_tab: true
  });
  setStatus(run, 'awaiting_review', { output_path: `output/${run.slug}/` });
  emit(run, 'system', 'awaiting_review', { preview_url: previewUrl });
}

// ── Public API ─────────────────────────────────────────────────

export async function startRun(runId) {
  const run = Runs.get(runId);
  if (!run) return;
  const user = Users.get(run.user_id);

  try {
    // Provisional slug -> refine from brief title after extraction.
    const provisional = run.slug || `build-${Date.now().toString(36)}`;
    Runs.update(run.id, { slug: provisional });
    run.slug = provisional;

    if (!fs.existsSync(BRIEFS_DIR)) fs.mkdirSync(BRIEFS_DIR, { recursive: true });
    let briefPath = path.join(BRIEFS_DIR, `${provisional}.txt`);

    const extracted = await phase0Extract(run, user, briefPath);
    if (!extracted) return;

    const sidecar = readJsonSafe(briefPath.replace(/\.txt$/, '.extract.json'));
    briefPath = finalizeRunSlug(run, briefPath, extracted.briefText, sidecar);

    const validation = await phase0ValidateBrief(run, briefPath);
    if (!validation) return;

    const primary = await phase0Match(run, extracted.briefText);
    seedState(run, briefPath, validation, primary);
    emit(run, 0, 'phase_done', { title: 'Phase 0 complete' });

    const composed = await composeAndReport(run, briefPath, null);
    if (!composed) return;

    let validationResult = await phaseValidateOutput(run);
    if (!validationResult.ok && validationResult.report?.errors?.length) {
      log(run, 'validation', 'Validation failed — attempting one automatic revise…');
      const instruction = [
        'Fix these validate:output errors without changing unrelated sections:',
        ...validationResult.report.errors.map((e) => `- ${e}`)
      ].join('\n');
      const reComposed = await composeAndReport(run, briefPath, {
        round: 1,
        scope: 'general',
        instruction
      });
      if (reComposed) {
        validationResult = await phaseValidateOutput(run);
      }
    }
    if (!validationResult.ok) return;

    finishAwaitingReview(run);
  } catch (e) {
    hardStop(run, 'system', 'extraction_failed', `Unexpected orchestration error: ${e.message}`);
  }
}

export async function reviseRun(runId, revision) {
  const run = Runs.get(runId);
  if (!run) return;
  setStatus(run, 'revising');
  emit(run, 6, 'revise_start', {
    round: revision.round,
    scope: revision.scope,
    section_name: revision.section_name,
    instruction: revision.instruction
  });

  const briefPath = path.join(BRIEFS_DIR, `${run.slug}.txt`);
  if (!fs.existsSync(briefPath)) {
    hardStop(run, 6, 'compose_failed', `Brief file missing for revise: ${briefPath}`);
    return;
  }

  const composed = await composeAndReport(run, briefPath, revision);
  if (!composed) return;

  const validationResult = await phaseValidateOutput(run);
  if (!validationResult.ok) return;

  Runs.update(run.id, { revise_rounds: revision.round });
  finishAwaitingReview(run);
}
