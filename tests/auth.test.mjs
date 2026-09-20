import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { WORDS } from '../public/vocabulary.js';

const require = createRequire(import.meta.url);
// Wrangler already owns these exact runtime/testing dependencies.
const wranglerRequire = createRequire(require.resolve('wrangler/package.json'));
const { Miniflare } = wranglerRequire('miniflare');
const { build } = wranglerRequire('esbuild');
const origin = 'https://wortwerk.test';
const password = 'Blue-Coffee9!';
const progress = { xp: 1, xpVersion: 2, answered: 1, correct: 1, wordMastery: { '0': 35 }, ruleMastery: {}, streak: 1, sound: true, activity: [1,0,0,0,0,0,0] };

test('accounts, password policy, protected progress, rate limits and revocable sessions in Workers', async () => {
  const output = await build({ entryPoints: ['tests/auth-worker.ts'], bundle: true, write: false, format: 'esm', platform: 'node', target: 'es2022' });
  const mf = new Miniflare({ modules: true, script: output.outputFiles[0].text, compatibilityDate: '2026-05-15', compatibilityFlags: ['nodejs_compat'], d1Databases: ['DB'], cf: false });
  try {
    const db = await mf.getD1Database('DB');
    for (const path of (await readdir('drizzle')).filter(p => p.endsWith('.sql')).sort()) {
      const sql = await readFile(`drizzle/${path}`, 'utf8');
      await db.batch(sql.replaceAll('--> statement-breakpoint', '').split(';').map(s => s.trim()).filter(Boolean).map(s => db.prepare(s)));
    }
    let ip = 1;
    async function call(path, data, cookie, extra = {}) {
      const response = await mf.dispatchFetch(origin + path, {
        method: data === undefined ? 'GET' : 'POST',
        headers: { origin, 'content-type': 'application/json', 'cf-connecting-ip': `192.0.2.${ip++}`, ...(cookie ? { cookie } : {}), ...extra },
        ...(data === undefined ? {} : { body: JSON.stringify(data) }),
      });
      const result = await response.json();
      return { response, result, cookie: response.headers.get('set-cookie')?.split(';')[0] };
    }
    const register = (email, p = password, extra = {}) => call('/api/auth/register', { email, password: p, confirmPassword: p }, undefined, extra);
    for (const [i, weak] of ['Aa1!', 'lowercase9!', 'UPPERCASE9!', 'NoNumber!!', 'NoSymbol99', 'Aa1!'.repeat(33)].entries()) {
      assert.equal((await register(`weak${i}@example.test`, weak)).response.status, 400, weak);
    }
    assert.equal((await call('/api/auth/register', { email: 'match@example.test', password, confirmPassword: 'different' })).response.status, 400);
    assert.equal((await register('bad-email')).response.status, 400);
    assert.equal((await register('evil@example.test', password, { origin: 'https://evil.test' })).response.status, 403);
    assert.equal((await register('null@example.test', password, { origin: 'null' })).response.status, 403);
    const a = await register(' Alice@Example.test ');
    assert.equal(a.response.status, 201, JSON.stringify(a.result));
    assert.equal(a.result.user.email, 'alice@example.test');
    assert.match(a.response.headers.get('set-cookie'), /HttpOnly/);
    assert.match(a.response.headers.get('set-cookie'), /Secure/);
    assert.match(a.response.headers.get('set-cookie'), /SameSite=Lax/);
    assert.match(a.cookie, /^__Host-wortwerk_session=/);
    assert.equal((await register('ALICE@example.test')).response.status, 409);
    assert.equal((await call('/api/auth/login', { email: 'alice@example.test', password: 'WrongPassword9!' })).response.status, 401);
    assert.equal((await call('/api/auth/login', { email: 'unknown@example.test', password })).result.error, 'Email or password is incorrect.');
    const stored = await db.prepare('SELECT password_hash FROM auth_users WHERE id = ?').bind(a.result.user.id).first();
    assert.match(stored.password_hash, /^scrypt\$16384\$8\$5\$/);
    assert.ok(!stored.password_hash.includes(password));
    assert.equal((await call('/api/progress', undefined)).response.status, 401);
    assert.equal((await call('/api/progress', undefined, undefined, { 'oai-authenticated-user-id': a.result.user.id, 'oai-authenticated-user-email': a.result.user.email })).response.status, 401);
    assert.equal((await call('/api/auth/me', undefined, a.cookie)).result.user.id, a.result.user.id);
    const save = { userId: a.result.user.id, revision: 0, progress };
    assert.equal((await call('/api/progress', save, a.cookie)).response.status, 200);
    assert.deepEqual((await call('/api/progress', undefined, a.cookie)).result.progress, { ...progress, wordCorrectCounts: {} }, 'older progress loads without losing existing scores');
    const countedProgress = { ...progress, wordCorrectCounts: { '0': 8, '1': 3 } };
    assert.equal((await call('/api/progress', { ...save, revision: 1, progress: countedProgress }, a.cookie)).response.status, 200);
    assert.equal((await call('/api/progress', { ...save, revision: 2, progress: { ...countedProgress, wordCorrectCounts: { '0': 9 } } }, a.cookie)).response.status, 400);
    assert.equal((await call('/api/progress', save, a.cookie)).response.status, 409, 'stale device must not overwrite');
    assert.equal((await call('/api/progress', { ...save, revision: 1, progress: { ...progress, xp: '<script>' } }, a.cookie)).response.status, 400);
    const b = await register('bob@example.test');
    assert.equal((await call('/api/progress', undefined, b.cookie)).result.progress, null);
    assert.equal((await call('/api/progress', { ...save, revision: 1 }, b.cookie)).response.status, 409, 'account switched in another tab');
    const login = await call('/api/auth/login', { email: 'ALICE@example.test', password });
    assert.equal(login.response.status, 200);
    assert.notEqual(login.cookie, a.cookie);
    assert.deepEqual((await call('/api/progress', undefined, login.cookie)).result.progress, countedProgress, 'per-word counts survive signing out and back in');
    const token = login.cookie.split('=')[1];
    assert.ok(await db.prepare('SELECT token_hash FROM auth_sessions WHERE token_hash = ?').bind(createHash('sha256').update(token).digest('hex')).first());
    assert.equal((await call('/api/auth/logout', {}, login.cookie, { origin: 'https://evil.test' })).response.status, 403);
    assert.equal((await call('/api/auth/logout', {}, login.cookie)).response.status, 200);
    assert.equal((await call('/api/progress', undefined, login.cookie)).response.status, 401);
    await db.prepare('UPDATE auth_sessions SET expires_at = 0 WHERE user_id = ?').bind(b.result.user.id).run();
    assert.equal((await call('/api/progress', undefined, b.cookie)).response.status, 401, 'expired session');
    assert.equal((await call('/api/progress', undefined, '__Host-wortwerk_session=' + 'f'.repeat(64))).response.status, 401);
    for (let i = 0; i < 10; i++) await call('/api/auth/login', { email: 'limited@example.test', password });
    assert.equal((await call('/api/auth/login', { email: 'limited@example.test', password })).response.status, 429);
    for (let i = 0; i < 5; i++) await register(`rate${i}@example.test`, 'weak', { 'cf-connecting-ip': '198.51.100.1' });
    assert.equal((await register('rate6@example.test', password, { 'cf-connecting-ip': '198.51.100.1' })).response.status, 429);

    const expandedProgress = {
      ...progress,
      wordMastery: Object.fromEntries(WORDS.map(word => [word.id, 100])),
      wordCorrectCounts: Object.fromEntries(WORDS.map(word => [word.id, 8])),
    };
    assert.equal((await call('/api/progress', { ...save, revision: 2, progress: expandedProgress }, a.cookie)).response.status, 200);
    assert.deepEqual((await call('/api/progress', undefined, a.cookie)).result.progress, expandedProgress, 'every new word can be saved and reloaded');
    for (const key of ['wordMastery', 'wordCorrectCounts']) {
      assert.equal((await call('/api/progress', { ...save, revision: 3, progress: { ...expandedProgress, [key]: { '999999': 1 } } }, a.cookie)).response.status, 400, 'unknown word IDs remain invalid');
    }

    const legacyProgress = { ...expandedProgress, xp: 508 };
    delete legacyProgress.xpVersion;
    await db.prepare('UPDATE learner_progress SET payload = ? WHERE user_id = ?').bind(JSON.stringify(legacyProgress), a.result.user.id).run();
    const upgraded = (await call('/api/progress', undefined, a.cookie)).result;
    assert.equal(upgraded.progress.xp, 50);
    assert.equal(upgraded.progress.xpVersion, 2);
    assert.deepEqual(upgraded.progress.wordCorrectCounts, expandedProgress.wordCorrectCounts);
    assert.equal((await call('/api/progress', { ...save, revision: 3, progress: legacyProgress }, a.cookie)).response.status, 409, 'outdated clients must reload instead of saving old XP rewards');
    assert.equal((await call('/api/progress', { ...save, revision: 3, progress: upgraded.progress }, a.cookie)).response.status, 200);
    assert.equal((await call('/api/progress', undefined, a.cookie)).result.progress.xp, 50, 'saved current XP must not be rescaled again');
  } finally { await mf.dispose(); }
});
