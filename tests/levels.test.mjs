import assert from 'node:assert/strict';
import { test } from 'node:test';
import { levelProgress, xpForLevel, RANK_TITLES, rescaleLegacyXp } from '../public/levels.js';

test('rank thresholds start small and requirements grow at every level', () => {
  assert.equal(RANK_TITLES.length, 30);
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7].map(xpForLevel), [0, 30, 75, 143, 245, 398, 628]);
  let previous = 0;
  for (let level = 1; level <= 40; level++) {
    const requirement = xpForLevel(level + 1) - xpForLevel(level);
    assert.ok(requirement > previous);
    if (previous) assert.equal(requirement, Math.round(previous * 1.5));
    previous = requirement;
    const before = levelProgress(xpForLevel(level + 1) - 1);
    assert.equal(before.level, level);
    assert.equal(before.remaining, 1);
    const promoted = levelProgress(xpForLevel(level + 1));
    assert.equal(promoted.level, level + 1);
    assert.equal(promoted.earned, 0);
    assert.equal(promoted.percent, 0);
  }
});

test('XP carries over across promotions and ranks continue beyond the named ladder', () => {
  assert.equal(levelProgress(33).level, 2);
  assert.equal(levelProgress(33).earned, 3);
  assert.equal(levelProgress(33).required, 45);
  assert.equal(levelProgress(500).level, 6);
  assert.equal(levelProgress(xpForLevel(31)).title, 'Field Marshal 2');
  assert.equal(levelProgress(xpForLevel(35) + 7).earned, 7);
  assert.equal(levelProgress(1_000_000_000).remaining > 0, true);
  assert.equal(levelProgress(-1).level, 1);
});

test('legacy XP is rescaled once without applying the conversion to current totals', () => {
  assert.equal(rescaleLegacyXp(508, undefined), 50);
  assert.equal(rescaleLegacyXp(50, 2), 50);
  assert.equal(rescaleLegacyXp(0, undefined), 0);
});
