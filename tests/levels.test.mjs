import assert from 'node:assert/strict';
import { test } from 'node:test';
import { levelProgress, xpForLevel, RANK_TITLES, MAX_LEVEL, XP_REWARDS, rescaleLegacyXp } from '../public/levels.js';

test('level 2 costs 30 XP and each further step costs 40% more', () => {
  assert.equal(RANK_TITLES.length, 27);
  assert.equal(MAX_LEVEL, 27);
  assert.deepEqual([1, 2, 3, 4, 5, 6].map(xpForLevel), [0, 30, 72, 131, 214, 330]);
  let previous = 0;
  for (let level = 1; level < MAX_LEVEL; level++) {
    const requirement = xpForLevel(level + 1) - xpForLevel(level);
    assert.ok(requirement > previous);
    if (previous) assert.equal(requirement, Math.round(previous * 1.4));
    previous = requirement;
    const before = levelProgress(xpForLevel(level + 1) - 1);
    assert.equal(before.level, level);
    assert.equal(before.remaining, 1);
    const promoted = levelProgress(xpForLevel(level + 1));
    assert.equal(promoted.level, level + 1);
    assert.equal(promoted.earned, 0);
  }
  assert.equal(xpForLevel(MAX_LEVEL), 474743, 'the ladder ends near 500,000 XP');
});

test('XP carries over across promotions and levels stop at the top rank', () => {
  assert.equal(levelProgress(33).level, 2);
  assert.equal(levelProgress(33).earned, 3);
  assert.equal(levelProgress(33).required, 42);
  assert.equal(levelProgress(xpForLevel(4)).title, 'Stein 1');
  const top = levelProgress(xpForLevel(MAX_LEVEL));
  assert.deepEqual([top.level, top.title, top.maxed, top.nextTitle, top.required, top.remaining, top.percent], [27, 'Diamant 3', true, null, null, null, 100]);
  const beyond = levelProgress(1_000_000_000);
  assert.equal(beyond.level, 27);
  assert.equal(beyond.xp, 1_000_000_000, 'XP keeps counting after the top level');
  assert.equal(levelProgress(xpForLevel(MAX_LEVEL) - 1).maxed, false);
  assert.equal(xpForLevel(99), xpForLevel(MAX_LEVEL));
  assert.equal(levelProgress(-1).level, 1);
  assert.equal(XP_REWARDS.choice, 1);
  assert.equal(XP_REWARDS.typed, 2);
});

test('legacy XP is rescaled once without applying the conversion to current totals', () => {
  assert.equal(rescaleLegacyXp(508, undefined), 50);
  assert.equal(rescaleLegacyXp(50, 2), 50);
  assert.equal(rescaleLegacyXp(0, undefined), 0);
});
