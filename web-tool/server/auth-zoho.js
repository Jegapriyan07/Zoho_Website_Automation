import { config, redirectUri, zohoConfigured, isDevAuthAllowed } from './config.js';
import { encrypt, decrypt, signSession, verifySession, randomToken } from './crypto.js';
import { Users } from './store.js';

const SESSION_COOKIE = 'zwpb_session';
const OAUTH_STATE_COOKIE = 'zwpb_oauth_state';

function setCookie(res, name, value, { maxAge, httpOnly = true } = {}) {
  const parts = [
    `${name}=${value}`,
    'Path=/',
    'SameSite=Lax'
  ];
  if (httpOnly) parts.push('HttpOnly');
  if (config.appBaseUrl.startsWith('https://')) parts.push('Secure');
  if (maxAge != null) parts.push(`Max-Age=${maxAge}`);
  res.append('Set-Cookie', parts.join('; '));
}

function clearCookie(res, name) {
  res.append('Set-Cookie', `${name}=; Path=/; Max-Age=0; SameSite=Lax`);
}

function readCookies(req) {
  const header = req.headers.cookie || '';
  const out = {};
  header.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx < 0) return;
    out[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim();
  });
  return out;
}

function establishSession(res, user) {
  const token = signSession({ uid: user.id, zoho: user.zoho_user_id, iat: Date.now() });
  setCookie(res, SESSION_COOKIE, token, { maxAge: 60 * 60 * 12 }); // 12h app session
}

// ── Middleware ─────────────────────────────────────────────────

export function loadUser(req, res, next) {
  const cookies = readCookies(req);
  const session = verifySession(cookies[SESSION_COOKIE]);
  req.session = session;
  req.user = session ? Users.get(session.uid) : null;
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'auth_required' });
  }
  next();
}

// ── Zoho token helpers ─────────────────────────────────────────

export function getUserTokens(user) {
  return decrypt(user?.tokens_enc) || null;
}

async function exchangeCodeForTokens(code) {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: config.zoho.clientId,
    client_secret: config.zoho.clientSecret,
    redirect_uri: redirectUri,
    code
  });
  const r = await fetch(`${config.zoho.accountsBase}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });
  const data = await r.json();
  if (data.error) throw new Error(`Zoho token exchange failed: ${data.error}`);
  return data;
}

export async function refreshTokens(user) {
  const tokens = getUserTokens(user);
  if (!tokens?.refresh_token) return null;
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: config.zoho.clientId,
    client_secret: config.zoho.clientSecret,
    refresh_token: tokens.refresh_token
  });
  const r = await fetch(`${config.zoho.accountsBase}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });
  const data = await r.json();
  if (data.error) throw new Error(`Zoho token refresh failed: ${data.error}`);
  const merged = {
    ...tokens,
    access_token: data.access_token,
    expires_at: Date.now() + (data.expires_in || 3600) * 1000
  };
  Users.setTokens(user.id, encrypt(merged));
  return merged;
}

/** Return a valid access token, refreshing silently if near expiry. */
export async function getValidAccessToken(user) {
  const tokens = getUserTokens(user);
  if (!tokens) return null;
  if (tokens.expires_at && tokens.expires_at - Date.now() < 120000) {
    const refreshed = await refreshTokens(user).catch(() => null);
    return refreshed?.access_token || null;
  }
  return tokens.access_token || null;
}

async function fetchZohoProfile(accessToken) {
  try {
    const r = await fetch(`${config.zoho.accountsBase}/oauth/user/info`, {
      headers: { Authorization: `Zoho-oauthtoken ${accessToken}` }
    });
    if (!r.ok) return {};
    return await r.json();
  } catch {
    return {};
  }
}

// ── Routes ─────────────────────────────────────────────────────

export function registerAuthRoutes(app) {
  app.get('/auth/status', (req, res) => {
    res.json({
      authenticated: Boolean(req.user),
      zoho_configured: zohoConfigured(),
      dev_login: isDevAuthAllowed(),
      user: req.user
        ? { id: req.user.id, email: req.user.email, display_name: req.user.display_name }
        : null
    });
  });

  app.get('/auth/zoho/login', (req, res) => {
    if (!zohoConfigured()) {
      return res.status(400).send('Zoho OAuth is not configured. Set ZOHO_CLIENT_ID / ZOHO_CLIENT_SECRET in .env.');
    }
    const state = randomToken(16);
    setCookie(res, OAUTH_STATE_COOKIE, state, { maxAge: 600 });
    const url = new URL(`${config.zoho.accountsBase}/oauth/v2/auth`);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', config.zoho.clientId);
    url.searchParams.set('scope', config.zoho.scope);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('access_type', 'offline');
    url.searchParams.set('prompt', 'consent');
    url.searchParams.set('state', state);
    res.redirect(url.toString());
  });

  app.get('/auth/zoho/callback', async (req, res) => {
    try {
      const { code, state, error } = req.query;
      if (error) return res.status(400).send(`Zoho auth error: ${error}`);
      const cookies = readCookies(req);
      if (!state || state !== cookies[OAUTH_STATE_COOKIE]) {
        return res.status(400).send('Invalid OAuth state.');
      }
      clearCookie(res, OAUTH_STATE_COOKIE);

      const tokenResp = await exchangeCodeForTokens(code);
      const tokens = {
        access_token: tokenResp.access_token,
        refresh_token: tokenResp.refresh_token,
        expires_at: Date.now() + (tokenResp.expires_in || 3600) * 1000,
        api_domain: tokenResp.api_domain || null
      };

      const profile = await fetchZohoProfile(tokens.access_token);
      const zohoUserId = profile.ZUID || profile.sub || profile.email || `zoho:${randomToken(6)}`;
      const email = profile.Email || profile.email || '';
      const displayName = profile.Display_Name || profile.name || email || String(zohoUserId);

      const user = Users.upsertByZohoId({
        zoho_user_id: String(zohoUserId),
        email,
        display_name: displayName,
        tokens_enc: encrypt(tokens)
      });

      establishSession(res, user);
      res.redirect('/');
    } catch (e) {
      res.status(500).send(`Zoho callback failed: ${e.message}`);
    }
  });

  // Local dev login — only when Zoho is unconfigured on localhost.
  app.post('/auth/dev-login', (req, res) => {
    if (!isDevAuthAllowed()) {
      return res.status(403).json({ error: 'dev_login_disabled' });
    }
    const email = (req.body?.email || 'dev@local').toString();
    const user = Users.upsertByZohoId({
      zoho_user_id: `dev:${email}`,
      email,
      display_name: email,
      tokens_enc: encrypt({ access_token: 'dev-no-token', dev: true })
    });
    establishSession(res, user);
    res.json({ ok: true, user: { id: user.id, email: user.email } });
  });

  app.post('/auth/logout', (req, res) => {
    clearCookie(res, SESSION_COOKIE);
    res.json({ ok: true });
  });
}
