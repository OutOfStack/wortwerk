import { createHash, randomBytes } from 'node:crypto';

export type User = { id: string; email: string };
const COOKIE = '__Host-wortwerk_session';
const LOCAL_COOKIE = 'wortwerk_local_session';
const SESSION_SECONDS = 7 * 24 * 60 * 60;
export const digest = (value: string) => createHash('sha256').update(value).digest('hex');

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function isLocal(request: Request) {
  const url = new URL(request.url);
  return url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
}

export function guardMutation(request: Request) {
  const url = new URL(request.url);
  if (url.protocol !== 'https:' && !isLocal(request)) throw new HttpError(403, 'HTTPS is required.');
  if (request.headers.get('origin') !== url.origin || request.headers.get('sec-fetch-site') === 'cross-site') {
    throw new HttpError(403, 'Please submit this request from Wortwerk.');
  }
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') {
    throw new HttpError(415, 'Send JSON data.');
  }
}

export async function readJson(request: Request, maxBytes = 4096): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, 'Missing request body.');
  let total = 0;
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) { await reader.cancel(); throw new HttpError(413, 'Request is too large.'); }
    chunks.push(value);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new HttpError(400, 'Invalid JSON.'); }
}

export function json(value: unknown, status = 200, extra: Record<string, string> = {}) {
  return Response.json(value, { status, headers: { 'Cache-Control': 'private, no-store', ...extra } });
}

export function failure(error: unknown) {
  if (error instanceof HttpError) return json({ error: error.message }, error.status,
    error.status === 429 ? { 'Retry-After': '900' } : {});
  console.error('Wortwerk request failed', error instanceof Error ? error.message : 'unknown error');
  return json({ error: 'Service temporarily unavailable. Please try again.' }, 503);
}

function cookieToken(headers: Headers, local = false) {
  const cookies = (headers.get('cookie') || '').split(';').map(c => c.trim());
  const name = local ? LOCAL_COOKIE : COOKIE;
  const matches = cookies.filter(c => c.startsWith(`${name}=`));
  if (matches.length !== 1) return null;
  const token = matches[0].slice(name.length + 1);
  return /^[a-f0-9]{64}$/.test(token) ? token : null;
}

export async function getUser(db: D1Database, request: Request): Promise<User | null> {
  const token = cookieToken(request.headers, isLocal(request));
  if (!token) return null;
  return db.prepare(`SELECT u.id, u.email FROM auth_sessions s
    JOIN auth_users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?`)
    .bind(digest(token), Date.now()).first<User>();
}

function cookie(request: Request, token: string, seconds: number) {
  const local = isLocal(request);
  return `${local ? LOCAL_COOKIE : COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${seconds}${local ? '' : '; Secure'}`;
}

export async function createSession(db: D1Database, request: Request, user: User) {
  const token = randomBytes(32).toString('hex');
  const old = cookieToken(request.headers, isLocal(request));
  const statements = [db.prepare('INSERT INTO auth_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(digest(token), user.id, Date.now() + SESSION_SECONDS * 1000)];
  if (old) statements.push(db.prepare('DELETE FROM auth_sessions WHERE token_hash = ?').bind(digest(old)));
  statements.push(db.prepare('DELETE FROM auth_sessions WHERE token_hash IN (SELECT token_hash FROM auth_sessions WHERE expires_at <= ? LIMIT 100)').bind(Date.now()));
  await db.batch(statements);
  return cookie(request, token, SESSION_SECONDS);
}

export async function endSession(db: D1Database, request: Request) {
  const token = cookieToken(request.headers, isLocal(request));
  if (token) await db.prepare('DELETE FROM auth_sessions WHERE token_hash = ?').bind(digest(token)).run();
  return cookie(request, '', 0);
}

export async function rateLimit(db: D1Database, request: Request, email: string, signup: boolean) {
  // CF overwrites CF-Connecting-IP. Never trust X-Forwarded-For from callers.
  const ip = request.headers.get('cf-connecting-ip') || 'local';
  const now = Date.now();
  const window = 15 * 60 * 1000;
  const keys = [
    { key: digest(`ip:${ip}`), limit: 30 },
    { key: digest(`email:${email}`), limit: 10 },
    ...(signup ? [{ key: digest(`signup:${ip}`), limit: 5 }] : []),
  ];
  const results = await db.batch<{ attempts: number }>(keys.map(({ key }) => db.prepare(`
    INSERT INTO auth_limits (key, attempts, resets_at) VALUES (?, 1, ?)
    ON CONFLICT(key) DO UPDATE SET
      attempts = CASE WHEN resets_at <= ? THEN 1 ELSE attempts + 1 END,
      resets_at = CASE WHEN resets_at <= ? THEN excluded.resets_at ELSE resets_at END
    RETURNING attempts`).bind(key, now + window, now, now)));
  if (results.some((r, i) => (r.results?.[0]?.attempts || 0) > keys[i].limit)) {
    throw new HttpError(429, 'Too many attempts. Please wait 15 minutes before trying again.');
  }
  await db.prepare('DELETE FROM auth_limits WHERE key IN (SELECT key FROM auth_limits WHERE resets_at <= ? LIMIT 100)').bind(now).run();
}
