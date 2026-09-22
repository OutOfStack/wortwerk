import assert from 'node:assert/strict';
import { test } from 'node:test';
import { RULES } from '../public/grammar.js';
import { THEORY } from '../public/grammar-theory.js';
import { RULE_IDS, ruleTarget, recordGrammarAnswer, grammarStatus, exerciseDeck } from '../public/grammar-progress.js';
import { upgradeProgress } from '../public/levels.js';

test('every grammar rule has its configured number of distinct exercises with one answer option', () => {
  assert.deepEqual(RULES.map(rule => rule.id), RULE_IDS);
  assert.equal(RULES.length, 24);
  assert.equal(RULES.reduce((count, rule) => count + rule.qs.length, 0), 1500);
  for (const rule of RULES) {
    assert.equal(rule.qs.length, ruleTarget(rule.id).size, rule.id);
    assert.equal(new Set(rule.qs.map(([prompt]) => prompt)).size, ruleTarget(rule.id).size, rule.id);
    for (const [prompt, answer, distractors] of rule.qs) {
      assert.ok(prompt && answer);
      assert.ok(distractors.length >= 1, prompt);
      assert.equal(new Set([answer, ...distractors]).size, distractors.length + 1, prompt);
      const normalized = [answer, ...distractors].map(value => value.toLowerCase().trim().replace(/[.!?]/g, '').replace(/\s+/g, ' '));
      assert.equal(new Set(normalized).size, normalized.length, `Case-insensitive answer collision: ${prompt}`);
    }
    const theory = THEORY[rule.id];
    assert.ok(theory.explanation && theory.note && theory.examples.length >= 2, rule.id);
    assert.ok(theory.rows.every(row => row.length === theory.headers.length), rule.id);
  }
  assert.ok(RULES.find(rule => rule.id === 'perfect').qs.some(([prompt, answer]) => prompt.includes('nach Berlin gefahren') && answer === 'bin'));
  assert.ok(RULES.find(rule => rule.id === 'dative').qs.some(([prompt, answer]) => prompt.includes('mit ___ Frau') && answer === 'der'));
  assert.ok(RULES.find(rule => rule.id === 'dative').qs.some(([prompt, answer]) => prompt.includes('helfe ___ Kind') && answer === 'dem'));
});

test('new topics cover plural patterns, pronoun roles and case-sensitive endings', () => {
  const answerFor = (id, prompt) => {
    const found = RULES.find(rule => rule.id === id).qs.find(([text]) => text === prompt);
    assert.ok(found, `${id}: ${prompt}`);
    return found[1];
  };
  assert.equal(answerFor('plural', 'Choose the plural of “das Buch”.'), 'Bücher');
  assert.equal(answerFor('plural', 'Choose the plural of “das Fenster”.'), 'Fenster');
  assert.equal(answerFor('indefinite', 'Das ist ___ Tisch. (a / an)'), 'ein');
  assert.equal(answerFor('indefinite', 'Ich sehe ___ Tisch. (a / an)'), 'einen');
  assert.equal(answerFor('personal', 'Use a subject pronoun for “das Buch”: ___ ist hier.'), 'es');
  assert.equal(answerFor('personal', 'Use a subject pronoun for “I am addressing an adult formally”: ___ sind hier.'), 'Sie');
  assert.equal(answerFor('possessive', 'Das ist ___ Buch. (my)'), 'mein');
  assert.equal(answerFor('possessive', 'Wem gehört das Buch? — Das ist ___. (mine)'), 'meins');
  assert.equal(answerFor('possessive', 'Wem gehört der Tisch? — Das ist ___. (ours)'), 'unserer');
  assert.equal(answerFor('possessive', 'Das ist ___ Tasche. (your (several friends))'), 'eure');
  assert.equal(answerFor('possessive', 'Wem gehört das Buch? — Das ist ___. (yours (formal))'), 'Ihres');
  assert.equal(answerFor('nominative', 'Das ist ___ Tisch. (the; after sein)'), 'der');
  assert.equal(answerFor('demonstrative', 'Ich sehe ___ Tisch. (this)'), 'diesen');
  assert.equal(answerFor('demonstrative', 'Ich stehe bei ___ Tasche. (this)'), 'dieser');
  assert.equal(answerFor('local', 'Die Lampe ist auf ___ Tisch. (Wo?)'), 'dem');
  assert.equal(answerFor('local', 'Ich stelle die Lampe auf ___ Tisch. (Wohin? New position.)'), 'den');
  assert.equal(answerFor('wquestions', '___ besucht Anna? — Den Bruder.'), 'Wen');
  assert.equal(answerFor('wquestions', '___ hilft Anna? — Der Schwester.'), 'Wem');
  assert.equal(answerFor('prepositions', 'Anna lernt ___ einem Jahr Deutsch. (for a year, continuing now)'), 'seit');
});

test('every topic requires a full window and rounds its 87.5% passing target up', () => {
  for (const id of RULE_IDS) {
    const { size, target } = ruleTarget(id);
    assert.equal(target, Math.ceil(size * 7 / 8));
    let perfect;
    for (let i = 0; i < size - 1; i++) perfect = recordGrammarAnswer(perfect, true, id);
    assert.equal(perfect.passed, false, id);
    assert.equal(recordGrammarAnswer(perfect, true, id).passed, true, id);
    for (const correct of [target - 1, target]) {
      let attempt;
      for (let i = 0; i < size; i++) attempt = recordGrammarAnswer(attempt, i < correct, id);
      assert.equal(attempt.passed, correct === target, id);
      assert.equal(grammarStatus(attempt, id).correct, correct);
      assert.equal(grammarStatus(attempt, id).next, 0);
    }
  }
});

test('sein exercises use varied subjects and situations instead of repeated templates', () => {
  const exercises = RULES.find(rule => rule.id === 'sein').qs;
  const subjects = exercises.map(([prompt]) => prompt.split(' ___ ')[0]);
  const situations = exercises.map(([prompt]) => prompt.split(' ___ ')[1]);
  assert.ok(new Set(subjects).size >= 20);
  assert.equal(new Set(situations).size, exercises.length);
});

test('rolling windows replace the oldest answer and retain passed status at every topic size', () => {
  for (const id of RULE_IDS) {
    const { size, target } = ruleTarget(id);
    let progress;
    for (let i = 0; i < size; i++) progress = recordGrammarAnswer(progress, i > size - target, id);
    assert.equal(grammarStatus(progress, id).correct, target - 1);
    progress = recordGrammarAnswer(progress, true, id);
    assert.equal(grammarStatus(progress, id).correct, target);
    assert.equal(grammarStatus(progress, id).next, 1);
    assert.equal(progress.passed, true);
    for (let i = 0; i < size; i++) progress = recordGrammarAnswer(progress, false, id);
    assert.equal(progress.answers.length, size);
    assert.equal(grammarStatus(progress, id).correct, 0);
    assert.equal(progress.passed, true);
    assert.equal(progress.attempts, size * 2 + 1);
    assert.equal(grammarStatus(progress, id).next, 1);

    let notPassed = { answers: [...Array(target - 1).fill(true), ...Array(size - target + 1).fill(false)], attempts: size, passed: false };
    notPassed = recordGrammarAnswer(notPassed, true, id);
    assert.equal(grammarStatus(notPassed, id).correct, target - 1, 'replacing correct with correct does not increase the score');
    notPassed = recordGrammarAnswer(notPassed, false, id);
    assert.equal(grammarStatus(notPassed, id).correct, target - 2);
  }
});

test('grammar migration preserves current XP and word counts without fabricating answer history', () => {
  const old = { xp: 157, xpVersion: 2, ruleMastery: { sein: 95 }, wordCorrectCounts: { 0: 8 } };
  const upgraded = upgradeProgress(old);
  assert.equal(upgraded.xp, 157);
  assert.equal(upgraded.grammarVersion, 3);
  assert.deepEqual(upgraded.grammarProgress, {});
  assert.deepEqual(upgraded.wordCorrectCounts, old.wordCorrectCounts);
  assert.equal('ruleMastery' in upgraded, false);
  assert.deepEqual(old.ruleMastery, { sein: 95 }, 'migration does not mutate its input');
  assert.deepEqual(upgradeProgress(upgraded), upgraded);
});


test('old 80-answer windows shrink without losing XP, attempts or earned completion', () => {
  const old = { xp: 99, xpVersion: 2, grammarVersion: 1, grammarProgress: {
    sein: { answers: [...Array(48).fill(true), ...Array(32).fill(false)], attempts: 95, passed: true },
    indefinite: { answers: [...Array(45).fill(false), ...Array(35).fill(true)], attempts: 80, passed: false },
  } };
  const upgraded = upgradeProgress(old);
  assert.equal(upgraded.xp, 99);
  assert.equal(upgraded.grammarProgress.sein.answers.length, 32);
  assert.equal(upgraded.grammarProgress.sein.attempts, 95);
  assert.equal(upgraded.grammarProgress.sein.passed, true);
  assert.equal(grammarStatus(upgraded.grammarProgress.sein, 'sein').next, 31);
  assert.equal(upgraded.grammarProgress.indefinite.answers.length, 40);
  assert.equal(upgraded.grammarProgress.indefinite.passed, true, 'the retained 35 of 40 qualifies');
  assert.deepEqual(upgradeProgress(upgraded), upgraded);
  assert.equal(old.grammarProgress.sein.answers.length, 80);
});

test('new topics cover direction, separation, reflexive cases, participles and contextual countability', () => {
  const answerFor = (id, prompt) => RULES.find(rule => rule.id === id).qs.find(([text]) => text === prompt)?.[1];
  assert.equal(answerFor('localadverbs', 'Ich bin im Haus. Komm zu mir ___. (in, toward the speaker)'), 'herein');
  assert.equal(answerFor('separable', 'Ich sage, dass ich um sieben Uhr ___. (aufstehen)'), 'aufstehe');
  assert.equal(answerFor('separable', 'Du ___ abends fern. (fernsehen)'), 'siehst');
  assert.equal(answerFor('reflexive', 'Wir erinnern ___ an den Termin. (reflexive)'), 'uns');
  assert.equal(answerFor('reflexive', 'Ich wasche ___ die Hände. (my own hands)'), 'mir');
  assert.equal(answerFor('participle', 'Choose the Partizip II of “anrufen”.'), 'angerufen');
  assert.equal(answerFor('participle', 'Choose the Partizip II of “studieren”.'), 'studiert');
  assert.equal(answerFor('countable', 'Ich sehe ___ Bücher. (many individual objects)'), 'viele');
  assert.equal(answerFor('countable', 'Wir haben ___ Wasser. (a lot of the substance, not portions)'), 'viel');
  assert.equal(answerFor('separable', 'Ich weiß, dass du abends ___. (fernsehen)'), 'fernsiehst');
  assert.equal(answerFor('reflexive', 'Wir ärgern ___ über den Lärm. (reflexive)'), 'uns');
  assert.equal(answerFor('reflexive', 'Du merkst ___ die Adresse. (you memorize it)'), 'dir');
  assert.equal(answerFor('participle', 'Ich bin nach Berlin ___. (fahren, Perfekt)'), 'gefahren');
  assert.equal(answerFor('participle', 'Ich habe Medizin ___. (studieren, Perfekt)'), 'studiert');
});

test('expanded topics retain short histories and earned passes while unpassed histories fill to 80', () => {
  const old = { xp: 123, xpVersion: 2, grammarVersion: 2, grammarProgress: {
    present: { answers: Array(48).fill(true), attempts: 48, passed: true },
    perfect: { answers: [...Array(6).fill(false), ...Array(34).fill(true)], attempts: 120, passed: false },
  } };
  const upgraded = upgradeProgress(old);
  assert.equal(upgraded.grammarVersion, 3);
  assert.equal(upgraded.xp, old.xp);
  assert.deepEqual(upgraded.grammarProgress, old.grammarProgress);
  assert.deepEqual(upgradeProgress(upgraded), upgraded);
  let growing = upgraded.grammarProgress.perfect;
  for (let i = 0; i < 39; i++) growing = recordGrammarAnswer(growing, true, 'perfect');
  assert.equal(growing.answers.length, 79);
  assert.equal(growing.passed, false, 'even 73 correct needs a complete window');
  growing = recordGrammarAnswer(growing, true, 'perfect');
  assert.equal(growing.answers.length, 80);
  assert.equal(growing.passed, true);
  assert.equal(growing.attempts, 160);
  assert.equal(recordGrammarAnswer(growing, true, 'perfect').answers.filter(Boolean).length, 75);
  assert.equal(recordGrammarAnswer(upgraded.grammarProgress.present, false, 'present').passed, true);
});

test('extra exercise banks are valid, distinct from curated exercises and mixed into later rounds', () => {
  const normalized = value => value.toLowerCase().trim().replace(/[.!?]/g, '').replace(/\s+/g, ' ');
  for (const rule of RULES) {
    assert.ok(rule.extra.length >= 12, rule.id);
    const prompts = [...rule.qs, ...rule.extra].map(([prompt]) => prompt);
    assert.equal(new Set(prompts).size, prompts.length, `${rule.id}: duplicate prompt`);
    for (const [prompt, answer, distractors] of rule.extra) {
      assert.ok(prompt && answer && distractors.length >= 1, prompt);
      const options = [answer, ...distractors].map(normalized);
      assert.equal(new Set(options).size, options.length, `Answer collision: ${prompt}`);
    }
    assert.equal(exerciseDeck(rule, 0), rule.qs, 'the first round keeps the curated order');
    const size = ruleTarget(rule.id).size;
    for (const cycle of [1, 2, 7]) {
      const deck = exerciseDeck(rule, cycle);
      assert.equal(deck.length, size, rule.id);
      assert.equal(new Set(deck.map(([prompt]) => prompt)).size, size, `${rule.id}: repeated exercise in a round`);
      assert.deepEqual(exerciseDeck(rule, cycle), deck, 'rounds are deterministic');
    }
    assert.ok([1, 2, 3].some(cycle => exerciseDeck(rule, cycle).some(exercise => rule.extra.includes(exercise))), rule.id);
  }
});

test('conjugation and sentence fixes stay correct', () => {
  const all = RULES.flatMap(rule => [...rule.qs, ...rule.extra]);
  assert.ok(all.every(([prompt]) => !/rasiern|informiern|konzentriern/.test(prompt)));
  const find = (id, prompt) => [...RULES.find(rule => rule.id === id).qs, ...RULES.find(rule => rule.id === id).extra].find(([text]) => text === prompt)?.[1];
  assert.equal(find('reflexive', 'Wir rasieren ___ jeden Morgen. (reflexive)'), 'uns');
  assert.equal(find('reflexive', 'Wir ärgern ___ über den Lärm. (reflexive)'), 'uns');
  assert.equal(find('reflexive', 'Lena und ich kümmern ___ um die Katze. (reflexive)'), 'uns');
  assert.equal(find('wordorder', 'Choose the correct statement: am Montag / Anna / trinkt / Tee'), 'Am Montag trinkt Anna Tee.');
  assert.equal(find('modal', '___ ich hier rauchen? (dürfen)'), 'Darf');
  assert.equal(find('perfect', 'Die Kinder ___ in den Park gelaufen. (Perfekt)') ?? find('perfect', 'Mein Bruder ___ in den Park gelaufen. (Perfekt)'), 'ist');
  assert.equal(find('because', 'Ich komme später, weil ___. (ich / muss / noch arbeiten)'), 'ich noch arbeiten muss');
});
