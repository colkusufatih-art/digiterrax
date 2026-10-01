import crypto from 'node:crypto';
import { config } from './config.js';
import { sessions, users, loginFailures } from './db.js';

export const SESSION_COOKIE = 'dt_session';
export const LOGIN_CSRF_COOKIE = 'dt_login_csrf';

const IDLE_MS = config.sessionIdleMinutes * 60 * 1000;
const MAX_MS = config.sessionMaxHours * 60 * 60 * 1000;
const sha256 = v => crypto.createHash('sha256').update(v).digest('hex');
const token = (bytes = 32) => crypto.randomBytes(bytes).toString('base64url');

export function parseCookies(header = '') {
  const out = {};
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    if (k) out[k] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

const cookieBase = { httpOnly: true, secure: config.cookieSecure, path: '/portal' };

export function startSession(res, userId) {
  const id = token(32);
  const now = Date.now();
  sessions.insert({ idHash: sha256(id), userId, csrf: token(24), createdAt: now, lastSeenAt: now, expiresAt: now + MAX_MS });
  res.cookie(SESSION_COOKIE, id, { ...cookieBase, sameSite: 'lax', maxAge: MAX_MS });
  return sha256(id);
}

export function endSession(req, res) {
  if (req.sessionIdHash) sessions.remove(req.sessionIdHash);
  res.clearCookie(SESSION_COOKIE, { ...cookieBase, sameSite: 'lax' });
}

// Attaches req.user and req.session when the cookie belongs to a live session.
export function loadSession(req, res, next) {
  req.cookies = parseCookies(req.headers.cookie);
  const id = req.cookies[SESSION_COOKIE];
  if (!id) return next();
  const idHash = sha256(id);
  const s = sessions.get(idHash);
  const now = Date.now();
  if (!s || s.expires_at < now || s.last_seen_at + IDLE_MS < now) {
    if (s) sessions.remove(idHash);
    res.clearCookie(SESSION_COOKIE, { ...cookieBase, sameSite: 'lax' });
    return next();
  }
  const user = users.byId(s.user_id);
  if (!user || user.disabled) {
    sessions.remove(idHash);
    res.clearCookie(SESSION_COOKIE, { ...cookieBase, sameSite: 'lax' });
    return next();
  }
  if (now - s.last_seen_at > 60 * 1000) sessions.touch(idHash, now);
  req.session = s;
  req.sessionIdHash = idHash;
  req.user = user;
  next();
}

// Pre-sign-in CSRF protection for the login form: a double-submit cookie.
export function loginCsrf(req, res) {
  let t = req.cookies[LOGIN_CSRF_COOKIE];
  if (!t || t.length < 20) {
    t = token(24);
    res.cookie(LOGIN_CSRF_COOKIE, t, { ...cookieBase, sameSite: 'strict', path: '/portal/login' });
  }
  return t;
}

export function csrfOk(req) {
  const sent = String(req.body?._csrf || '');
  const expected = req.session ? req.session.csrf : req.cookies[LOGIN_CSRF_COOKIE];
  if (!sent || !expected || sent.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(sent), Buffer.from(expected));
}

export const requireUser = (req, res, next) => {
  if (!req.user) return res.redirect(303, '/portal/login?next=' + encodeURIComponent(req.originalUrl));
  if (req.user.must_change_password && !req.path.startsWith('/account/password') && req.path !== '/logout') {
    return res.redirect(303, '/portal/account/password');
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).render403();
  next();
};

// Sign-in throttling: per account and per client address, over a sliding window.
const WINDOW_MS = config.login.windowMinutes * 60 * 1000;
export function throttled(email, ip) {
  const since = Date.now() - WINDOW_MS;
  return loginFailures.countSince('acct:' + email.toLowerCase(), since) >= config.login.maxPerAccount ||
         loginFailures.countSince('ip:' + ip, since) >= config.login.maxPerIp;
}
export function recordFailure(email, ip) {
  loginFailures.add('acct:' + email.toLowerCase());
  loginFailures.add('ip:' + ip);
}
export function clearFailures(email) {
  loginFailures.clear('acct:' + email.toLowerCase());
}

// Only same-site relative paths inside the portal are valid redirect targets after sign-in.
export function safeNext(next) {
  const n = String(next || '');
  return /^\/portal(\/[^\s\\]*)?$/.test(n) && !n.startsWith('//') ? n : '/portal';
}
