import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyShell, verifyPrompt } from '../src/engine/verifier.js';

test('verifyShell passes when predicates match (fake shell)', async () => {
  process.env.TT_FAKE_SHELL = '1';
  const res = await verifyShell({ exitCode: 0, stdoutContains: 'hello' }, 'echo hello');
  assert.equal(res.ok, true);
});

test('verifyShell fails when exit code mismatches', async () => {
  process.env.TT_FAKE_SHELL = '1';
  const res = await verifyShell({ exitCode: 1 }, 'echo whatever');
  assert.equal(res.ok, false);
  assert.match(res.reason, /exit code/);
});

test('verifyShell fails when stdoutContains missing', async () => {
  process.env.TT_FAKE_SHELL = '1';
  const res = await verifyShell({ stdoutContains: 'banana' }, 'echo hello');
  assert.equal(res.ok, false);
  assert.match(res.reason, /banana/);
});

test('verifyShell supports regex stdoutMatches', async () => {
  process.env.TT_FAKE_SHELL = '1';
  const res = await verifyShell({ stdoutMatches: '^\\[fake-shell\\]' }, 'any');
  assert.equal(res.ok, true);
});

test('verifyShell custom predicate can fail', async () => {
  process.env.TT_FAKE_SHELL = '1';
  const res = await verifyShell({
    custom: (r) => ({ ok: r.stdout.includes('NOPE'), reason: 'want NOPE' })
  }, 'echo hi');
  assert.equal(res.ok, false);
  assert.match(res.reason, /NOPE/);
});

test('verifyPrompt compares answers exactly', () => {
  const verify = { choices: ['A', 'B'], answer: 'A' };
  assert.equal(verifyPrompt(verify, 'A').ok, true);
  assert.equal(verifyPrompt(verify, 'B').ok, false);
});
