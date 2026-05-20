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

  // Play through the first story, always choosing the first branch.
  const story = pack.stories[0];
  assert.ok(story, 'github-cli should have at least one story');

  // Commands that satisfy each step's custom predicate (fake shell returns exitCode 0).
  const perStepCommand = {
    's1-survey':      'ls',
    's1-git-status':  'git status',
    's1-b1-diff':     'git diff',
    's1-b1-add':      'git add .',
    's1-b2-add':      'git add .',
    's1-commit':      'git commit -m "test"',
    's1-gh-version':  'gh --version',
    's1-auth':        'gh auth status',
    's1-repo-create': 'gh repo create street-racer-unlimited --public --source=. --push',
    's1-shipped':     'gh repo view',
  };

  let i = 0;
  const ui = {
    renderQuestStart() {},
    renderStepIntro() {},
    async promptCommand(step) {
      const cmd = perStepCommand[step.id] || 'echo hello';
      return { kind: 'run', command: cmd };
    },
    renderVerifying: () => ({ succeed() {}, fail() {} }),
    renderSuccess() {},
    renderFailure(step, reason) { throw new Error(`Step ${step.id} failed: ${reason}`); },
    renderHint() {},
    renderQuestComplete() {},
    pickBranch: (bp) => Promise.resolve(bp.branches[0])
  };

  const result = await runQuest(pack, story, ui);
  assert.equal(result.completed, true);

  const state = JSON.parse(readFileSync(join(progressDir, 'progress.json'), 'utf8'));
  assert.ok(state.profile.xp > 0, 'should have earned xp');
  assert.ok(state.quests['github-cli'].completedAt, 'quest should be marked complete');
  assert.ok(state.quests['github-cli'].completedStepIds.length > 0, 'should have completed steps');
});
