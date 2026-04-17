import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextHint, xpAfterHints } from '../src/engine/hints.js';

const step = {
  xp: 40,
  hints: ['oblique nudge', 'specific nudge', 'near answer']
};

test('nextHint returns hints in order and clamps at last', () => {
  assert.equal(nextHint(step, 0).text, 'oblique nudge');
  assert.equal(nextHint(step, 1).text, 'specific nudge');
  assert.equal(nextHint(step, 2).text, 'near answer');
  assert.equal(nextHint(step, 3).text, 'near answer');
});

test('xpAfterHints is full at zero hints', () => {
  assert.equal(xpAfterHints(step, 0), 40);
});

test('xpAfterHints penalizes each hint', () => {
  const a = xpAfterHints(step, 1);
  const b = xpAfterHints(step, 2);
  const c = xpAfterHints(step, 3);
  assert.ok(a < 40 && b <= a && c <= b);
});

test('xpAfterHints floors at a minimum', () => {
  const heavy = xpAfterHints(step, 99);
  assert.ok(heavy >= 5);
});
