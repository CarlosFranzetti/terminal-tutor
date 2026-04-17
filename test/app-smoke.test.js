// End-to-end smoke: wire a scripted UI directly into the engine loop
// to prove the system boots, loads packs, plays one through, and
// persists progress to disk.

import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let progressDir;

before(() => {
  progressDir = mkdtempSync(join(tmpdir(), 'tt-smoke-'));
  process.env.TT_PROGRESS_DIR = progressDir;
  process.env.TT_FAKE_SHELL = '1';
  process.env.NO_COLOR = '1';
  process.env.TT_NO_TYPEWRITER = '1';
});

test('loader + runner can play a full quest end-to-end with fake shell', async () => {
  const { loadPacks, findPack } = await import('../src/engine/loader.js');
  const { runQuest } = await import('../src/engine/runner.js');

  const packs = await loadPacks();
  const pack = findPack(packs, 'github-cli');
  assert.ok(pack, 'github-cli pack should exist');

  // For each step, use the hint-provided canonical answer where helpful,
  // and otherwise echo a string that satisfies the step's predicates.
  const perStepCommand = {
    'verify-install': 'which gh',
    'check-version': 'echo "gh version 2.0.0"',
    'auth-status': 'echo "github.com Logged in as tester"',
    'find-repo-help': 'echo "create fork clone view"',
    'view-remote-repo': 'echo "cli/cli repository info"',
    'list-issues': 'echo "#42 TITLE OPEN sample issue"',
    'pr-help': 'echo "create edit list review"',
    'victory-torch': 'echo "escaped the merge conflict dungeon"'
  };

  const actions = pack.steps.map((step) => {
    if (step.verify.mode === 'prompt') {
      return { kind: 'run', answer: step.verify.answer };
    }
    if (step.verify.mode === 'which') {
      return { kind: 'run', command: perStepCommand[step.id] || 'which x' };
    }
    return { kind: 'run', command: perStepCommand[step.id] || 'echo hello' };
  });

  let i = 0;
  const ui = {
    renderQuestStart() {},
    renderStepIntro() {},
    async promptCommand() { return actions[i++]; },
    renderVerifying: () => ({ succeed() {}, fail() {} }),
    renderSuccess() {},
    renderFailure() {},
    renderHint() {},
    renderQuestComplete() {}
  };

  const result = await runQuest(pack, ui);
  assert.equal(result.completed, true);

  const state = JSON.parse(readFileSync(join(progressDir, 'progress.json'), 'utf8'));
  assert.ok(state.profile.xp > 0, 'should have earned xp');
  assert.ok(state.quests['github-cli'].completedAt, 'quest should be marked complete');
  assert.equal(state.quests['github-cli'].completedStepIds.length, pack.steps.length);
});
