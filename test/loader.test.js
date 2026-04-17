import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validatePack, loadPacks, PackValidationError } from '../src/engine/loader.js';

const validPack = {
  id: 'example',
  title: 'Example',
  synopsis: 'an example',
  tool: 'ex',
  steps: [
    {
      id: 's1',
      narration: 'story',
      objective: 'do a thing',
      verify: { mode: 'which', binary: 'node' },
      hints: ['a'],
      xp: 10
    }
  ]
};

test('validatePack accepts a minimal valid pack', () => {
  assert.doesNotThrow(() => validatePack(validPack));
});

test('validatePack rejects missing steps', () => {
  const bad = { ...validPack, steps: [] };
  assert.throws(() => validatePack(bad), PackValidationError);
});

test('validatePack rejects duplicate step ids', () => {
  const bad = {
    ...validPack,
    steps: [validPack.steps[0], { ...validPack.steps[0] }]
  };
  assert.throws(() => validatePack(bad), PackValidationError);
});

test('validatePack rejects unknown verify.mode', () => {
  const bad = {
    ...validPack,
    steps: [{ ...validPack.steps[0], verify: { mode: 'bogus' } }]
  };
  assert.throws(() => validatePack(bad), PackValidationError);
});

test('loadPacks loads the bundled quest packs', async () => {
  const packs = await loadPacks();
  const ids = packs.map((p) => p.id).sort();
  assert.ok(ids.includes('github-cli'));
  assert.ok(ids.includes('copilot-cli'));
});
