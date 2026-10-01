// Create a portal account, or give an existing one a new temporary password.
//   npm run user:create -- --email jane@bank.ch --name "Jane Muster" --company "Musterbank AG" [--role admin]
//   npm run user:reset  -- --email jane@bank.ch
import { parseArgs } from 'node:util';
import { users, sessions, audit } from '../src/db.js';
import { hashPassword, generateTempPassword } from '../src/passwords.js';

const { values: a } = parseArgs({
  options: {
    email: { type: 'string' },
    name: { type: 'string' },
    company: { type: 'string', default: '' },
    role: { type: 'string', default: 'customer' },
    reset: { type: 'boolean', default: false }
  }
});

const fail = msg => { console.error(msg); process.exit(1); };
const email = String(a.email || '').trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) fail('Pass a valid --email.');

const temp = generateTempPassword();
if (a.reset) {
  const u = users.byEmail(email);
  if (!u) fail(`No user with the email ${email}.`);
  users.setPassword(u.id, await hashPassword(temp), true);
  sessions.removeForUser(u.id);
  audit(null, 'password_reset', `${u.id} ${email} (cli)`);
  console.log(`New temporary password for ${email}: ${temp}`);
} else {
  if (!a.name) fail('Pass --name "First Last".');
  if (!['customer', 'admin'].includes(a.role)) fail('--role must be customer or admin.');
  if (users.byEmail(email)) fail(`A user with the email ${email} already exists. Use --reset to issue a new temporary password.`);
  const id = users.create({ email, name: a.name, company: a.company, role: a.role, passwordHash: await hashPassword(temp) });
  audit(null, 'user_created', `${id} ${email} ${a.role} (cli)`);
  console.log(`Created ${a.role} ${email}`);
  console.log(`Temporary password: ${temp}`);
}
console.log('The user must choose a new password at first sign-in.');
