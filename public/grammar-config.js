// Practice windows match the number of curated exercises in each topic.
export const RULE_SIZES = {
  sein: 32, present: 48, articles: 48, accusative: 40, modal: 48,
  wordorder: 40, perfect: 40, dative: 40, because: 40, comparative: 40,
  plural: 40, indefinite: 40, personal: 20, possessive: 48, nominative: 32,
  demonstrative: 40, prepositions: 20, local: 40, wquestions: 20,
  localadverbs: 24, separable: 40, reflexive: 40, participle: 40, countable: 32,
};
export const RULE_IDS = Object.keys(RULE_SIZES);
export function ruleTarget(id) {
  const size = RULE_SIZES[id];
  if (!size) throw new Error(`Unknown grammar rule: ${id}`);
  return { size, target: Math.ceil(size * 7 / 8) };
}
