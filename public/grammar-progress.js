import { RULE_IDS, ruleTarget } from './grammar-config.js';
export { RULE_IDS, ruleTarget } from './grammar-config.js';
export const GRAMMAR_VERSION = 3;

export function grammarStatus(progress, id) {
  const { size, target } = ruleTarget(id);
  const answers = progress?.answers || [];
  const correct = answers.filter(Boolean).length;
  const attempts = progress?.attempts || 0;
  return {
    size, target, correct, answered: answers.length, attempts,
    next: attempts % size,
    passed: Boolean(progress?.passed),
  };
}

// Deterministic so a reload mid-cycle resumes the same exercise.
function seededOrder(length, seed) {
  let state = 2166136261;
  for (const char of seed) state = Math.imul(state ^ char.charCodeAt(0), 16777619);
  const random = () => {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const order = [...Array(length).keys()];
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

// The first cycle keeps the curated order. Later cycles draw a shuffled window
// from the curated and extra exercises, so repetition meets new sentences while
// the window size and passing target stay unchanged.
export function exerciseDeck(rule, cycle) {
  if (!cycle) return rule.qs;
  const pool = [...rule.qs, ...(rule.extra || [])];
  return seededOrder(pool.length, `${rule.id}:${cycle}`).slice(0, rule.qs.length).map(index => pool[index]);
}

export function recordGrammarAnswer(progress, correct, id) {
  const { size, target } = ruleTarget(id);
  const answers = [...(progress?.answers || []), correct].slice(-size);
  return {
    answers,
    attempts: (progress?.attempts || 0) + 1,
    // Passing is an achievement; optional later practice cannot revoke it.
    passed: Boolean(progress?.passed) || (answers.length === size && answers.filter(Boolean).length >= target),
  };
}

export function upgradeGrammar(progress) {
  const grammarProgress = Object.fromEntries(Object.entries(progress.grammarProgress || {}).filter(([id]) => RULE_IDS.includes(id)).map(([id, entry]) => {
    const { size, target } = ruleTarget(id);
    const answers = entry.answers.slice(-size);
    return [id, { ...entry, answers, passed: entry.passed || (answers.length === size && answers.filter(Boolean).length >= target) }];
  }));
  const upgraded = { ...progress, grammarVersion: GRAMMAR_VERSION, grammarProgress };
  // The old weighted percentage has no individual answer history to migrate.
  delete upgraded.ruleMastery;
  return upgraded;
}
