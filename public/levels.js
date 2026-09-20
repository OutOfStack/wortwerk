// Practice ranks are game milestones, independent of the vocabulary catalog
// and CEFR proficiency. Keep thresholds stable when adding learning content.
export const XP_REWARDS = { words: 1, grammar: 2 };
export const XP_VERSION = 2;

const BASE_XP = 30, GROWTH = 1.5;
// The curve is defined here once: thresholds[n - 1] is the total XP required to
// reach level n, grown on demand so every level lookup is a cached index.
const thresholds = [0];
let nextStep = BASE_XP;

export function rescaleLegacyXp(xp, version) {
  return version === XP_VERSION ? xp : Math.floor(xp / 10);
}

// Stored progress is upgraded to the current XP rules exactly once, on read.
export function upgradeProgress(progress) {
  return { ...progress, xp: rescaleLegacyXp(progress.xp, progress.xpVersion), xpVersion: XP_VERSION };
}

export const RANK_TITLES = [
  'Cadet', 'Senior Cadet', 'Recruit', 'Private', 'Private First Class',
  'Lance Corporal', 'Corporal', 'Senior Corporal', 'Sergeant', 'Staff Sergeant',
  'Sergeant First Class', 'Master Sergeant', 'First Sergeant', 'Sergeant Major',
  'Command Sergeant Major', 'Warrant Officer', 'Chief Warrant Officer',
  'Second Lieutenant', 'First Lieutenant', 'Captain', 'Senior Captain', 'Major',
  'Lieutenant Colonel', 'Colonel', 'Senior Colonel', 'Brigadier', 'Major General',
  'Lieutenant General', 'General', 'Field Marshal',
];

export function xpForLevel(level) {
  const target = Math.max(1, Math.floor(level));
  while (thresholds.length < target) {
    thresholds.push(thresholds[thresholds.length - 1] + nextStep);
    nextStep = Math.round(nextStep * GROWTH);
  }
  return thresholds[target - 1];
}

export function rankTitle(level) {
  return RANK_TITLES[level - 1] || `Field Marshal ${level - RANK_TITLES.length + 1}`;
}

export function levelProgress(totalXp) {
  const xp = Number.isFinite(totalXp) ? Math.max(0, Math.floor(totalXp)) : 0;
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  const start = xpForLevel(level), next = xpForLevel(level + 1);
  return {
    level, title: rankTitle(level), nextTitle: rankTitle(level + 1),
    xp, earned: xp - start, required: next - start,
    remaining: next - xp, percent: Math.floor((xp - start) / (next - start) * 100),
  };
}
