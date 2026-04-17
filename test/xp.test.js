import { test } from 'node:test';
import assert from 'node:assert/strict';
import { levelForXp, progressToNextLevel, xpForNextLevel } from '../src/engine/xp.js';

test('levelForXp starts at 1 for zero xp', () => {
  assert.equal(levelForXp(0), 1);
});

test('levelForXp grows with xp', () => {
  assert.ok(levelForXp(1000) > levelForXp(50));
});

test('level thresholds are monotonic', () => {
  let last = 1;
  for (let xp = 0; xp < 5000; xp += 25) {
    const lvl = levelForXp(xp);
    assert.ok(lvl >= last);
    last = lvl;
  }
});

test('progressToNextLevel stays in [0,1]', () => {
  for (let xp = 0; xp < 2000; xp += 37) {
    const p = progressToNextLevel(xp);
    assert.ok(p >= 0 && p <= 1, `p=${p} at xp=${xp}`);
  }
});

test('xpForNextLevel is non-negative', () => {
  for (let xp = 0; xp < 2000; xp += 37) {
    assert.ok(xpForNextLevel(xp) >= 0);
  }
});
