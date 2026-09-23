// Practice ranks are game milestones, independent of the vocabulary catalog
// and CEFR proficiency. Keep thresholds stable when adding learning content.
import { upgradeGrammar } from './grammar-progress.js';
import { VOCABULARY_VERSION } from './vocabulary.js';

// Recognition (choosing an option or building from given letters) earns 1 XP;
// recalling and typing the answer earns 2. XP_VERSION stays at 2: stored totals
// are unchanged, and a new version would rescale them as legacy XP.
export const XP_REWARDS = { choice: 1, typed: 2 };
export const XP_VERSION = 2;

// Level 2 costs 30 XP and each further step costs 40% more, rounded to a whole
// XP. The ladder ends at MAX_LEVEL (474,743 XP); XP keeps counting after that.
const BASE_XP = 30, GROWTH = 1.4;

export function rescaleLegacyXp(xp, version) {
  return version === XP_VERSION ? xp : Math.floor(xp / 10);
}

// Stored progress is upgraded to the current XP rules exactly once, on read.
export function upgradeProgress(progress) {
  return upgradeGrammar({ ...progress, vocabularyVersion: VOCABULARY_VERSION, knownWordIds: progress.knownWordIds || [], xp: rescaleLegacyXp(progress.xp, progress.xpVersion), xpVersion: XP_VERSION });
}

// Nine materials with three steps each, one per level; German names double as vocabulary.
export const RANK_TIERS = [
  ['Holz', 'wood'], ['Stein', 'stone'], ['Kupfer', 'copper'], ['Bronze', 'bronze'], ['Eisen', 'iron'],
  ['Silber', 'silver'], ['Gold', 'gold'], ['Platin', 'platinum'], ['Diamant', 'diamond'],
];
export const RANK_TITLES = RANK_TIERS.flatMap(([name]) => [1, 2, 3].map(step => `${name} ${step}`));
export const MAX_LEVEL = RANK_TITLES.length;

// thresholds[n - 1] is the total XP required to reach level n.
const thresholds = [0];
for (let step = BASE_XP; thresholds.length < MAX_LEVEL; step = Math.round(step * GROWTH)) {
  thresholds.push(thresholds[thresholds.length - 1] + step);
}

export function xpForLevel(level) {
  return thresholds[Math.min(MAX_LEVEL, Math.max(1, Math.floor(level))) - 1];
}

export function rankTitle(level) {
  return RANK_TITLES[Math.min(MAX_LEVEL, Math.max(1, level)) - 1];
}

export function rankMeaning(level) {
  return RANK_TIERS[Math.ceil(Math.min(MAX_LEVEL, Math.max(1, level)) / 3) - 1][1];
}

// At the top level there is no next requirement: maxed is true and the next-level
// fields are null.
export function levelProgress(totalXp) {
  const xp = Number.isFinite(totalXp) ? Math.max(0, Math.floor(totalXp)) : 0;
  let level = 1;
  while (level < MAX_LEVEL && xp >= xpForLevel(level + 1)) level++;
  const start = xpForLevel(level);
  if (level === MAX_LEVEL) {
    return { level, title: rankTitle(level), nextTitle: null, xp, earned: xp - start, required: null, remaining: null, percent: 100, maxed: true };
  }
  const next = xpForLevel(level + 1);
  return {
    level, title: rankTitle(level), nextTitle: rankTitle(level + 1),
    xp, earned: xp - start, required: next - start,
    remaining: next - xp, percent: Math.floor((xp - start) / (next - start) * 100), maxed: false,
  };
}
