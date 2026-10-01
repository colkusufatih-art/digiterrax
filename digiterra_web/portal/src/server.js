import path from 'node:path';
import express from 'express';
import { config } from './config.js';
import { users, sessions, loginFailures, audit } from './db.js';
import { hashPassword, verifyPassword, DUMMY_HASH, generateTempPassword, passwordProblem } from './passwords.js';
import {
  LOGIN_CSRF_COOKIE, loadSession, startSession, endSession, loginCsrf, csrfOk,
  requireUser, requireAdmin, throttled, recordFailure, clearFailures, safeNext
} from './auth.js';
import { SECTIONS, sectionBySlug, listDocuments, findDocument, recentDocuments, renderMarkdown } from './content.js';
import * as views from './views/pages.js';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', config.trustProxy);

/* ------------------------------------------------------------------ */
/* Public website                                                      */
/* ------------------------------------------------------------------ */
app.get('/', (req, res) => res.sendFile(path.join(config.siteDir, 'index.html'), { headers: { 'Cache-Control': 'no-cache' } }));
app.use('/assets', express.static(path.join(config.siteDir, 'assets'), { index: false, maxAge: '1h' }));
// Legal pages live in folders (datenschutzrichtlinie/index.html) so static hosting works too.
for (const page of ['datenschutzrichtlinie', 'nutzungsbedingungen', 'impressum']) {
  // Express matches /page and /page/ alike, so the trailing slash is checked on the raw URL.
  app.get(`/${page}`, (req, res) => {
    const [pathname, query = ''] = req.originalUrl.split('?');
    if (!pathname.endsWith('/')) return res.redirect(301, `/${page}/` + (query ? '?' + query : ''));
    res.sendFile(path.join(config.siteDir, page, 'index.html'), { headers: { 'Cache-Control': 'no-cache' } });
  });
}
app.get('/healthz', (req, res) => res.type('text').send('ok'));

/* ------------------------------------------------------------------ */
/* Client portal                                                       */
/* ------------------------------------------------------------------ */
const portal = express.Router();

const CSP = [
  "default-src 'self'", "script-src 'self'", "style-src 'self' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com", "img-src 'self' data:", "connect-src 'self'",
  "frame-ancestors 'none'", "form-action 'self'", "base-uri 'none'", "object-src 'none'"
].join('; ');

portal.use((req, res, next) => {
  res.set({
    'Content-Security-Policy': CSP,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'same-origin',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Cache-Control': 'no-store'
  });
  if (config.cookieSecure) res.set('Strict-Transport-Security', 'max-age=31536000');
  next();
});
portal.use('/static', express.static(config.publicDir, { index: false }));
portal.use(express.urlencoded({ extended: false, limit: '20kb' }));
portal.use(loadSession);

// Small response helpers and one-time messages that survive a redirect.
const flashes = new Map();
const setFlash = (req, flash) => { if (req.sessionIdHash) flashes.set(req.sessionIdHash, flash); };
const takeFlash = req => { const f = flashes.get(req.sessionIdHash); flashes.delete(req.sessionIdHash); return f; };
portal.use((req, res, next) => {
  res.page = (body, status = 200) => res.status(status).type('html').send(String(body));
  res.render403 = () => res.page(views.errorPage({
    status: 403, title: 'No access', message: 'Your account does not have access to this page.',
    user: req.user, csrf: req.session?.csrf
  }), 403);
  next();
});

// Browsers send Origin on form posts; a foreign origin is always refused.
portal.use((req, res, next) => {
  if (req.method !== 'POST') return next();
  const origin = req.get('origin');
  if (origin && origin !== 'null') {
    let host = '';
    try { host = new URL(origin).host; } catch { /* malformed */ }
    if (host !== req.host) return res.status(403).type('text').send('Cross-site request refused.');
  }
  next();
});

/* ---------- sign-in / sign-out ---------- */
portal.get('/login', (req, res) => {
  if (req.user) return res.redirect(303, req.user.must_change_password ? '/portal/account/password' : safeNext(req.query.next));
  res.page(views.loginPage({
    csrf: loginCsrf(req, res),
    next: safeNext(req.query.next),
    notice: req.query.out ? 'You have been signed out.' : ''
  }));
});

portal.post('/login', async (req, res) => {
  const email = String(req.body.email || '').trim().slice(0, 254);
  const password = String(req.body.password || '').slice(0, 200);
  const next = safeNext(req.body.next);
  const csrf = loginCsrf(req, res);
  const again = (error, status) => res.page(views.loginPage({ csrf, email, next, error }), status);

  if (!csrfOk(req)) return again('This form expired. Please try again.', 403);
  if (!email || !password) return again('Enter your email and password.', 400);
  if (throttled(email, req.ip)) {
    audit(null, 'login_throttled', email, req.ip);
    return again('Too many sign-in attempts. Wait 15 minutes, then try again.', 429);
  }

  const user = users.byEmail(email);
  const valid = await verifyPassword(password, user ? user.password_hash : DUMMY_HASH);
  if (!user || !valid || user.disabled) {
    recordFailure(email, req.ip);
    audit(user?.id, 'login_failed', email, req.ip);
    return again('Email or password is incorrect.', 401);
  }

  clearFailures(email);
  users.touchLogin(user.id);
  if (req.sessionIdHash) sessions.remove(req.sessionIdHash);
  startSession(res, user.id);
  res.clearCookie(LOGIN_CSRF_COOKIE, { path: '/portal/login', httpOnly: true, secure: config.cookieSecure, sameSite: 'strict' });
  audit(user.id, 'login', '', req.ip);
  res.redirect(303, user.must_change_password ? '/portal/account/password' : next);
});

portal.post('/logout', (req, res) => {
  if (req.user && csrfOk(req)) {
    audit(req.user.id, 'logout', '', req.ip);
    flashes.delete(req.sessionIdHash);
    endSession(req, res);
  }
  res.redirect(303, '/portal/login?out=1');
});

/* ---------- everything below needs a signed-in user ---------- */
portal.use(requireUser);
portal.use((req, res, next) => {
  if (req.method === 'POST' && !csrfOk(req)) {
    return res.page(views.errorPage({ status: 403, title: 'Form expired', message: 'Reload the page and try again.', user: req.user, csrf: req.session.csrf }), 403);
  }
  next();
});

const ctx = req => ({ user: req.user, csrf: req.session.csrf });

portal.get('/', (req, res) => {
  const counts = Object.fromEntries(SECTIONS.map(s => [s.slug, listDocuments(s.slug).length]));
  res.page(views.dashboardPage({ ...ctx(req), counts, recent: recentDocuments(6) }));
});

portal.get('/docs/:section', (req, res, next) => {
  const section = sectionBySlug(req.params.section);
  if (!section) return next();
  res.page(views.sectionPage({ ...ctx(req), section, docs: listDocuments(section.slug) }));
});

portal.get('/docs/:section/*rel', (req, res, next) => {
  const section = sectionBySlug(req.params.section);
  const doc = section && findDocument(section.slug, req.params.rel.join('/'));
  if (!doc) return next();
  if (doc.kind !== 'page') return res.redirect(303, `/portal/files/${section.slug}/${req.params.rel.map(encodeURIComponent).join('/')}`);
  audit(req.user.id, 'view', `${section.slug}/${doc.rel}`, req.ip);
  res.page(views.docPage({ ...ctx(req), section, doc, rendered: renderMarkdown(doc.abs) }));
});

portal.get('/files/:section/*rel', (req, res, next) => {
  const section = sectionBySlug(req.params.section);
  const doc = section && findDocument(section.slug, req.params.rel.join('/'));
  if (!doc) return next();
  const inline = doc.kind === 'pdf' && req.query.inline === '1';
  audit(req.user.id, inline ? 'open' : 'download', `${section.slug}/${doc.rel}`, req.ip);
  if (inline) {
    // Browsers' PDF viewers need to run here; the file comes from the portal's own content store.
    res.removeHeader('Content-Security-Policy');
    res.set('Content-Disposition', `inline; filename="${doc.name.replace(/"/g, '')}"`);
    return res.type('application/pdf').sendFile(doc.abs);
  }
  res.download(doc.abs, doc.name);
});

/* ---------- account ---------- */
portal.get('/account', (req, res) => res.page(views.accountPage({ ...ctx(req), flash: takeFlash(req) })));

portal.get('/account/password', (req, res) => {
  res.page(views.passwordPage({ ...ctx(req), forced: !!req.user.must_change_password }));
});

portal.post('/account/password', async (req, res) => {
  const forced = !!req.user.must_change_password;
  const current = String(req.body.current || '');
  const next = String(req.body.new || '');
  const confirm = String(req.body.confirm || '');
  const again = (error, status = 400) => res.page(views.passwordPage({ ...ctx(req), forced, error }), status);

  if (!forced && !(await verifyPassword(current, req.user.password_hash))) return again('Your current password is not correct.');
  if (next !== confirm) return again('The two new passwords don’t match.');
  const problem = passwordProblem(next, req.user.email);
  if (problem) return again(problem);
  if (await verifyPassword(next, req.user.password_hash)) return again('Choose a password that is different from the current one.');

  users.setPassword(req.user.id, await hashPassword(next), false);
  sessions.removeForUser(req.user.id, req.sessionIdHash);
  audit(req.user.id, 'password_changed', forced ? 'initial' : '', req.ip);
  if (forced) return res.redirect(303, '/portal');
  setFlash(req, { kind: 'success', text: 'Your password has been changed. Other devices have been signed out.' });
  res.redirect(303, '/portal/account');
});

/* ---------- administration ---------- */
const admin = express.Router();
admin.use(requireAdmin);
const EMAIL_RE = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/;

admin.get('/users', (req, res) => {
  res.page(views.adminUsersPage({ ...ctx(req), list: users.list(), flash: takeFlash(req) }));
});

admin.post('/users', async (req, res) => {
  const form = {
    name: String(req.body.name || '').trim().slice(0, 120),
    email: String(req.body.email || '').trim().toLowerCase().slice(0, 254),
    company: String(req.body.company || '').trim().slice(0, 120),
    role: req.body.role === 'admin' ? 'admin' : 'customer'
  };
  const again = error => res.page(views.adminUsersPage({ ...ctx(req), list: users.list(), form, error }), 400);
  if (!form.name) return again('Enter the person’s name.');
  if (!EMAIL_RE.test(form.email)) return again('Enter a valid email address.');
  if (users.byEmail(form.email)) return again('A user with this email address already exists.');

  const temp = generateTempPassword();
  const id = users.create({ ...form, passwordHash: await hashPassword(temp) });
  audit(req.user.id, 'user_created', `${id} ${form.email} ${form.role}`, req.ip);
  setFlash(req, { kind: 'secret', text: `Account created for ${form.email}. Temporary password:`, secret: temp });
  res.redirect(303, '/portal/admin/users');
});

const target = (req, res) => {
  const u = users.byId(Number(req.params.id));
  if (!u) { res.redirect(303, '/portal/admin/users'); return null; }
  if (u.id === req.user.id) { setFlash(req, { kind: 'error', text: 'You can’t change your own account here. Use the Account page.' }); res.redirect(303, '/portal/admin/users'); return null; }
  return u;
};

admin.post('/users/:id/reset', async (req, res) => {
  const u = target(req, res);
  if (!u) return;
  const temp = generateTempPassword();
  users.setPassword(u.id, await hashPassword(temp), true);
  sessions.removeForUser(u.id);
  loginFailures.clear('acct:' + u.email.toLowerCase());
  audit(req.user.id, 'password_reset', `${u.id} ${u.email}`, req.ip);
  setFlash(req, { kind: 'secret', text: `New temporary password for ${u.email}:`, secret: temp });
  res.redirect(303, '/portal/admin/users');
});

for (const action of ['disable', 'enable']) {
  admin.post(`/users/:id/${action}`, (req, res) => {
    const u = target(req, res);
    if (!u) return;
    users.setDisabled(u.id, action === 'disable');
    if (action === 'disable') sessions.removeForUser(u.id);
    audit(req.user.id, `user_${action}d`, `${u.id} ${u.email}`, req.ip);
    setFlash(req, { kind: 'success', text: action === 'disable' ? `${u.email} is disabled and has been signed out.` : `${u.email} can sign in again.` });
    res.redirect(303, '/portal/admin/users');
  });
}
portal.use('/admin', admin);

/* ---------- not found / errors inside the portal ---------- */
portal.use((req, res) => res.page(views.errorPage({
  status: 404, title: 'Page not found', message: 'This page or document doesn’t exist, or it has been moved.',
  user: req.user, csrf: req.session?.csrf
}), 404));

portal.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.page(views.errorPage({
    status: 500, title: 'Something went wrong', message: 'Please try again. If it keeps happening, contact your DIGITERRA representative.',
    user: req.user, csrf: req.session?.csrf
  }), 500);
});

app.use('/portal', portal);
app.use((req, res) => res.status(404).type('text').send('Not found'));

/* ------------------------------------------------------------------ */
/* Housekeeping and start                                              */
/* ------------------------------------------------------------------ */
setInterval(() => {
  const now = Date.now();
  sessions.purgeExpired(now, config.sessionIdleMinutes * 60 * 1000);
  loginFailures.purgeBefore(now - 24 * 60 * 60 * 1000);
}, 30 * 60 * 1000).unref();

app.listen(config.port, config.host, () => {
  console.log(`DIGITERRA site and client portal on http://${config.host === '0.0.0.0' ? 'localhost' : config.host}:${config.port}`);
  console.log(`  content: ${config.contentDir}`);
  console.log(`  data:    ${config.dataDir}`);
  if (users.count() === 0) console.log('  No users yet. Create the first administrator with: npm run user:create -- --email you@company.com --name "Your Name" --role admin');
});
