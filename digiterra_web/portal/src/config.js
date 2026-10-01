import path from 'node:path';

// All paths derive from this file's location, never from the working directory.
const PORTAL_DIR = path.resolve(import.meta.dirname, '..');
const REPO_ROOT = path.resolve(PORTAL_DIR, '..');

const env = process.env;
const production = env.NODE_ENV === 'production';

export const config = {
  production,
  port: Number(env.PORT || 5180),
  host: env.HOST || (production ? '0.0.0.0' : '127.0.0.1'),
  // Public marketing site (index.html + assets/)
  siteDir: path.resolve(env.SITE_DIR || REPO_ROOT),
  // Protected documents, one folder per section
  contentDir: path.resolve(env.CONTENT_DIR || path.join(PORTAL_DIR, 'content')),
  // SQLite database with users, sessions and the audit log
  dataDir: path.resolve(env.DATA_DIR || path.join(PORTAL_DIR, 'data')),
  publicDir: path.join(PORTAL_DIR, 'public'),
  // Cookies need HTTPS in production; plain HTTP is only for local development
  cookieSecure: env.COOKIE_SECURE ? env.COOKIE_SECURE === 'true' : production,
  // Set when running behind a reverse proxy or ingress, e.g. TRUST_PROXY=1
  trustProxy: env.TRUST_PROXY ? (Number.isNaN(Number(env.TRUST_PROXY)) ? env.TRUST_PROXY : Number(env.TRUST_PROXY)) : false,
  sessionIdleMinutes: Number(env.SESSION_IDLE_MINUTES || 120),
  sessionMaxHours: Number(env.SESSION_MAX_HOURS || 12),
  login: {
    windowMinutes: 15,
    maxPerAccount: 5,
    maxPerIp: 30
  }
};
