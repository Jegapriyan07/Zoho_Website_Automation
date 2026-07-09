import crypto from 'node:crypto';
import { config } from './config.js';

// ── Token encryption at rest (AES-256-GCM) ─────────────────────
// Zoho access/refresh tokens are encrypted before they touch disk and are
// never exposed to the frontend.

function encKey() {
  const raw = config.tokenEncKey;
  if (raw && /^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, 'hex');
  }
  // Derive a stable 32-byte key from whatever was provided (dev fallback).
  return crypto.createHash('sha256').update(raw || 'dev-insecure-enc-key').digest();
}

export function encrypt(plainObj) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encKey(), iv);
  const data = Buffer.concat([
    cipher.update(JSON.stringify(plainObj), 'utf8'),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}.${tag.toString('base64')}.${data.toString('base64')}`;
}

export function decrypt(payload) {
  if (!payload) return null;
  try {
    const [ivB64, tagB64, dataB64] = String(payload).split('.');
    const decipher = crypto.createDecipheriv('aes-256-gcm', encKey(), Buffer.from(ivB64, 'base64'));
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
    const out = Buffer.concat([
      decipher.update(Buffer.from(dataB64, 'base64')),
      decipher.final()
    ]);
    return JSON.parse(out.toString('utf8'));
  } catch {
    return null;
  }
}

// ── Signed session cookie (stateless HMAC) ─────────────────────

export function signSession(payloadObj) {
  const body = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
  const sig = crypto
    .createHmac('sha256', config.sessionSecret)
    .update(body)
    .digest('base64url');
  return `${body}.${sig}`;
}

export function verifySession(cookieVal) {
  if (!cookieVal) return null;
  const [body, sig] = String(cookieVal).split('.');
  if (!body || !sig) return null;
  const expected = crypto
    .createHmac('sha256', config.sessionSecret)
    .update(body)
    .digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

export function randomToken(bytes = 24) {
  return crypto.randomBytes(bytes).toString('base64url');
}
