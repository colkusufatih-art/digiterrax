import crypto from 'node:crypto';

// scrypt parameters are stored with every hash, so they can be raised later
// without breaking existing accounts.
const N = 32768, R = 8, P = 1, KEYLEN = 64;
const MAXMEM = 128 * 1024 * 1024;

function scrypt(password, salt, n, r, p, keylen) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(String(password).normalize('NFKC'), salt, keylen, { N: n, r, p, maxmem: MAXMEM },
      (err, key) => (err ? reject(err) : resolve(key)));
  });
}

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(password, salt, N, R, P, KEYLEN);
  return ['scrypt', N, R, P, salt.toString('base64'), key.toString('base64')].join('$');
}

export async function verifyPassword(password, stored) {
  const [alg, n, r, p, salt, hash] = String(stored).split('$');
  if (alg !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64');
  const key = await scrypt(password, Buffer.from(salt, 'base64'), Number(n), Number(r), Number(p), expected.length);
  return crypto.timingSafeEqual(key, expected);
}

// Compared against when an email is unknown, so a failed sign-in takes the same time either way.
export const DUMMY_HASH = await hashPassword(crypto.randomBytes(18).toString('base64'));

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
export function generateTempPassword() {
  const groups = [];
  for (let g = 0; g < 4; g++) {
    let s = '';
    for (let i = 0; i < 4; i++) s += ALPHABET[crypto.randomInt(ALPHABET.length)];
    groups.push(s);
  }
  return groups.join('-');
}

// Length over composition rules (NIST SP 800-63B).
export function passwordProblem(password, email = '') {
  const pw = String(password);
  if (pw.length < 12) return 'Use at least 12 characters.';
  if (pw.length > 200) return 'Use at most 200 characters.';
  const local = String(email).split('@')[0].toLowerCase();
  if (local.length >= 4 && pw.toLowerCase().includes(local)) return 'Don’t use your email address in the password.';
  if (/^(.)\1+$/.test(pw)) return 'Don’t repeat a single character.';
  return null;
}
