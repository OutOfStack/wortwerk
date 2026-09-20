import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

// OWASP's memory/CPU trade-off for scrypt: 16 MiB, five passes.
const OPTIONS = { N: 16384, r: 8, p: 5, maxmem: 32 * 1024 * 1024 };
export const PASSWORD_HELP = 'Use 8–128 characters, including an uppercase letter, a lowercase letter, a number and a symbol.';

export function validPassword(value: unknown): value is string {
  return typeof value === 'string' && [...value].length >= 8 && [...value].length <= 128
    && /\p{Lu}/u.test(value) && /\p{Ll}/u.test(value)
    && /\p{N}/u.test(value) && /[^\p{L}\p{N}\s]/u.test(value);
}

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 32, OPTIONS, (error, key) => error ? reject(error) : resolve(key));
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = (await derive(password, salt)).toString('hex');
  return `scrypt$16384$8$5$${salt}$${hash}`;
}

// A missing account performs the same KDF work as an existing account.
const DUMMY = `scrypt$16384$8$5$${'0'.repeat(32)}$${'0'.repeat(64)}`;
export async function verifyPassword(password: string, encoded: string | null): Promise<boolean> {
  const parts = (encoded || DUMMY).split('$');
  if (parts.length !== 6 || parts.slice(0, 4).join('$') !== 'scrypt$16384$8$5'
    || !/^[a-f0-9]{32}$/.test(parts[4]) || !/^[a-f0-9]{64}$/.test(parts[5])) return false;
  const actual = await derive(password, parts[4]);
  const equal = timingSafeEqual(actual, Buffer.from(parts[5], 'hex'));
  return encoded !== null && equal;
}
