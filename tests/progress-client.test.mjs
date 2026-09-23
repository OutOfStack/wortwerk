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
  assert.equal(WORDS.length, 1194);
  assert.ok(WORDS.slice(1000).every((word, i) => word.id === 1000 + i), 'new words append new IDs');
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
function boot(fetch, guestProgress = { ...empty(), xp: 555 }, windowExtras = {}) {
  const elements = new Map();
  const element = () => ({ textContent: '', innerHTML: '', classList: { add() {}, remove() {}, toggle() {} }, style: { setProperty() {} }, setAttribute() {}, replaceChildren() {}, append() {} });
  const storage = new Map([['wortwerk-progress', JSON.stringify({ ...empty(), xp: 99999 })], ['wortwerk-guest-progress', JSON.stringify(guestProgress)]]);
  const context = vm.createContext({
    structuredClone, setTimeout, clearTimeout, fetch,
    ...levels, ...grammar, RULES, THEORY, VOCABULARY_VERSION,
    document: { querySelector: s => { if (!elements.has(s)) elements.set(s, element()); return elements.get(s); }, querySelectorAll: () => [], createElement: element },
    localStorage: { getItem: k => storage.get(k), setItem: (k, v) => storage.set(k, v) },
    window: { addEventListener() {}, ...windowExtras }, location: { assign() {} },
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

test('typed answers earn 2 XP, chosen answers 1, and mistakes or double submissions earn nothing', async () => {
  const app = boot(async () => response({ user: null }));
  await settle();
  app.evaluate("state=structuredClone(defaultState);session={type:'words',pool:[WORDS[2]],items:[WORDS[2]],index:0,roundCorrect:0,current:{kind:'type',answer:WORDS[2].de,word:WORDS[2]}}");
  app.evaluate("answer('kaese');answer('kaese')");
  assert.equal(app.evaluate('state.xp'), 2, 'typed vocabulary');
  app.evaluate('finishSession()');
  assert.match(app.elements.get('#content').innerHTML, /<strong>\+2<\/strong><small>XP earned/);
  app.evaluate("session.locked=false;answer('Brot')");
  assert.equal(app.evaluate('state.xp'), 2);
  app.evaluate("session={type:'words',pool:[WORDS[2]],items:[WORDS[2]],index:0,roundCorrect:0,current:{kind:'letters',answer:'Käse',word:WORDS[2]}};answer('Käse')");
  assert.equal(app.evaluate('state.xp'), 3, 'letter building counts as choosing');
  app.evaluate("session={type:'words',pool:[WORDS[2]],items:[WORDS[2]],index:0,roundCorrect:0,current:{kind:'choice',answer:'cheese',word:WORDS[2]}};answer('cheese')");
  assert.equal(app.evaluate('state.xp'), 4);
  app.evaluate("session={type:'grammar',rule:RULES[0],items:RULES[0].qs,index:0,roundCorrect:0,current:{answer:'bin',kind:'choice'}};answer('bin');answer('bin')");
  assert.equal(app.evaluate('state.xp'), 5, 'chosen grammar');
  app.evaluate("session.locked=false;answer('bist')");
  assert.equal(app.evaluate('state.xp'), 5);
  app.evaluate("session.locked=false;session.current={answer:'bin',kind:'type',prompt:'Ich ___ müde.'};answer('BIN')");
  assert.equal(app.evaluate('state.xp'), 7, 'typed grammar');
  app.evaluate('finishSession()');
  assert.match(app.elements.get('#content').innerHTML, /<strong>\+3<\/strong><small>XP earned this visit/);
  assert.equal(JSON.parse(app.storage.get('wortwerk-guest-progress')).xpVersion, 2);
});

test('sidebar promotes at the threshold and shows remaining progress in the new level', async () => {
  const app = boot(async () => response({ user: null }));
  await settle();
  app.evaluate('state.xp=30;updateChrome()');
  assert.equal(app.elements.get('#levelNumber').textContent, 2);
  assert.equal(app.elements.get('#rankName').textContent, 'Holz 2');
  assert.equal(app.elements.get('#rankProgress').textContent, '0 / 42 XP · Level 2');
  app.evaluate('state.xp=75;renderProgress()');
  assert.match(app.elements.get('#content').innerHTML, /Practice rank · Level 3/);
  assert.match(app.elements.get('#content').innerHTML, /56 XP to/);
  assert.match(app.elements.get('#content').innerHTML, /Level 27 · Diamant 3 <small lang="en">diamond/);
  assert.doesNotMatch(app.elements.get('#content').innerHTML, /military|Marshal|Cadet|Level 28/);
  app.evaluate('state.xp=600000;updateChrome();renderProgress()');
  assert.equal(app.elements.get('#rankProgress').textContent, '600,000 XP · Top level');
  assert.match(app.elements.get('#content').innerHTML, /Top level reached/);
  assert.doesNotMatch(app.elements.get('#content').innerHTML, /XP to <strong>|null|NaN/);
  app.evaluate('renderHelp()');
  const help = app.elements.get('#content').innerHTML;
  for (const text of ['Typing the answer</th><td>2 XP', 'building from letters</th><td>1 XP', '474,743 XP', 'Level 27 is the top level']) assert.ok(help.includes(text), text);
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
  assert.match(reloaded.elements.get('#content').innerHTML, /This visit accuracy: No answers yet[\s\S]*First round: 1\/32 answered/);
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
    assert.ok(html.includes(`Pass with ${Math.ceil(rule.qs.length * 7 / 8)}/${rule.qs.length} correct in a full round`), rule.id);
    assert.ok(html.includes('No answers yet'), rule.id);
    assert.doesNotMatch(html, /answers recorded|Keys 1/, rule.id);
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
  assert.match(app.elements.get('#content').innerHTML, /recent answers carried over/);
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
  assert.match(app.elements.get('#content').innerHTML, /Recent accuracy: 88% · 28\/32 correct[\s\S]*Latest 32 answers · Passed/);
  assert.equal(app.evaluate('nextRule().id'), 'present');
});

test('vocabulary rounds add English-to-German recognition and noun gender practice', async () => {
  const app = boot(async () => response({ user: null }));
  await settle();
  const cheese = WORDS.find(word => word.de === 'der Käse');
  const reverse = app.evaluate(`wordForm(WORDS.find(word=>word.id===${cheese.id}),3)`);
  assert.equal(reverse.kind, 'choice');
  assert.equal(reverse.prompt, 'cheese');
  assert.equal(reverse.opts.length, 4);
  assert.equal(reverse.opts.filter(option => option === 'der Käse').length, 1);
  for (const option of reverse.opts) assert.ok(WORDS.some(word => word.de === option && word.pos === 'noun'), option);
  const gender = app.evaluate(`wordForm(WORDS.find(word=>word.id===${cheese.id}),5)`);
  assert.deepEqual({ ...gender, opts: [...gender.opts] }, { label: 'Choose the article', prompt: '___ Käse', promptLang: 'de', hint: 'cheese', answer: 'der', kind: 'choice', opts: ['der', 'die', 'das'], optsLang: 'de' });
  const verb = WORDS.find(word => word.de === 'kommen');
  assert.equal(app.evaluate(`wordForm(WORDS.find(word=>word.id===${verb.id}),5).kind`), 'letters', 'only nouns get article practice');
  assert.equal(app.evaluate(`wordForm(WORDS.find(word=>word.id===${verb.id}),7).kind`), 'type');
});

test('streaks follow calendar days and the log keeps the latest 60 days', async () => {
  const app = boot(async () => response({ user: null }), empty());
  await settle();
  assert.equal(app.evaluate('currentStreak()'), 0, 'a stored streak without recent practice is not shown');
  app.evaluate("state.streak=4;state.activityLog={[dayKey(daysAgo(1))]:3};recordActivity()");
  assert.equal(app.evaluate('state.streak'), 5);
  app.evaluate('recordActivity()');
  assert.equal(app.evaluate('state.streak'), 5, 'further answers today do not extend the streak');
  assert.equal(app.evaluate('answersOn(daysAgo(0))'), 2);
  app.evaluate("state.activityLog={[dayKey(daysAgo(2))]:1};state.streak=9;recordActivity()");
  assert.equal(app.evaluate('state.streak'), 1, 'a missed day restarts the streak');
  app.evaluate('state.activityLog=Object.fromEntries([...Array(70).keys()].map(i=>[dayKey(daysAgo(i+1)),1]));recordActivity()');
  assert.equal(app.evaluate('Object.keys(state.activityLog).length'), 60);
  assert.equal(app.evaluate('answersOn(daysAgo(0))'), 1);
  app.evaluate('renderProgress()');
  assert.match(app.elements.get('#content').innerHTML, /Last 7 days/);
});

test('grammar feedback completes the sentence and typed grammar answers keep articles', async () => {
  const app = boot(async () => response({ user: null }));
  await settle();
  const complete = (prompt, answer) => app.evaluate(`completedSentence(${JSON.stringify(prompt)},${JSON.stringify(answer)})`);
  assert.match(complete('Ich ___ müde.', 'bin'), /Ich <mark>bin<\/mark> müde\./);
  assert.match(complete('Das ist ___ Tasche. (your (several friends))', 'eure'), /Das ist <mark>eure<\/mark> Tasche\.<\/span>$/);
  assert.match(complete('Use a subject pronoun for “Paul”: ___ ist hier.', 'er'), />\s*<mark>Er<\/mark> ist hier\./);
  assert.equal(complete('Choose the plural of “das Buch”.', 'Bücher'), '');
  app.evaluate("session={type:'grammar',current:{kind:'type',answer:'dem',prompt:'Ich helfe ___ Kind.'}}");
  for (const value of ['dem', ' DEM ']) assert.equal(app.evaluate(`matchesAnswer(${JSON.stringify(value)})`), true, value);
  for (const value of ['den', 'Kind', '']) assert.equal(app.evaluate(`matchesAnswer(${JSON.stringify(value)})`), false, value);
  app.evaluate("session.current.answer='Bücher'");
  assert.equal(app.evaluate("matchesAnswer('buecher')"), true);
  app.evaluate("session.current.answer='heißt'");
  assert.equal(app.evaluate("matchesAnswer('heisst')"), true);
  assert.equal(app.evaluate("canType(['Ich ___ müde.','bin',['bist','ist']])"), true);
  assert.equal(app.evaluate("canType(['Choose…','Heute trinkt Anna Tee.',['a','b']])"), false);
  assert.equal(app.evaluate("canType(['Countable?','Zählbar',['Unzählbar']])"), false);
});

test('later grammar rounds draw a stable mix from the larger bank', async () => {
  const app = boot(async () => response({ user: null }), { ...empty(), grammarProgress: { sein: { answers: Array(32).fill(true), attempts: 32, passed: true } } });
  await settle();
  app.evaluate("startRule('sein')");
  assert.equal(app.evaluate('session.cycle'), 1);
  assert.equal(app.evaluate('session.index'), 0);
  const first = app.evaluate('JSON.stringify(session.items.map(q=>q[0]))');
  assert.notEqual(first, JSON.stringify(RULES[0].qs.map(q => q[0])));
  assert.match(app.elements.get('#content').innerHTML, /sein — to be · Round 2</);
  app.evaluate("startRule('sein')");
  assert.equal(app.evaluate('JSON.stringify(session.items.map(q=>q[0]))'), first, 'a reload resumes the same round');
  app.evaluate("answer('wrong')");
  assert.equal(app.evaluate('session.missed.length'), 1);
});

test('word search ignores articles, case and umlaut spelling', async () => {
  const app = boot(async () => response({ user: null }));
  await settle();
  for (const query of ['Käse', 'kaese', 'KASE', 'der käse', 'cheese']) {
    assert.equal(app.evaluate(`WORDS.filter(w=>searchKey(w.de).includes(searchKey(${JSON.stringify(query)}))||w.en.split(' / ').some(en=>searchKey(en).includes(searchKey(${JSON.stringify(query)})))).some(w=>w.de==='der Käse')`), true, query);
  }
  app.evaluate("renderWords();renderWordResults('Kaese')");
  assert.match(app.elements.get('#wordResults').innerHTML, /der Käse/);
  app.evaluate("renderWordResults('zzzz')");
  assert.match(app.elements.get('#wordResults').innerHTML, /No matching words/);
});

test('pronunciation uses a German browser voice, auto-plays answers and hides without speech support', async () => {
  const silent = boot(async () => response({ user: null }));
  await settle();
  silent.evaluate("session={type:'words',current:{kind:'type',answer:'Käse',word:{de:'der Käse',en:'cheese'}}}");
  assert.doesNotMatch(silent.evaluate('answerFeedback(true)'), /data-speak/);
  assert.equal(silent.elements.get('#soundBtn').hidden, true);

  const spoken = [];
  class SpeechSynthesisUtterance { constructor(text) { this.text = text; } }
  const speechSynthesis = {
    getVoices: () => [{ lang: 'en-US', name: 'English' }, { lang: 'de-AT', name: 'Austrian' }, { lang: 'de-DE', name: 'Google Deutsch' }],
    cancel() {}, speak: utterance => spoken.push(utterance), addEventListener() {},
  };
  const app = boot(async () => response({ user: null }), empty(), { speechSynthesis, SpeechSynthesisUtterance });
  await settle();
  assert.equal(app.elements.get('#soundBtn').hidden, false);
  app.evaluate("state=structuredClone(defaultState);session={type:'words',pool:[WORDS[2]],items:[WORDS[2]],index:0,roundCorrect:0,current:{kind:'type',answer:WORDS[2].de,word:WORDS[2]}};answer('kaese')");
  assert.equal(spoken.at(-1).text, 'der Käse', 'the full word with its article is read after answering');
  assert.equal(spoken.at(-1).lang, 'de-DE');
  assert.equal(spoken.at(-1).voice.name, 'Google Deutsch');
  assert.match(app.elements.get('#feedback').innerHTML, /data-speak="der Käse"/);
  app.evaluate("state.sound=false;session.locked=false;answer('kaese')");
  assert.equal(spoken.length, 1, 'auto-play follows the sound setting');
  app.elements.get('#soundBtn').onclick();
  assert.equal(app.evaluate('state.sound'), true);
  assert.equal(app.evaluate("grammarSpeech('Ich weiß, dass ___. (ich / bin / müde)','ich müde bin')"), 'Ich weiß, dass ich müde bin.');
  assert.equal(app.evaluate("grammarSpeech('Use a subject pronoun for “Paul”: ___ ist hier.','er')"), 'Er ist hier.');
  assert.equal(app.evaluate("grammarSpeech('Choose the correct statement: heute / ich / lerne / Deutsch','Heute lerne ich Deutsch.')"), 'Heute lerne ich Deutsch.');
  assert.equal(app.evaluate("grammarSpeech('Choose the plural of “das Buch”.','Bücher')"), '', 'isolated forms are not read out of context');
  assert.doesNotMatch(app.evaluate("promptBox('cheese','','')"), /data-speak/, 'English prompts never reveal the German answer');
});

test('separable verbs use two gaps so the infinitive cue cannot reveal the prefix', async () => {
  const separable = RULES.find(rule => rule.id === 'separable');
  const all = [...separable.qs, ...separable.extra];
  assert.ok(all.every(([prompt, answer]) => !/\((\w+)\)$/.test(prompt) || !/^(auf|an|ein|aus|ab|mit|zu|vor|zurück|fern)$/.test(answer)), 'no single-prefix answers with a German infinitive cue');
  const found = all.find(([prompt]) => prompt === 'Ich ___ morgen ___. (ankommen)');
  assert.deepEqual([found[1], [...found[2]].sort()], ['komme … an', ['ankomme … —', 'komme … —', '— … ankomme']]);
  assert.ok(all.every(([prompt]) => !/___ .* (auf|an|ein|aus|ab|mit|zu|vor|zurück|fern)\. \(/.test(prompt)), 'the sentence never prints the prefix already');
  const persons = ([, answer, options]) => new Set(options.map(option => option.split(' … ').find(part => part !== '—').replace(new RegExp(`^${answer.split(' … ')[1]}`), '')));
  assert.ok(all.filter(([, answer]) => answer.includes(' … ')).every(item => persons(item).size === 1), 'main-clause options all share one verb form, so person agreement gives nothing away');
  const modal = RULES.find(rule => rule.id === 'modal');
  assert.ok([...modal.qs, ...modal.extra].every(([prompt]) => !/\((können|müssen|wollen|dürfen|sollen|möchten)\)/.test(prompt)), 'modal cues are English');
  const app = boot(async () => response({ user: null }));
  await settle();
  const complete = (prompt, answer) => app.evaluate(`completedSentence(${JSON.stringify(prompt)},${JSON.stringify(answer)})`);
  assert.match(complete('Ich ___ morgen ___. (ankommen)', 'komme … an'), />Ich <mark>komme<\/mark> morgen <mark>an<\/mark>\.</);
  assert.match(complete('Ich ___ morgen ___. (ankommen)', 'ankomme … —'), />Ich <mark>ankomme<\/mark> morgen\.</);
  assert.equal(app.evaluate("grammarSpeech('Wir ___ abends ___. (fernsehen)','sehen … fern')"), 'Wir sehen abends fern.');
  assert.equal(app.evaluate("canType(['Ich ___ morgen ___. (ankommen)','komme … an',['ankomme … —']])"), false);
});

test('grammar feedback offers an English translation on request', async () => {
  const plain = boot(async () => response({ user: null }));
  await settle();
  assert.equal(plain.evaluate("translateButton('')"), '', 'isolated forms get no translation');
  assert.match(plain.evaluate("translateButton('Du kommst heute mit.')"), /href="https:\/\/translate\.google\.com\/\?sl=de&amp;tl=en&amp;op=translate&amp;text=Du%20kommst%20heute%20mit\."/, 'browsers without a translator link to Google Translate');
  plain.evaluate("session={type:'grammar',rule:RULES.find(r=>r.id==='separable'),current:{kind:'choice',prompt:'Du ___ heute ___. (mitkommen)',answer:'kommst … mit'}}");
  assert.match(plain.evaluate('answerFeedback(true)'), /class="translate"/);

  let created = 0, fail = false;
  let availability = 'available';
  const Translator = { availability: async () => availability, create: async ({ sourceLanguage, targetLanguage }) => {
    created++;
    if (fail) throw new Error('unavailable');
    return { translate: async text => `[${sourceLanguage}→${targetLanguage}] ${text}` };
  } };
  const app = boot(async () => response({ user: null }), empty(), { Translator });
  await settle();
  const button = text => { const shown = {}; return { shown, dataset: { translate: text }, replaceWith: out => { shown.out = out; } }; };
  assert.match(app.evaluate("translateButton('Ich bin hier.')"), /<button[^>]+data-translate="Ich bin hier\."[^>]*>EN<\/button>/);
  const first = button('Ich bin hier.');
  await app.evaluate('showTranslation')(first);
  assert.equal(first.shown.out.textContent, '[de→en] Ich bin hier.');
  const again = button('Ich bin hier.');
  await app.evaluate('showTranslation')(again);
  const other = button('Du bist da.');
  await app.evaluate('showTranslation')(other);
  assert.equal(created, 1, 'one translator is reused and results are cached');
  assert.equal(other.shown.out.textContent, '[de→en] Du bist da.');

  const broken = boot(async () => response({ user: null }), empty(), { Translator });
  await settle();
  fail = true;
  const failed = button('Wir sind hier.');
  await broken.evaluate('showTranslation')(failed);
  assert.match(failed.shown.out.innerHTML, /Open Google Translate/, 'a failed download falls back to the link');
  assert.match(broken.evaluate("translateButton('Wir sind hier.')"), /translate\.google\.com/, 'later sentences go straight to the link');

  const unsupported = boot(async () => response({ user: null }), empty(), { Translator });
  await settle();
  availability = 'unavailable';
  const before = created;
  const skipped = button('Ihr seid hier.');
  await unsupported.evaluate('showTranslation')(skipped);
  assert.match(skipped.shown.out.innerHTML, /Open Google Translate/);
  assert.equal(created, before, 'no download is attempted for an unsupported language pair');
});

test('guided practice starts above stats with new A1 words and the exact advertised selection', async () => {
  const app = boot(async () => response({ user: null }), empty());
  await settle();
  const html = app.elements.get('#content').innerHTML;
  assert.ok(html.indexOf('id="guidedStart"') < html.indexOf('class="stats"'));
  assert.match(html, /8 new A1 words/);
  assert.doesNotMatch(html, /0%<\/strong><small>answer accuracy/);
  app.elements.get('#guidedStart').onclick();
  assert.equal(app.evaluate('session.guided'), true);
  assert.equal(app.evaluate('session.items.length'), 8);
  assert.equal(app.evaluate("session.items.every(word=>word.level==='A1')"), true);
  assert.equal(app.evaluate('new Set(session.items.map(word=>word.id)).size'), 8);
});

test('guided rounds balance revisits and new words, exclude complete words, and handle exhaustion', async () => {
  const app = boot(async () => response({ user: null }), empty());
  await settle();
  app.evaluate('state.wordMastery=Object.fromEntries(WORDS.slice(0,6).map(word=>[word.id,0]));state.wordCorrectCounts={6:8};state.knownWordIds=["7"];startGuidedRound()');
  assert.equal(app.evaluate('session.items.filter(wasPractised).length'), 4, 'even words answered incorrectly are revisited');
  assert.equal(app.evaluate('session.items.some(word=>word.id===6||word.id===7)'), false);
  assert.equal(app.evaluate("session.items.filter(word=>!wasPractised(word)).every(word=>word.level==='A1')"), true);
  app.evaluate('state.knownWordIds=WORDS.slice(2).map(word=>String(word.id));startGuidedRound()');
  assert.equal(app.evaluate('session.items.length'), 2, 'a small pool produces a short round');
  app.evaluate('state.knownWordIds=WORDS.map(word=>String(word.id));renderToday()');
  assert.match(app.elements.get('#content').innerHTML, /Continue grammar/);
  app.elements.get('#guidedStart').onclick();
  assert.equal(app.evaluate('session.type'), 'grammar', 'a finished vocabulary pool has a useful next action');
});

test('grammar distinguishes unanswered, accuracy, completion, and earned passes', async () => {
  const app = boot(async () => response({ user: null }), empty());
  await settle();
  app.evaluate("startRule('sein')");
  assert.match(app.elements.get('#content').innerHTML, /No answers yet/);
  app.evaluate('answer(session.current.answer)');
  const score = app.elements.get('#grammarScore').innerHTML;
  assert.match(score, /This visit accuracy: 100% · 1\/1 correct/);
  assert.match(app.evaluate("ruleScore(ruleStatus('sein'))"), /Recent accuracy: 100% · 1\/1 correct/);
  assert.match(score, /First round: 1\/32 answered/);
  assert.doesNotMatch(score, /Score 3%|Passed/);
  app.elements.get('#next').onclick();
  app.evaluate("answer('wrong')");
  assert.match(app.elements.get('#grammarScore').innerHTML, /50% · 1\/2 correct/);
  app.evaluate("state.grammarProgress.sein={answers:Array(32).fill(false),attempts:64,passed:true};renderGrammar()");
  assert.match(app.elements.get('#content').innerHTML, /Recent accuracy: 0% · 0\/32 correct/);
  assert.match(app.elements.get('#content').innerHTML, /Latest 32 answers · Passed/);
});

test('word retries contain only missed words and narrow to remaining mistakes', async () => {
  const app = boot(async () => response({ user: null }), empty());
  await settle();
  app.evaluate('startWordRound(WORDS.slice(0,3),WORDS,{guided:true})');
  for (let i=0;i<3;i++) {
    app.evaluate(i<2?"answer('wrong')":'answer(session.current.answer)');
    app.elements.get('#next').onclick();
  }
  assert.match(app.elements.get('#content').innerHTML, /Practise 2 mistakes again/);
  app.elements.get('#retryMistakes').onclick();
  assert.equal(JSON.stringify(app.evaluate('session.items.map(word=>word.id)')), '[0,1]');
  assert.equal(app.evaluate('session.guided'), true);
  app.evaluate('answer(session.current.answer);answer(session.current.answer)');
  app.elements.get('#next').onclick();
  app.evaluate("answer('wrong')");
  app.elements.get('#next').onclick();
  assert.match(app.elements.get('#content').innerHTML, /Practise 1 mistake again/);
  app.elements.get('#retryMistakes').onclick();
  assert.equal(JSON.stringify(app.evaluate('session.items.map(word=>word.id)')), '[1]');
  app.evaluate('answer(session.current.answer)');
  app.elements.get('#next').onclick();
  assert.match(app.elements.get('#content').innerHTML, /Mistakes revisited!/);
  assert.doesNotMatch(app.elements.get('#content').innerHTML, /id="retryMistakes"/);
  const saved = JSON.parse(app.storage.get('wortwerk-guest-progress'));
  assert.deepEqual(saved.wordCorrectCounts, {'0':1,'1':1,'2':1});
  assert.equal(saved.xp, 3);
  assert.equal(saved.answered, 6);
  app.elements.get('#done').onclick();
  assert.equal(app.evaluate('currentView'), 'today');
});

test('grammar retries preserve the assessment and saved position while awarding normal XP', async () => {
  const app = boot(async () => response({ user: null }), empty());
  await settle();
  app.evaluate("startRule('sein')");
  for (let i=0;i<32;i++) {
    app.evaluate(i<5?"answer('wrong')":'answer(session.current.answer)');
    app.elements.get('#next').onclick();
  }
  const before = JSON.stringify(app.evaluate('state.grammarProgress.sein'));
  assert.match(app.elements.get('#content').innerHTML, /Practise 5 mistakes again/);
  app.elements.get('#retryMistakes').onclick();
  assert.equal(app.evaluate('session.items.length'), 5);
  assert.equal(app.evaluate('session.items.every((q,i)=>q===RULES[0].qs[i])'), true);
  for (let i=0;i<5;i++) {
    app.evaluate(i===0?"answer('wrong')":'answer(session.current.answer)');
    app.elements.get('#next').onclick();
  }
  assert.equal(JSON.stringify(app.evaluate('state.grammarProgress.sein')), before);
  app.elements.get('#retryMistakes').onclick();
  assert.equal(app.evaluate('session.items.length'), 1);
  app.evaluate('answer(session.current.answer);answer(session.current.answer)');
  app.elements.get('#next').onclick();
  assert.match(app.elements.get('#content').innerHTML, /Mistakes revisited!/);
  assert.doesNotMatch(app.elements.get('#content').innerHTML, /id="retryMistakes"|Rule passed!/);
  const saved = JSON.parse(app.storage.get('wortwerk-guest-progress'));
  assert.equal(JSON.stringify(saved.grammarProgress.sein), before);
  assert.equal(saved.xp, 32);
  assert.equal(saved.answered, 38);
  app.elements.get('#again').onclick();
  assert.equal(app.evaluate('session.cycle'), 1);
  assert.equal(app.evaluate('session.index'), 0);
  assert.equal(app.evaluate("ruleStatus('sein').passed"), false);
  const reloaded = boot(async () => response({ user: null }), saved);
  await settle();
  reloaded.evaluate("startRule('sein')");
  assert.equal(reloaded.evaluate('session.cycle'), 1);
  assert.equal(reloaded.evaluate('session.index'), 0);
});

test('perfect rounds do not offer a mistake retry and known words stay excluded on retry', async () => {
  const app = boot(async () => response({ user: null }), empty());
  await settle();
  app.evaluate('startWordRound([WORDS[0]],WORDS);answer(session.current.answer)');
  app.elements.get('#next').onclick();
  assert.doesNotMatch(app.elements.get('#content').innerHTML, /id="retryMistakes"/);
  app.evaluate("startWordRound([WORDS[1]],WORDS);answer('wrong')");
  app.elements.get('#next').onclick();
  app.elements.get('#retryMistakes').onclick();
  app.elements.get('#knowWord').onclick();
  app.elements.get('#next').onclick();
  assert.match(app.elements.get('#content').innerHTML, /1 marked known without XP/);
  assert.doesNotMatch(app.elements.get('#content').innerHTML, /id="retryMistakes"|NaN|Infinity/);
  assert.equal(app.evaluate('pendingWords([WORDS[1]]).length'), 0);
});
