// Quest pack discovery and schema validation.

import { readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const QUESTS_DIR = resolve(__dirname, '..', '..', 'quests');

const VALID_MODES = new Set(['shell', 'which', 'prompt']);

export class PackValidationError extends Error {
  constructor(packId, message) {
    super(`[pack:${packId}] ${message}`);
    this.packId = packId;
  }
}

export function validatePack(pack) {
  const id = pack?.id || '<unknown>';
  if (!pack || typeof pack !== 'object') throw new PackValidationError(id, 'not an object');
  for (const key of ['id', 'title', 'synopsis', 'tool']) {
    if (typeof pack[key] !== 'string' || !pack[key].length) {
      throw new PackValidationError(id, `missing string field: ${key}`);
    }
  }
  if (!Array.isArray(pack.steps) || pack.steps.length === 0) {
    throw new PackValidationError(id, 'steps must be a non-empty array');
  }
  const seen = new Set();
  for (const step of pack.steps) {
    if (!step || typeof step !== 'object') throw new PackValidationError(id, 'step not an object');
    for (const key of ['id', 'narration', 'objective']) {
      if (typeof step[key] !== 'string' || !step[key].length) {
        throw new PackValidationError(id, `step missing string field: ${key}`);
      }
    }
    if (seen.has(step.id)) throw new PackValidationError(id, `duplicate step id: ${step.id}`);
    seen.add(step.id);
    if (!Array.isArray(step.hints) || step.hints.length < 1) {
      throw new PackValidationError(id, `step ${step.id}: hints must be a non-empty array`);
    }
    if (typeof step.xp !== 'number' || step.xp < 0) {
      throw new PackValidationError(id, `step ${step.id}: xp must be a non-negative number`);
    }
    if (!step.verify || !VALID_MODES.has(step.verify.mode)) {
      throw new PackValidationError(id, `step ${step.id}: verify.mode must be one of ${[...VALID_MODES].join(', ')}`);
    }
    if (step.verify.mode === 'which' && typeof step.verify.binary !== 'string') {
      throw new PackValidationError(id, `step ${step.id}: which verify requires verify.binary`);
    }
    if (step.verify.mode === 'prompt') {
      if (!Array.isArray(step.verify.choices) || step.verify.choices.length < 2) {
        throw new PackValidationError(id, `step ${step.id}: prompt verify requires 2+ choices`);
      }
      if (typeof step.verify.answer !== 'string') {
        throw new PackValidationError(id, `step ${step.id}: prompt verify requires answer`);
      }
    }
  }
  return pack;
}

export async function loadPacks(dir = QUESTS_DIR) {
  const entries = readdirSync(dir).filter((f) => f.endsWith('.js'));
  const packs = [];
  for (const entry of entries) {
    const filePath = join(dir, entry);
    const mod = await import(pathToFileURL(filePath).href);
    const pack = mod.default;
    try {
      validatePack(pack);
    } catch (err) {
      console.error(err.message);
      continue;
    }
    packs.push(pack);
  }
  packs.sort((a, b) => a.title.localeCompare(b.title));
  return packs;
}

export function findPack(packs, id) {
  return packs.find((p) => p.id === id) || null;
}
