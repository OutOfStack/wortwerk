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
