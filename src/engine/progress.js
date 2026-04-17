// Atomic JSON progress store at ~/.terminal-tutor/progress.json.
// Overridable via TT_PROGRESS_DIR for tests.

import { mkdirSync, existsSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

function resolveDir() {
  return process.env.TT_PROGRESS_DIR || join(homedir(), '.terminal-tutor');
}

function resolveFile() {
  return join(resolveDir(), 'progress.json');
}

function emptyState() {
  return {
    profile: { xp: 0, level: 1, createdAt: new Date().toISOString() },
    quests: {}
  };
}

export function loadProgress() {
  const file = resolveFile();
  if (!existsSync(file)) return emptyState();
  try {
    const raw = readFileSync(file, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed.profile) parsed.profile = emptyState().profile;
    if (!parsed.quests) parsed.quests = {};
    return parsed;
  } catch {
    return emptyState();
  }
}

export function saveProgress(state) {
  const dir = resolveDir();
  const file = resolveFile();
  mkdirSync(dir, { recursive: true });
  const tmp = file + '.tmp';
  writeFileSync(tmp, JSON.stringify(state, null, 2));
  renameSync(tmp, file);
}

export function getQuestState(state, questId) {
  return state.quests[questId] || null;
}

export function ensureQuestState(state, questId) {
  if (!state.quests[questId]) {
    state.quests[questId] = {
      completedStepIds: [],
      currentStepId: null,
      hintsUsed: {},
      startedAt: new Date().toISOString(),
      completedAt: null
    };
  }
  return state.quests[questId];
}

export function markStepComplete(state, questId, stepId, xpGained) {
  const q = ensureQuestState(state, questId);
  if (!q.completedStepIds.includes(stepId)) {
    q.completedStepIds.push(stepId);
  }
  state.profile.xp = (state.profile.xp || 0) + xpGained;
  return state;
}

export function setCurrentStep(state, questId, stepId) {
  const q = ensureQuestState(state, questId);
  q.currentStepId = stepId;
}

export function markQuestComplete(state, questId) {
  const q = ensureQuestState(state, questId);
  q.completedAt = new Date().toISOString();
}

export function trackHintUsed(state, questId, stepId) {
  const q = ensureQuestState(state, questId);
  q.hintsUsed[stepId] = (q.hintsUsed[stepId] || 0) + 1;
  return q.hintsUsed[stepId];
}
