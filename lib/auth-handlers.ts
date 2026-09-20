import { randomUUID } from 'node:crypto';
import { createSession, endSession, failure, getUser, guardMutation, HttpError, json, rateLimit, readJson } from './auth';
import { hashPassword, normalizeEmail, PASSWORD_HELP, validPassword, verifyPassword } from './password';

export async function authPost(db: D1Database, request: Request, action: string) {
  try {
    guardMutation(request);
    if (action === 'logout') return json({ signedOut: true }, 200, { 'Set-Cookie': await endSession(db, request) });
    if (!['login', 'register'].includes(action)) throw new HttpError(404, 'Not found.');
    const input = await readJson(request) as Record<string, unknown> | null;
    const email = normalizeEmail(input?.email);
    const password = input?.password;
    if (!email || typeof password !== 'string' || password.length > 512 || !password.length) {
      throw new HttpError(400, 'Enter a valid email and password.');
    }
    await rateLimit(db, request, email, action === 'register');
    let user: { id: string; email: string };
    if (action === 'register') {
      if (!validPassword(password)) throw new HttpError(400, PASSWORD_HELP);
      if (input?.confirmPassword !== password) throw new HttpError(400, 'Passwords do not match.');
      const encoded = await hashPassword(password);
      const id = randomUUID();
      const result = await db.prepare(`INSERT INTO auth_users (id, email, password_hash, created_at)
        VALUES (?, ?, ?, ?) ON CONFLICT(email) DO NOTHING`).bind(id, email, encoded, Date.now()).run();
      if (!result.meta.changes) throw new HttpError(409, 'Unable to create an account with that email. Try signing in.');
      user = { id, email };
    } else {
      const row = await db.prepare('SELECT id, email, password_hash FROM auth_users WHERE email = ?')
        .bind(email).first<{ id: string; email: string; password_hash: string }>();
      if (!await verifyPassword(password, row?.password_hash || null) || !row) {
        throw new HttpError(401, 'Email or password is incorrect.');
      }
      user = { id: row.id, email: row.email };
    }
    return json({ user }, action === 'register' ? 201 : 200, { 'Set-Cookie': await createSession(db, request, user) });
  } catch (error) { return failure(error); }
}

export async function authGet(db: D1Database, request: Request) {
  try { return json({ user: await getUser(db, request) }); }
  catch (error) { return failure(error); }
}
