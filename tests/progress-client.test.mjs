import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const source = await readFile('public/app.js', 'utf8');
const empty = () => ({ xp: 0, answered: 0, correct: 0, wordMastery: {}, ruleMastery: {}, streak: 1, sound: true, activity: [0,0,0,0,0,0,0] });
const user = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', email: 'alice@example.test' };
const response = (body, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => body });
const settle = () => new Promise(resolve => setImmediate(resolve));

test('eight correct recalls retire a word, incorrect and duplicate answers do not advance it', async () => {
  const app = boot(async () => response({ user: null }));
  await settle();
  app.evaluate('state=structuredClone(defaultState)');
  const prepare = "session={type:'words',pool:[WORDS[2]],items:[WORDS[2]],index:0,roundCorrect:0,current:{kind:'type',answer:WORDS[2].de,word:WORDS[2]}}";
  for (let i=0;i<7;i++) {
    app.evaluate(prepare + ";answer('KASE');answer('KASE')");
    assert.equal(app.evaluate('wordCorrect(WORDS[2])'), i+1);
  }
  assert.equal(app.evaluate('pendingWords([WORDS[2]]).length'), 1);
  app.evaluate(prepare + ";answer('Brot')");
  assert.equal(app.evaluate('wordCorrect(WORDS[2])'), 7);
  app.evaluate(prepare + ";answer('kaese')");
  assert.equal(app.evaluate('wordCorrect(WORDS[2])'), 8);
  assert.equal(app.evaluate('pendingWords([WORDS[2]]).length'), 0);
  assert.equal(JSON.parse(app.storage.get('wortwerk-guest-progress')).wordCorrectCounts['2'], 8);
  assert.match(app.elements.get('#feedback').innerHTML, /Learned!/);
  app.evaluate('startWords([WORDS[2]])');
  assert.equal(app.evaluate('session'), null);
  assert.match(app.elements.get('#content').innerHTML, /All words learned/);
});

test('saved learned words are excluded after account reload and short rounds keep their selection', async () => {
  const progress = { ...empty(), wordCorrectCounts: { '0': 8, '1': 7 } };
  const app = boot(async path => response(path === '/api/auth/me' ? { user } : { userId: user.id, progress, revision: 4 }));
  await settle();
  app.evaluate('startWords([WORDS[0],WORDS[1]])');
  assert.equal(app.evaluate('session.items.length'), 1);
  assert.equal(app.evaluate('session.items[0].id'), 1);
  assert.equal(app.evaluate('session.current.kind'), 'type');
  app.evaluate('finishSession()');
  app.elements.get('#again').onclick();
  assert.equal(app.evaluate('session.items.length'), 1);
  assert.equal(app.evaluate('session.items[0].id'), 1);
});

test('vocabulary accepts optional articles, case and alternative umlaut spellings; grammar still checks articles', async () => {
  const app = boot(async () => response({ user: null }));
  await settle();
  app.evaluate("session={type:'words',current:{kind:'type',answer:'der Käse',word:{de:'der Käse',en:'cheese'}}}");
  for (const value of ['käse', 'KASE', 'kaese', 'DER KÄSE', '  der   kase  ', 'Ka\u0308se']) {
    assert.equal(app.evaluate(`matchesAnswer(${JSON.stringify(value)})`), true, value);
  }
  for (const value of ['', 'der', 'kaffee', 'kas']) assert.equal(app.evaluate(`matchesAnswer(${JSON.stringify(value)})`), false, value);
  app.evaluate("session.current.answer='die Straße'");
  assert.equal(app.evaluate("matchesAnswer('STRASSE')"), true);
  app.evaluate("session.current.answer='gemütlich'");
  assert.equal(app.evaluate("matchesAnswer('gemutlich')"), true);
  assert.equal(app.evaluate("matchesAnswer('gemuetlich')"), true);
  app.evaluate("session={type:'grammar',current:{answer:'der'}}");
  assert.equal(app.evaluate("matchesAnswer('der')"), true);
  assert.equal(app.evaluate("matchesAnswer('die')"), false);
  assert.equal(app.evaluate("matchesAnswer('das')"), false);
  assert.equal(app.evaluate("matchesAnswer('')"), false);
});

test('vocabulary feedback always shows the full German word and translation', async () => {
  const app = boot(async () => response({ user: null }));
  await settle();
  for (const kind of ['type', 'letters', 'choice']) {
    app.evaluate(`session={type:'words',current:{kind:${JSON.stringify(kind)},answer:'Käse',word:{de:'der Käse',en:'cheese'}}}`);
    for (const correct of [true, false]) {
      const feedback = app.evaluate(`answerFeedback(${correct})`);
      assert.match(feedback, /der Käse/);
      assert.match(feedback, /cheese/);
    }
  }
});
function boot(fetch) {
  const elements = new Map();
  const element = () => ({ textContent: '', innerHTML: '', classList: { add() {}, remove() {}, toggle() {} }, replaceChildren() {}, append() {} });
  const storage = new Map([['wortwerk-progress', JSON.stringify({ ...empty(), xp: 99999 })], ['wortwerk-guest-progress', JSON.stringify({ ...empty(), xp: 555 })]]);
  const context = vm.createContext({
    structuredClone, setTimeout, clearTimeout, fetch,
    document: { querySelector: s => { if (!elements.has(s)) elements.set(s, element()); return elements.get(s); }, querySelectorAll: () => [], createElement: element },
    localStorage: { getItem: k => storage.get(k), setItem: (k, v) => storage.set(k, v) },
    window: { addEventListener() {} }, location: { assign() {} },
  });
  vm.runInContext(source, context);
  return { evaluate: code => vm.runInContext(code, context), elements, storage };
}

test('account progress never imports guest or legacy browser progress', async () => {
  const app = boot(async path => response(path === '/api/auth/me' ? { user } : { userId: user.id, progress: null, revision: 0 }));
  await settle();
  assert.equal(app.evaluate('state.xp'), 0);
  assert.equal(app.evaluate('ready'), true);
});

test('failed cloud load blocks exercises instead of overwriting saved progress', async () => {
  let posts = 0;
  const app = boot(async (path, init) => { if (init?.method === 'POST') posts++; return path === '/api/auth/me' ? response({ user }) : response({ error: 'Unavailable' }, 503); });
  await settle();
  assert.equal(app.evaluate('ready'), false);
  app.evaluate('go("words")');
  assert.match(app.elements.get('#content').innerHTML, /Unable to load/);
  assert.equal(posts, 0);
});

test('saves are serialized and preserve the newest answer during an in-flight save', async () => {
  const posts = [];
  let release;
  const app = boot(async (path, init) => {
    if (init?.method !== 'POST') return response(path === '/api/auth/me' ? { user } : { userId: user.id, progress: empty(), revision: 3 });
    posts.push(JSON.parse(init.body));
    if (posts.length === 1) return await new Promise(resolve => { release = () => resolve(response({ saved: true, revision: 4 })); });
    return response({ saved: true, revision: 5 });
  });
  await settle();
  app.evaluate('state.xp=10; save(); state.xp=20; save();');
  assert.equal(posts.length, 1);
  release();
  await app.evaluate('flushProgress()');
  assert.equal(posts.length, 2);
  assert.equal(posts[0].revision, 3);
  assert.equal(posts[1].revision, 4);
  assert.equal(posts[1].progress.xp, 20);
  assert.equal(app.evaluate('dirty'), false);
});

test('an account-switch conflict preserves unsaved work and stops further writes', async () => {
  let posts = 0;
  const app = boot(async (path, init) => {
    if (init?.method === 'POST') { posts++; return response({ error: 'Account changed. Reload.' }, 409); }
    return response(path === '/api/auth/me' ? { user } : { userId: user.id, progress: empty(), revision: 1 });
  });
  await settle();
  app.evaluate('state.xp=10;save()');
  await app.evaluate('flushProgress()');
  assert.equal(app.evaluate('dirty'), true);
  assert.equal(app.evaluate('syncBlocked'), true);
  assert.equal(app.evaluate('state.xp'), 10);
  assert.match(app.elements.get('#syncStatus').textContent, /unsaved progress remains/);
  await app.evaluate('flushProgress()');
  assert.equal(posts, 1);
});
