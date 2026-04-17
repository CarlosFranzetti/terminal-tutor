import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let dir;

before(() => {
  dir = mkdtempSync(join(tmpdir(), 'tt-progress-'));
  process.env.TT_PROGRESS_DIR = dir;
});

after(() => {
  if (dir && existsSync(dir)) rmSync(dir, { recursive: true, force: true });
});

test('loadProgress returns empty state when no file', async () => {
  const { loadProgress } = await import('../src/engine/progress.js');
  const state = loadProgress();
  assert.equal(state.profile.xp, 0);
  assert.deepEqual(state.quests, {});
});

test('saveProgress writes atomically and loadProgress reads back', async () => {
  const { loadProgress, saveProgress, markStepComplete } = await import('../src/engine/progress.js');
  const state = loadProgress();
  markStepComplete(state, 'demo', 'step-1', 25);
  saveProgress(state);
  const reloaded = loadProgress();
  assert.equal(reloaded.profile.xp, 25);
  assert.ok(reloaded.quests.demo.completedStepIds.includes('step-1'));
});

test('trackHintUsed increments', async () => {
  const { loadProgress, trackHintUsed, saveProgress } = await import('../src/engine/progress.js');
  const state = loadProgress();
  trackHintUsed(state, 'demo', 'step-2');
  trackHintUsed(state, 'demo', 'step-2');
  saveProgress(state);
  const reloaded = loadProgress();
  assert.equal(reloaded.quests.demo.hintsUsed['step-2'], 2);
});
