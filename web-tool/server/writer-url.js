/**
 * Parse Zoho Writer document URLs and map data-centres to API hosts.
 */

const WRITER_HOST_RE = /(^|\.)writer\.zoho\.(com|in|eu|com\.au|jp)$/i;

const DC_TO_APIS = {
  com: 'https://www.zohoapis.com',
  in: 'https://www.zohoapis.in',
  eu: 'https://www.zohoapis.eu',
  'com.au': 'https://www.zohoapis.com.au',
  jp: 'https://www.zohoapis.jp'
};

/** @returns {{ documentId: string, writerHost: string, dc: string, apisBase: string } | null} */
export function parseWriterDocumentUrl(url) {
  let u;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (!WRITER_HOST_RE.test(u.hostname)) return null;

  const parts = u.pathname.split('/').filter(Boolean);
  const openIdx = parts.indexOf('open');
  const documentId = openIdx >= 0 ? parts[openIdx + 1] : parts[parts.length - 1];
  if (!documentId || documentId.length < 8) return null;

  const dcMatch = u.hostname.match(/writer\.zoho\.(com|in|eu|com\.au|jp)$/i);
  const dc = (dcMatch?.[1] || 'com').toLowerCase();

  return {
    documentId,
    writerHost: u.hostname,
    dc,
    apisBase: DC_TO_APIS[dc] || DC_TO_APIS.com
  };
}

/** Normalize Zoho OAuth api_domain to https://www.zohoapis.* base. */
export function normalizeApiDomain(apiDomain) {
  if (!apiDomain) return null;
  const raw = String(apiDomain).replace(/\/$/, '');
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

export function isWriterUrl(url) {
  return Boolean(parseWriterDocumentUrl(url));
}
