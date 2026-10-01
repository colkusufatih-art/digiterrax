import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { config } from './config.js';

fs.mkdirSync(config.dataDir, { recursive: true });
export const db = new DatabaseSync(path.join(config.dataDir, 'portal.db'));

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    name TEXT NOT NULL,
    company TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL CHECK (role IN ('customer', 'admin')),
    password_hash TEXT NOT NULL,
    must_change_password INTEGER NOT NULL DEFAULT 1,
    disabled INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    last_login_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    csrf TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    last_seen_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);

  CREATE TABLE IF NOT EXISTS login_failures (
    key TEXT NOT NULL,
    at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS login_failures_key ON login_failures(key, at);

  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY,
    at INTEGER NOT NULL,
    user_id INTEGER,
    action TEXT NOT NULL,
    detail TEXT,
    ip TEXT
  );
`);

const q = sql => db.prepare(sql);

export const users = {
  byEmail: email => q('SELECT * FROM users WHERE email = ?').get(String(email).trim()),
  byId: id => q('SELECT * FROM users WHERE id = ?').get(id),
  list: () => q('SELECT * FROM users ORDER BY disabled, lower(company), lower(name)').all(),
  count: () => q('SELECT count(*) AS n FROM users').get().n,
  create: ({ email, name, company = '', role = 'customer', passwordHash }) =>
    q(`INSERT INTO users (email, name, company, role, password_hash, must_change_password, created_at)
       VALUES (?, ?, ?, ?, ?, 1, ?)`)
      .run(String(email).trim(), name.trim(), company.trim(), role, passwordHash, Date.now()).lastInsertRowid,
  setPassword: (id, passwordHash, mustChange) =>
    q('UPDATE users SET password_hash = ?, must_change_password = ? WHERE id = ?').run(passwordHash, mustChange ? 1 : 0, id),
  setDisabled: (id, disabled) => q('UPDATE users SET disabled = ? WHERE id = ?').run(disabled ? 1 : 0, id),
  touchLogin: id => q('UPDATE users SET last_login_at = ? WHERE id = ?').run(Date.now(), id)
};

export const sessions = {
  insert: s => q(`INSERT INTO sessions (id_hash, user_id, csrf, created_at, last_seen_at, expires_at)
                  VALUES (?, ?, ?, ?, ?, ?)`).run(s.idHash, s.userId, s.csrf, s.createdAt, s.lastSeenAt, s.expiresAt),
  get: idHash => q('SELECT * FROM sessions WHERE id_hash = ?').get(idHash),
  touch: (idHash, lastSeenAt) => q('UPDATE sessions SET last_seen_at = ? WHERE id_hash = ?').run(lastSeenAt, idHash),
  remove: idHash => q('DELETE FROM sessions WHERE id_hash = ?').run(idHash),
  removeForUser: (userId, exceptIdHash = '') => q('DELETE FROM sessions WHERE user_id = ? AND id_hash <> ?').run(userId, exceptIdHash),
  purgeExpired: (now, idleMs) => q('DELETE FROM sessions WHERE expires_at < ? OR last_seen_at < ?').run(now, now - idleMs)
};

export const loginFailures = {
  add: key => q('INSERT INTO login_failures (key, at) VALUES (?, ?)').run(key, Date.now()),
  countSince: (key, since) => q('SELECT count(*) AS n FROM login_failures WHERE key = ? AND at >= ?').get(key, since).n,
  clear: key => q('DELETE FROM login_failures WHERE key = ?').run(key),
  purgeBefore: before => q('DELETE FROM login_failures WHERE at < ?').run(before)
};

export function audit(userId, action, detail = '', ip = '') {
  q('INSERT INTO audit_log (at, user_id, action, detail, ip) VALUES (?, ?, ?, ?, ?)').run(Date.now(), userId ?? null, action, detail, ip);
}
