import type { ProgressState, QuestState } from './types';
import { levelForXp } from './xp';

const KEY = 'tt-progress';

function emptyState(): ProgressState {
  return {
    profile: { xp: 0, level: 1, createdAt: new Date().toISOString() },
    quests: {},
  };
}

export function loadProgress(): ProgressState {
  if (typeof window === 'undefined') return emptyState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as ProgressState;
    if (!parsed.profile) parsed.profile = emptyState().profile;
    if (!parsed.quests) parsed.quests = {};
    return parsed;
  } catch {
    return emptyState();
  }
}

export function saveProgress(state: ProgressState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

export function ensureQuestState(state: ProgressState, questId: string): QuestState {
  if (!state.quests[questId]) {
    state.quests[questId] = {
      storyId: null,
      completedStepIds: [],
      currentStepId: null,
      hintsUsed: {},
      startedAt: new Date().toISOString(),
      completedAt: null,
    };
  }
  return state.quests[questId];
}

export function markStepComplete(
  state: ProgressState,
  questId: string,
  stepId: string,
  xpGained: number,
): void {
  const q = ensureQuestState(state, questId);
  if (!q.completedStepIds.includes(stepId)) q.completedStepIds.push(stepId);
  state.profile.xp = (state.profile.xp || 0) + xpGained;
  state.profile.level = levelForXp(state.profile.xp);
}

export function setCurrentStep(state: ProgressState, questId: string, stepId: string): void {
  ensureQuestState(state, questId).currentStepId = stepId;
}

export function setStory(state: ProgressState, questId: string, storyId: string): void {
  ensureQuestState(state, questId).storyId = storyId;
}

export function markQuestComplete(state: ProgressState, questId: string): void {
  ensureQuestState(state, questId).completedAt = new Date().toISOString();
}

export function trackHintUsed(state: ProgressState, questId: string, stepId: string): number {
  const q = ensureQuestState(state, questId);
  q.hintsUsed[stepId] = (q.hintsUsed[stepId] || 0) + 1;
  return q.hintsUsed[stepId];
}
