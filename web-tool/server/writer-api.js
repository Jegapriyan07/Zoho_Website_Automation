import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { extractDocx } from '../../z_workflow/scripts/extract-docx.mjs';
import { getValidAccessToken, getUserTokens } from './auth-zoho.js';
import { normalizeApiDomain, parseWriterDocumentUrl } from './writer-url.js';

function pickApisBase(parsed, tokens) {
  const fromToken = normalizeApiDomain(tokens?.api_domain);
  if (fromToken) return fromToken;
  return parsed.apisBase;
}

async function fetchDocumentMeta(apisBase, documentId, accessToken) {
  const url = `${apisBase}/writer/api/v1/documents/${encodeURIComponent(documentId)}`;
  const r = await fetch(url, {
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` }
  });
  if (!r.ok) {
    const body = await r.text().catch(() => '');
    const err = new Error(`Writer document metadata failed (${r.status})`);
    err.status = r.status;
    err.body = body.slice(0, 400);
    throw err;
  }
  const data = await r.json();
  return data?.documents || data?.document || data;
}

async function downloadDocumentDocx(apisBase, documentId, accessToken) {
  const url = new URL(`${apisBase}/writer/api/v1/download/${encodeURIComponent(documentId)}`);
  url.searchParams.set('format', 'docx');

  const r = await fetch(url, {
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` }
  });

  if (!r.ok) {
    const body = await r.text().catch(() => '');
    const err = new Error(`Writer download failed (${r.status})`);
    err.status = r.status;
    err.body = body.slice(0, 400);
    throw err;
  }

  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 512) {
    throw new Error('Writer download returned an empty or invalid file');
  }
  return buf;
}

function patchSidecarForWriterApi(sidecarPath, { sourceUrl, documentId, docTitle }) {
  if (!fs.existsSync(sidecarPath)) return null;
  const sidecar = JSON.parse(fs.readFileSync(sidecarPath, 'utf8'));
  sidecar.extracted_at = new Date().toISOString();
  sidecar.source_url = sourceUrl;
  sidecar.extraction_method = 'writer_api';
  sidecar.document_id = documentId;
  sidecar.writer_doc_title = docTitle || sidecar.writer_doc_title || null;
  sidecar.quality = sidecar.quality || { warnings: [], errors: [] };
  fs.writeFileSync(sidecarPath, JSON.stringify(sidecar, null, 2) + '\n');
  return sidecar;
}

/**
 * Fast Writer extraction via Zoho OAuth + download API (same path as DOCX upload).
 * Returns null when API auth is unavailable; throws on hard failures after API was attempted.
 */
export async function extractWriterViaApi({ user, writerUrl, briefPath }) {
  const parsed = parseWriterDocumentUrl(writerUrl);
  if (!parsed) throw new Error('Invalid Writer document URL');

  const tokens = getUserTokens(user);
  if (!tokens || tokens.dev) return null;

  const accessToken = await getValidAccessToken(user);
  if (!accessToken) return null;

  const apisBase = pickApisBase(parsed, tokens);
  let docTitle = null;

  try {
    const meta = await fetchDocumentMeta(apisBase, parsed.documentId, accessToken);
    docTitle = meta?.document_name || meta?.name || null;
  } catch (metaErr) {
    if (metaErr.status === 401 || metaErr.status === 403) {
      const err = new Error('Writer API access denied — re-sign in to grant Writer permissions');
      err.code = 'writer_api_auth';
      throw err;
    }
    // Metadata is optional — download may still work.
  }

  const docxBuffer = await downloadDocumentDocx(apisBase, parsed.documentId, accessToken);

  const tmpDir = path.join(os.tmpdir(), 'zwpb-writer-api');
  fs.mkdirSync(tmpDir, { recursive: true });
  const tmpDocx = path.join(tmpDir, `writer-${parsed.documentId}-${Date.now()}.docx`);

  try {
    fs.writeFileSync(tmpDocx, docxBuffer);
    const extractResult = extractDocx(tmpDocx, briefPath, { title: docTitle || undefined });
    const sidecar = patchSidecarForWriterApi(extractResult.sidecarPath, {
      sourceUrl: writerUrl,
      documentId: parsed.documentId,
      docTitle
    });

    return {
      briefText: extractResult.text,
      sidecar,
      method: 'writer_api',
      docTitle
    };
  } finally {
    try { fs.unlinkSync(tmpDocx); } catch { /* ignore */ }
  }
}

/** Whether the signed-in user can use OAuth Writer API extraction. */
export function canUseWriterApi(user) {
  const tokens = getUserTokens(user);
  return Boolean(tokens?.access_token && !tokens.dev);
}

/** Detailed API link status for UI. */
export function getWriterApiStatus(user) {
  const tokens = getUserTokens(user);
  if (!tokens) return { api_ready: false, api_status: 'missing' };
  if (tokens.dev) return { api_ready: false, api_status: 'dev' };
  if (tokens.access_token) return { api_ready: true, api_status: 'ready' };
  return { api_ready: false, api_status: 'invalid' };
}
