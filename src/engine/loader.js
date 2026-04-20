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

function validateStep(step, id) {
  if (!step || typeof step !== 'object') throw new PackValidationError(id, 'step not an object');
  // BranchPoints only need id + type + branches
  if (step.type === 'branch') {
    if (!step.id) throw new PackValidationError(id, 'branch point missing id');
    if (!Array.isArray(step.branches) || step.branches.length < 2) {
      throw new PackValidationError(id, `branch point ${step.id}: needs >= 2 branches`);
    }
    for (const branch of step.branches) {
      if (!branch.label || !branch.steps?.length) {
        throw new PackValidationError(id, `branch in ${step.id}: missing label or steps`);
      }
      for (const s of branch.steps) validateStep(s, id);
    }
    return;
  }
  // Regular step
  for (const key of ['id', 'narration', 'objective']) {
    if (typeof step[key] !== 'string' || !step[key].length) {
      throw new PackValidationError(id, `step missing string field: ${key}`);
    }
  }
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
    if (typeof step.verify.answer !== 'string' && !Array.isArray(step.verify.answers)) {
      throw new PackValidationError(id, `step ${step.id}: prompt verify requires answer or answers`);
    }
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

  // Support both legacy steps[] and new stories[]
  if (pack.stories) {
    if (!Array.isArray(pack.stories) || pack.stories.length === 0) {
      throw new PackValidationError(id, 'stories must be a non-empty array');
    }
    for (const story of pack.stories) {
      if (!story.id || !story.title) throw new PackValidationError(id, 'story missing id or title');
      if (!Array.isArray(story.steps) || story.steps.length === 0) {
        throw new PackValidationError(id, `story ${story.id}: steps must be non-empty`);
      }
      const seen = new Set();
      for (const step of story.steps) {
        validateStep(step, id);
        if (step.id && seen.has(step.id)) throw new PackValidationError(id, `duplicate step id: ${step.id}`);
        if (step.id) seen.add(step.id);
      }
    }
  } else if (pack.steps) {
    // Legacy format — validate the steps array without mutating pack
    if (!Array.isArray(pack.steps) || pack.steps.length === 0) {
      throw new PackValidationError(id, 'steps must be a non-empty array');
    }
    const seen = new Set();
    for (const step of pack.steps) {
      validateStep(step, id);
      if (step.id && seen.has(step.id)) throw new PackValidationError(id, `duplicate step id: ${step.id}`);
      if (step.id) seen.add(step.id);
    }
  } else {
    throw new PackValidationError(id, 'pack must have stories[] or steps[]');
  }

  return pack;
}

// Normalize a validated pack so it always has a stories[] array.
function normalizePack(pack) {
  if (pack.stories) return pack;
  return { ...pack, stories: [{ id: 'default', title: pack.title, setting: pack.synopsis, steps: pack.steps }] };
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
    packs.push(normalizePack(pack));
  }
  packs.sort((a, b) => a.title.localeCompare(b.title));
  return packs;
}

export function findPack(packs, id) {
  return packs.find((p) => p.id === id) || null;
}
