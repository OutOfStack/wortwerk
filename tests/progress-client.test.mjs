import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { WORDS, VOCABULARY_VERSION } from '../public/vocabulary.js';
import * as levels from '../public/levels.js';
import * as grammar from '../public/grammar-progress.js';
import { RULES } from '../public/grammar.js';
import { THEORY } from '../public/grammar-theory.js';

const source = (await readFile('public/app.js', 'utf8')).replace(/^import .* from '\.\/(vocabulary|levels|grammar|grammar-progress|grammar-theory)\.js';\n/gm, '');
const empty = () => ({ xp: 0, xpVersion: 2, vocabularyVersion: 1, knownWordIds: [], answered: 0, correct: 0, wordMastery: {}, grammarVersion: 3, grammarProgress: {}, streak: 1, sound: true, activity: [0,0,0,0,0,0,0] });
const user = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', email: 'alice@example.test' };
const response = (body, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => body });
const settle = () => new Promise(resolve => setImmediate(resolve));

test('expanded vocabulary retains legacy progress identities and has valid unique entries', async () => {
  const legacy = JSON.parse(await readFile('tests/legacy-word-ids.json', 'utf8'));
  for (const { id, de } of legacy) assert.equal(WORDS.find(word => word.id === id)?.de, de);
  assert.equal(new Set(WORDS.map(word => word.id)).size, WORDS.length);
  assert.equal(new Set(WORDS.map(word => word.de)).size, WORDS.length);
  assert.equal(WORDS.length, 1000);
  for (const word of WORDS) {
    assert.ok(Number.isInteger(word.id) && word.id >= 0);
    assert.ok(['A1', 'A2'].includes(word.level));
    assert.ok(['noun', 'verb', 'adjective', 'adverb', 'conjunction', 'preposition', 'pronoun', 'numeral'].includes(word.pos));
    assert.ok(word.de && word.en && word.topic);
    if (word.pos === 'noun') assert.match(word.de, /^(der|die|das) /);
  }
});

test('every word has four distinct choices of the same part of speech and one correct meaning', async () => {
  const app = boot(async () => response({ user: null }));
  await settle();
  for (const word of WORDS) {
    const question = app.evaluate(`wordForm(WORDS.find(word=>word.id===${word.id}),0)`);
    assert.equal(question.kind, 'choice', word.de);
    assert.equal(question.opts.length, 4, word.de);
    assert.equal(question.opts.filter(option => option === word.en).length, 1, word.de);
    const meanings = question.opts.flatMap(option => option.split(' / ').map(value => value.toLowerCase()));
    assert.equal(new Set(meanings).size, meanings.length, word.de);
    for (const option of question.opts) {
      assert.ok(WORDS.some(other => other.en === option && other.pos === word.pos), `${word.de}: ${option}`);
    }
  }
});

test('distractors prefer the topic and level, including verbs inside themed topics', async () => {
  const app = boot(async () => response({ user: null }));
  await settle();
  for (const de of ['der Apfel', 'umsteigen', 'schwimmen', 'krank']) {
    const word = WORDS.find(word => word.de === de);
    const opts = app.evaluate(`wordChoices(WORDS.find(word=>word.id===${word.id}))`);
    for (const option of opts) {
      assert.ok(WORDS.some(other => other.en === option && other.pos === word.pos && other.topic === word.topic && other.level === word.level));
    }
  }
  const sparse = app.evaluate("wordForm({id:9999,de:'ich',en:'I',pos:'interjection',topic:'Sparse',level:'A1'},0)");
  assert.equal(sparse.kind, 'type', 'never pad a small category with unrelated word types');
});

test('shuffling preserves entries and choices vary without changing the source pool', async () => {
  const app = boot(async () => response({ user: null }));
  await settle();
  app.evaluate('const pool=[1,2,3,4]; const originalRandom=Math.random; Math.random=()=>0;');
  assert.equal(JSON.stringify(app.evaluate('shuffle(pool)')), '[2,3,4,1]');
  assert.equal(JSON.stringify(app.evaluate('pool')), '[1,2,3,4]');
  const first = JSON.stringify(app.evaluate('wordChoices(WORDS[0])'));
  app.evaluate('Math.random=()=>0.99');
  assert.notEqual(JSON.stringify(app.evaluate('wordChoices(WORDS[0])')), first);
  app.evaluate('Math.random=originalRandom');
});

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
  assert.match(app.elements.get('#content').innerHTML, /All words complete/);
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

test('I know this works in every vocabulary mode without rewarding or recording an answer', async () => {
  for (const count of [0, 1, 2]) {
    const app = boot(async () => response({ user: null }), { ...empty(), wordCorrectCounts: { '0': count } });
    await settle();
    app.evaluate('startWords([WORDS[0]])');
    assert.match(app.elements.get('#content').innerHTML, /I know this/);
    app.elements.get('#knowWord').onclick();
    app.evaluate("markWordKnown();answer(session.current.answer)");
    assert.equal(app.evaluate('state.xp'), 0);
    assert.equal(app.evaluate('state.answered'), 0);
    assert.equal(app.evaluate('state.correct'), 0);
    assert.equal(app.evaluate('state.activity.reduce((a,b)=>a+b,0)'), 0);
    assert.equal(app.evaluate('wordCorrect(WORDS[0])'), count);
    assert.equal(app.evaluate('pendingWords([WORDS[0]]).length'), 0);
    assert.equal(app.evaluate('session.skipped'), 1);
    const saved = JSON.parse(app.storage.get('wortwerk-guest-progress'));
    assert.deepEqual(saved.knownWordIds, ['0']);
    assert.equal(saved.vocabularyVersion, 1);
    app.elements.get('#next').onclick();
    assert.match(app.elements.get('#content').innerHTML, /1 marked known without XP/);
    assert.doesNotMatch(app.elements.get('#content').innerHTML, /NaN|Infinity/);
    const reloaded = boot(async () => response({ user: null }), saved);
    await settle();
    assert.equal(reloaded.evaluate('pendingWords([WORDS[0]]).length'), 0);
    reloaded.evaluate("restoreWord('0')");
    assert.equal(reloaded.evaluate('pendingWords([WORDS[0]]).length'), 1);
    assert.equal(reloaded.evaluate('wordCorrect(WORDS[0])'), count);
    assert.deepEqual(JSON.parse(reloaded.storage.get('wortwerk-guest-progress')).knownWordIds, []);
  }
});

test('known words are account-specific and restoration saves to the account', async () => {
  const posts = [];
  const progress = { ...empty(), knownWordIds: ['0', '999'], wordCorrectCounts: { '0': 3 } };
  const app = boot(async (path, init) => {
    if (init?.method === 'POST') { posts.push(JSON.parse(init.body)); return response({ saved: true, revision: 5 }); }
    return response(path === '/api/auth/me' ? { user } : { userId: user.id, progress, revision: 4 });
  }, { ...empty(), knownWordIds: ['1'] });
  await settle();
  assert.equal(app.evaluate('isWordKnown(WORDS[1])'), false, 'guest exclusions never leak into an account');
  assert.equal(app.evaluate('pendingWords([WORDS[0],WORDS[999]]).length'), 0);
  app.evaluate('renderProgress()');
  assert.match(app.elements.get('#content').innerHTML, /Words marked known \(2\)/);
  assert.match(app.elements.get('#content').innerHTML, /data-restore-word="999"/);
  app.evaluate("restoreWord('0')");
  await settle();
  assert.deepEqual(posts[0].progress.knownWordIds, ['999']);
  assert.equal(posts[0].progress.wordCorrectCounts['0'], 3);
  assert.equal(app.evaluate('pendingWords([WORDS[0]]).length'), 1);
});

test('mixed rounds exclude marked-known words from accuracy and reject marking after an answer', async () => {
  const app = boot(async () => response({ user: null }), empty());
  await settle();
  app.evaluate('startWords([WORDS[0],WORDS[1]]);markWordKnown()');
  app.elements.get('#next').onclick();
  app.evaluate('answer(session.current.answer);markWordKnown()');
  assert.equal(app.evaluate('state.knownWordIds.length'), 1);
  app.elements.get('#next').onclick();
  assert.match(app.elements.get('#content').innerHTML, /1 of 1 correctly/);
  assert.match(app.elements.get('#content').innerHTML, /100%/);
  assert.equal(app.evaluate('state.xp'), 1);
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
function boot(fetch, guestProgress = { ...empty(), xp: 555 }) {
  const elements = new Map();
  const element = () => ({ textContent: '', innerHTML: '', classList: { add() {}, remove() {}, toggle() {} }, style: { setProperty() {} }, setAttribute() {}, replaceChildren() {}, append() {} });
  const storage = new Map([['wortwerk-progress', JSON.stringify({ ...empty(), xp: 99999 })], ['wortwerk-guest-progress', JSON.stringify(guestProgress)]]);
  const context = vm.createContext({
    structuredClone, setTimeout, clearTimeout, fetch,
    ...levels, ...grammar, RULES, THEORY, VOCABULARY_VERSION,
    document: { querySelector: s => { if (!elements.has(s)) elements.set(s, element()); return elements.get(s); }, querySelectorAll: () => [], createElement: element },
    localStorage: { getItem: k => storage.get(k), setItem: (k, v) => storage.set(k, v) },
    window: { addEventListener() {} }, location: { assign() {} },
  });
  vm.runInContext(`const WORDS=${JSON.stringify(WORDS)};\n${source}`, context);
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

test('correct words earn 1 XP, correct grammar earns 1, and mistakes or double submissions earn nothing', async () => {
  const app = boot(async () => response({ user: null }));
  await settle();
  app.evaluate("state=structuredClone(defaultState);session={type:'words',pool:[WORDS[2]],items:[WORDS[2]],index:0,roundCorrect:0,current:{kind:'type',answer:WORDS[2].de,word:WORDS[2]}}");
  app.evaluate("answer('kaese');answer('kaese')");
  assert.equal(app.evaluate('state.xp'), 1);
  app.evaluate('finishSession()');
  assert.match(app.elements.get('#content').innerHTML, /<strong>\+1<\/strong><small>XP earned/);
  app.evaluate("session.locked=false;answer('Brot')");
  assert.equal(app.evaluate('state.xp'), 1);
  app.evaluate("session={type:'grammar',rule:RULES[0],items:RULES[0].qs,index:0,roundCorrect:0,current:{answer:'bin'}};answer('bin');answer('bin')");
  assert.equal(app.evaluate('state.xp'), 2);
  app.evaluate("session.locked=false;answer('bist')");
  assert.equal(app.evaluate('state.xp'), 2);
  app.evaluate('finishSession()');
  assert.match(app.elements.get('#content').innerHTML, /<strong>\+1<\/strong><small>XP earned this visit/);
  assert.equal(JSON.parse(app.storage.get('wortwerk-guest-progress')).xpVersion, 2);
});

test('sidebar promotes at the threshold and shows remaining progress in the new level', async () => {
  const app = boot(async () => response({ user: null }));
  await settle();
  app.evaluate('state.xp=30;updateChrome()');
  assert.equal(app.elements.get('#levelNumber').textContent, 2);
  assert.equal(app.elements.get('#rankName').textContent, 'Senior Cadet');
  assert.equal(app.elements.get('#rankProgress').textContent, '0 / 45 XP · Level 2');
  app.evaluate('state.xp=75;renderProgress()');
  assert.match(app.elements.get('#content').innerHTML, /Practice rank · Level 3/);
  assert.match(app.elements.get('#content').innerHTML, /68 XP to/);
  assert.match(app.elements.get('#content').innerHTML, /Level 30 · Field Marshal/);
});

test('old guest and account XP upgrades once while retaining learning progress', async () => {
  const legacy = { ...empty(), xp: 508, wordCorrectCounts: { '0': 8 }, ruleMastery: { sein: 85 } };
  delete legacy.xpVersion;
  const guest = boot(async () => response({ user: null }), legacy);
  await settle();
  assert.equal(guest.evaluate('state.xp'), 50);
  const saved = JSON.parse(guest.storage.get('wortwerk-guest-progress'));
  assert.equal(saved.xpVersion, 2);
  assert.deepEqual(saved.wordCorrectCounts, legacy.wordCorrectCounts);
  assert.deepEqual(saved.grammarProgress, {});
  assert.equal(saved.grammarVersion, 3);
  assert.equal('ruleMastery' in saved, false, 'old percentages cannot reconstruct answer history');
  const reloaded = boot(async () => response({ user: null }), saved);
  await settle();
  assert.equal(reloaded.evaluate('state.xp'), 50);
  const account = boot(async path => response(path === '/api/auth/me' ? { user } : { userId: user.id, progress: legacy, revision: 4 }));
  await settle();
  assert.equal(account.evaluate('state.xp'), 50);
  assert.equal(account.evaluate('state.xpVersion'), 2);
});


test('grammar resumes immediately after the saved answer, including a reload before Continue', async () => {
  const app = boot(async () => response({ user: null }));
  await settle();
  app.evaluate("state=structuredClone(defaultState);startRule('sein');answer(session.current.answer);answer(session.current.answer)");
  const saved = JSON.parse(app.storage.get('wortwerk-guest-progress'));
  assert.equal(saved.grammarProgress.sein.attempts, 1);
  assert.deepEqual(saved.grammarProgress.sein.answers, [true]);
  assert.equal(saved.xp, 1);
  const reloaded = boot(async () => response({ user: null }), saved);
  await settle();
  reloaded.evaluate("startRule('sein')");
  assert.equal(reloaded.evaluate('session.index'), 1);
  assert.match(reloaded.elements.get('#content').innerHTML, /1 \/ 32 correct/);
  reloaded.evaluate("answer('wrong')");
  const accountProgress = JSON.parse(reloaded.storage.get('wortwerk-guest-progress'));
  const accountApp = boot(async path => response(path === '/api/auth/me' ? { user } : { userId: user.id, progress: accountProgress, revision: 4 }));
  await settle();
  accountApp.evaluate("startRule('sein')");
  assert.equal(accountApp.evaluate('session.index'), 2);
  assert.equal(accountApp.evaluate("ruleStatus('sein').correct"), 1);
});

test('every grammar topic renders its exercise, theory and saved score', async () => {
  const app = boot(async () => response({ user: null }));
  await settle();
  for (const rule of RULES) {
    app.evaluate(`startRule(${JSON.stringify(rule.id)})`);
    const html = app.elements.get('#content').innerHTML;
    assert.ok(html.includes(`1/${rule.qs.length}`), rule.id);
    assert.ok(html.includes('Theory &amp; examples'), rule.id);
    assert.ok(html.includes(`0 / ${rule.qs.length} correct`), rule.id);
  }
  app.evaluate('renderGrammar()');
  assert.equal((app.elements.get('#content').innerHTML.match(/<article class="rule">/g) || []).length, 24);
});

test('grammar feedback and Continue appear before the supporting rule and theory', async () => {
  const app = boot(async () => response({ user: null }));
  await settle();
  app.evaluate("startRule('sein');answer(session.current.answer)");
  const html = app.elements.get('#content').innerHTML;
  assert.ok(html.indexOf('id="feedback"') < html.indexOf('class="mastery-note"'));
  assert.ok(html.indexOf('id="next"') < html.indexOf('class="rule-theory"'));
});

test('shorter cycles carry their score and can pass on the first answer of a later cycle', async () => {
  const app = boot(async () => response({ user: null }));
  await settle();
  app.evaluate("state=structuredClone(defaultState);startRule('sein')");
  for (let i = 0; i < 32; i++) {
    app.evaluate(i < 5 ? "answer('wrong')" : 'answer(session.current.answer)');
    app.elements.get('#next').onclick();
  }
  assert.equal(app.evaluate("ruleStatus('sein').passed"), false);
  assert.equal(app.evaluate("ruleStatus('sein').correct"), 27);
  assert.match(app.elements.get('#content').innerHTML, /score carried over/);
  app.elements.get('#again').onclick();
  assert.equal(app.evaluate('session.index'), 0);
  assert.equal(app.evaluate("ruleStatus('sein').correct"), 27);
  app.evaluate('answer(session.current.answer)');
  assert.equal(app.evaluate("ruleStatus('sein').correct"), 28);
  assert.equal(app.evaluate("ruleStatus('sein').passed"), true);
  assert.equal(app.evaluate('state.xp'), 28);
  app.elements.get('#next').onclick();
  assert.match(app.elements.get('#content').innerHTML, /Rule passed!/);
  assert.equal(app.elements.get('#totalMastery').textContent, '1 grammar rules passed');
  app.evaluate('renderGrammar()');
  assert.match(app.elements.get('#content').innerHTML, /A1 · Passed/);
  assert.match(app.elements.get('#content').innerHTML, /28 \/ 32 correct/);
  assert.equal(app.evaluate('nextRule().id'), 'present');
});
