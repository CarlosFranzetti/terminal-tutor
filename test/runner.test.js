// Integration test for the quest runner, driven by a scripted UI.

import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

before(() => {
  process.env.TT_PROGRESS_DIR = mkdtempSync(join(tmpdir(), 'tt-runner-'));
  process.env.TT_FAKE_SHELL = '1';
  process.env.NO_COLOR = '1';
  process.env.TT_NO_TYPEWRITER = '1';
});

const minimalStory = {
  id: 'default',
  title: 'Mini Quest',
  steps: [
    {
      id: 's1',
      narration: 'narrate one',
      objective: 'echo hello',
      verify: { mode: 'shell', stdoutContains: 'hello', exitCode: 0 },
      hints: ['first', 'second', 'third'],
      xp: 20
    },
    {
      id: 's2',
      narration: 'narrate two',
      objective: 'echo world',
      verify: { mode: 'shell', stdoutContains: 'world', exitCode: 0 },
      hints: ['first', 'second'],
      xp: 30
    }
  ]
};

const minimalPack = {
  id: 'miniq',
  title: 'Mini Quest',
  synopsis: 'smoke test',
  tool: 'echo',
  stories: [minimalStory]
};

function scriptedUi(actions) {
  let i = 0;
  const events = [];
  return {
    events,
    renderQuestStart: (pack) => events.push(['quest-start', pack.id]),
    renderStepIntro: (step) => events.push(['step-intro', step.id]),
    async promptCommand() {
      const action = actions[i++];
      if (!action) throw new Error('ran out of scripted actions');
      return action;
    },
    renderVerifying: () => ({ succeed() {}, fail() {} }),
    renderSuccess: (step, xp) => events.push(['success', step.id, xp]),
    renderFailure: (step, reason) => events.push(['failure', step.id, reason]),
    renderHint: (text, index) => events.push(['hint', text, index]),
    renderQuestComplete: (pack) => events.push(['quest-complete', pack.id]),
    pickBranch: (bp) => Promise.resolve(bp.branches[0])
  };
}

test('runner advances through steps on successful commands', async () => {
  const { runQuest } = await import('../src/engine/runner.js');
  const ui = scriptedUi([
    { kind: 'run', command: 'echo hello' },
    { kind: 'run', command: 'echo world' }
  ]);
  const result = await runQuest(minimalPack, minimalStory, ui);
  assert.deepEqual(result, { completed: true });
  const kinds = ui.events.map((e) => e[0]);
  assert.deepEqual(kinds, [
    'quest-start',
    'step-intro', 'success',
    'step-intro', 'success',
    'quest-complete'
  ]);
});

test('runner surfaces failures and accepts hints then success', async () => {
  process.env.TT_PROGRESS_DIR = mkdtempSync(join(tmpdir(), 'tt-runner-'));
  const { runQuest } = await import('../src/engine/runner.js');
  const ui = scriptedUi([
    { kind: 'run', command: 'echo no-match' },   // fail: fake shell echoes command, so needs "hello"
    { kind: 'hint' },
    { kind: 'run', command: 'echo hello now' },
    { kind: 'run', command: 'echo world-too' }
  ]);
  const result = await runQuest(minimalPack, minimalStory, ui);
  assert.equal(result.completed, true);
  const failureCount = ui.events.filter((e) => e[0] === 'failure').length;
  const hintCount = ui.events.filter((e) => e[0] === 'hint').length;
  assert.ok(failureCount >= 1);
  assert.ok(hintCount >= 1);
});

test('runner returns {quit:true} on quit action', async () => {
  process.env.TT_PROGRESS_DIR = mkdtempSync(join(tmpdir(), 'tt-runner-'));
  const { runQuest } = await import('../src/engine/runner.js');
  const ui = scriptedUi([
    { kind: 'quit' }
  ]);
  const result = await runQuest(minimalPack, minimalStory, ui);
  assert.deepEqual(result, { quit: true });
});
