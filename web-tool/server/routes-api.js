import path from 'node:path';
import fs from 'node:fs';
import express from 'express';
import { config } from './config.js';
import { requireAuth } from './auth-zoho.js';
import { Runs, RunEvents, Revisions, Approvals } from './store.js';
import { subscribe } from './sse.js';
import { startRun, reviseRun, startRunFromDocx } from './orchestrator.js';
import { parseMultipart } from './multipart.js';
import { extractDocx } from '../../z_workflow/scripts/extract-docx.mjs';

const OUTPUT_ROOT = path.join(config.pipelineRoot, 'output');

function isWriterUrl(url) {
  try {
    const u = new URL(url);
    return /(^|\.)writer\.zoho\.(com|in|eu|com\.au|jp)$/i.test(u.hostname);
  } catch {
    return false;
  }
}

function ownsRun(req, run) {
  return run && req.user && run.user_id === req.user.id;
}

export function registerApiRoutes(app) {
  const api = express.Router();
  api.use(requireAuth);

  // ── New build ────────────────────────────────────────────────
  api.post('/runs', (req, res) => {
    const { writer_doc_url, trusted_brands, template_id } = req.body || {};
    if (!writer_doc_url || !isWriterUrl(writer_doc_url)) {
      return res.status(400).json({ error: 'invalid_writer_url', message: 'Provide a writer.zoho.* document URL.' });
    }
    const run = Runs.create({ user_id: req.user.id, writer_doc_url, trusted_brands: trusted_brands === true, template_id: template_id || null });
    RunEvents.append(run.id, 'system', 'run_created', { writer_doc_url, trusted_brands: run.trusted_brands, template_id: run.template_id });
    // Kick off async; console streams via SSE.
    setImmediate(() => startRun(run.id));
    res.status(201).json({ run });
  });

  // ── List my runs (history preview) ───────────────────────────
  api.get('/runs', (req, res) => {
    res.json({ runs: Runs.listByUser(req.user.id) });
  });

  // ── Single run + full transcript ─────────────────────────────
  api.get('/runs/:id', (req, res) => {
    const run = Runs.get(req.params.id);
    if (!ownsRun(req, run)) return res.status(404).json({ error: 'not_found' });
    res.json({
      run,
      events: RunEvents.listByRun(run.id),
      revisions: Revisions.listByRun(run.id),
      approval: Approvals.getByRun(run.id)
    });
  });

  // ── DOCX file upload build ───────────────────────────────
  // POST /api/runs/docx  multipart/form-data  field: "docx"
  // Optional text fields: trusted_brands ("true"), doc_title
  api.post('/runs/docx', async (req, res) => {
    try {
      const upload = await parseMultipart(req, { maxBytes: 52_428_800 });

      if (!upload.originalname.toLowerCase().endsWith('.docx')) {
        return res.status(400).json({ error: 'invalid_file_type', message: 'Only .docx files are accepted.' });
      }

      const trusted_brands = upload.fields?.trusted_brands === 'true';
      const template_id = upload.fields?.template_id || null;
      const docTitle = upload.fields?.doc_title || path.basename(upload.originalname, '.docx');

      // Write the uploaded buffer to a temp file for extraction
      const tmpDir = path.join(config.dataDir, 'docx-uploads');
      fs.mkdirSync(tmpDir, { recursive: true });
      const tmpDocx = path.join(tmpDir, `upload-${Date.now()}.docx`);
      fs.writeFileSync(tmpDocx, upload.buffer);

      // Create the run record (writer_doc_url is set to a docx:// pseudo-URI)
      const run = Runs.create({
        user_id: req.user.id,
        writer_doc_url: `docx://${upload.originalname}`,
        trusted_brands,
        template_id
      });
      RunEvents.append(run.id, 'system', 'run_created', {
        writer_doc_url: `docx://${upload.originalname}`,
        source: 'docx_upload',
        trusted_brands,
        template_id
      });

      // Extract DOCX in-process (fast, no browser) → briefs/<slug>.txt
      const briefsDir = path.join(config.pipelineRoot, 'z_workflow', 'briefs');
      fs.mkdirSync(briefsDir, { recursive: true });
      const provisional = `build-${Date.now().toString(36)}`;
      const briefPath = path.join(briefsDir, `${provisional}.txt`);

      let extractResult;
      try {
        extractResult = extractDocx(tmpDocx, briefPath, { title: docTitle });
      } catch (extractErr) {
        fs.unlinkSync(tmpDocx).catch?.(() => {});
        return res.status(422).json({ error: 'docx_extract_failed', message: extractErr.message });
      }

      // Clean up temp upload
      try { fs.unlinkSync(tmpDocx); } catch { /* ignore */ }

      Runs.update(run.id, { slug: provisional, page_title: docTitle });
      run.slug = provisional;
      run.page_title = docTitle;

      const sidecar = JSON.parse(
        fs.existsSync(extractResult.sidecarPath)
          ? fs.readFileSync(extractResult.sidecarPath, 'utf8')
          : '{}'
      );

      // Kick off async pipeline (skips browser extraction)
      setImmediate(() => startRunFromDocx(run.id, briefPath, sidecar));
      res.status(201).json({ run });

    } catch (e) {
      if (e.message?.includes('boundary') || e.message?.includes('multipart')) {
        return res.status(400).json({ error: 'bad_upload', message: 'Expected multipart/form-data with a "docx" file field.' });
      }
      console.error('DOCX upload error:', e);
      res.status(500).json({ error: 'upload_failed', message: e.message });
    }
  });

  // ── Live event stream (SSE) ──────────────────────────────────
  api.get('/runs/:id/stream', (req, res) => {
    const run = Runs.get(req.params.id);
    if (!ownsRun(req, run)) return res.status(404).end();
    subscribe(run.id, res);
    // Replay history so a late subscriber sees the whole run.
    for (const ev of RunEvents.listByRun(run.id)) {
      res.write(`event: ${ev.type}\ndata: ${JSON.stringify(ev)}\n\n`);
    }
  });

  // ── Accept ───────────────────────────────────────────────────
  api.post('/runs/:id/accept', (req, res) => {
    const run = Runs.get(req.params.id);
    if (!ownsRun(req, run)) return res.status(404).json({ error: 'not_found' });
    if (run.status !== 'awaiting_review') {
      return res.status(409).json({ error: 'not_awaiting_review', status: run.status });
    }
    Approvals.create({ run_id: run.id, approved_by: req.user.id });
    Runs.update(run.id, { status: 'approved', approved: true });
    // Reflect approval in the shared state.json (phase_6.approved = true).
    try {
      const stateFile = path.join(config.pipelineRoot, 'z_workflow', 'state.json');
      if (fs.existsSync(stateFile)) {
        const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
        if (state.page_slug === run.slug) {
          state.phase_6 = { ...(state.phase_6 || {}), approved: true };
          fs.writeFileSync(stateFile, JSON.stringify(state, null, 2) + '\n');
        }
      }
    } catch {
      /* best effort */
    }
    RunEvents.append(run.id, 'system', 'approved', { approved_by: req.user.email });
    // NOTE: promote is intentionally NOT triggered here (dev-team, later).
    res.json({ ok: true, run: Runs.get(run.id) });
  });

  // ── Revise (general or section) ──────────────────────────────
  api.post('/runs/:id/revise', (req, res) => {
    const run = Runs.get(req.params.id);
    if (!ownsRun(req, run)) return res.status(404).json({ error: 'not_found' });
    if (!['awaiting_review', 'approved'].includes(run.status)) {
      return res.status(409).json({ error: 'not_reviseable', status: run.status });
    }
    const { scope, section_name, instruction } = req.body || {};
    if (!['general', 'section'].includes(scope)) {
      return res.status(400).json({ error: 'invalid_scope' });
    }
    if (scope === 'section' && !section_name) {
      return res.status(400).json({ error: 'section_name_required' });
    }
    if (!instruction || !instruction.trim()) {
      return res.status(400).json({ error: 'instruction_required' });
    }
    const round = (run.revise_rounds || 0) + 1;
    const revision = Revisions.create({
      run_id: run.id, round, scope,
      section_name: scope === 'section' ? section_name : null,
      instruction: instruction.trim()
    });
    RunEvents.append(run.id, 'system', 'revise_requested', revision);
    setImmediate(() => reviseRun(run.id, revision));
    res.status(202).json({ ok: true, revision });
  });

  app.use('/api', api);

  // ── Authenticated static preview of generated pages ──────────
  app.get('/preview/:slug/*', requireAuth, (req, res) => {
    const slug = req.params.slug;
    const owns = Runs.listByUser(req.user.id).some((r) => r.slug === slug);
    if (!owns) return res.status(403).send('Forbidden');

    const rel = req.params[0] || 'index.html';
    const target = path.normalize(path.join(OUTPUT_ROOT, slug, rel));
    if (!target.startsWith(path.join(OUTPUT_ROOT, slug))) {
      return res.status(400).send('Bad path');
    }
    if (!fs.existsSync(target)) return res.status(404).send('Not found');
    res.sendFile(target);
  });

  // Serve the shared team CSS referenced by generated pages (../../source/...).
  app.use('/source', requireAuth, express.static(path.join(config.pipelineRoot, 'source')));
}
