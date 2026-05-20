// Quest state machine. Handles stories and branch points.
//
// ui contract:
//   renderStepIntro(step, ctx) -> void
//   promptCommand(step) -> Promise<{ kind: 'run'|'hint'|'skip'|'quit', command?: string, answer?: string }>
//   renderVerifying() -> { succeed, fail }
//   renderSuccess(step, xpGained) -> void
//   renderFailure(step, reason) -> void
//   renderHint(text, index, total) -> void
//   renderQuestStart(pack, story) -> void
//   renderQuestComplete(pack, totalXp) -> void
//   pickBranch(branchPoint) -> Promise<Branch>   (added for branching)

import { verifyShell, verifyWhich, verifyPrompt } from './verifier.js';
import { nextHint, xpAfterHints } from './hints.js';
import {
  loadProgress,
  saveProgress,
  markStepComplete,
  markQuestComplete,
  setCurrentStep,
  setStory,
  ensureQuestState,
  trackHintUsed
} from './progress.js';

// Flatten a StepOrBranch[] into a Step[], resolving branches via the ui.
async function resolveSteps(items, ui) {
  const flat = [];
  for (const item of items) {
    if (item.type === 'branch') {
      const branch = await ui.pickBranch(item);
      if (!branch) return null; // user quit
      flat.push(...branch.steps);
    } else {
      flat.push(item);
    }
  }
  return flat;
}

export async function runQuest(pack, story, ui) {
  const state = loadProgress();
  const q = ensureQuestState(state, pack.id);

  // Reset progress when starting a new story
  if (q.storyId !== story.id) {
    q.storyId = story.id;
    q.completedStepIds = [];
    q.currentStepId = null;
    q.completedAt = null;
    q.startedAt = new Date().toISOString();
  }

  setStory(state, pack.id, story.id);
  saveProgress(state);

  const done = new Set(q.completedStepIds);

  ui.renderQuestStart(pack, story);

  // Resolve branching steps
  const flatSteps = await resolveSteps(story.steps, ui);
  if (!flatSteps) return { quit: true };

  // Already completed?
  const remaining = flatSteps.filter(s => !done.has(s.id));
  if (remaining.length === 0) {
    markQuestComplete(state, pack.id);
    saveProgress(state);
    ui.renderQuestComplete(pack, state.profile.xp);
    return { completed: true };
  }

  for (const step of remaining) {
    const currentState = loadProgress();
    setCurrentStep(currentState, pack.id, step.id);
    saveProgress(currentState);

    let hintsUsedThisStep = 0;
    let resolved = false;

    ui.renderStepIntro(step, { questTitle: pack.title, storyTitle: story.title });

    while (!resolved) {
      const action = await ui.promptCommand(step);

      if (action.kind === 'quit') return { quit: true };

      if (action.kind === 'hint') {
        const hint = nextHint(step, hintsUsedThisStep);
        if (hint) {
          hintsUsedThisStep += 1;
          const s = loadProgress();
          trackHintUsed(s, pack.id, step.id);
          saveProgress(s);
          ui.renderHint(hint.text, hint.index + 1, hint.total);
        } else {
          ui.renderHint('No more hints available, operator.', 0, 0);
        }
        continue;
      }

      if (action.kind === 'skip') {
        ui.renderFailure(step, 'step skipped — no XP awarded');
        resolved = true;
        break;
      }

      // kind === 'run'
      let result;
      const handle = ui.renderVerifying();
      try {
        if (step.verify.mode === 'shell') {
          result = await verifyShell(step.verify, action.command);
        } else if (step.verify.mode === 'which') {
          result = verifyWhich(step.verify);
        } else if (step.verify.mode === 'prompt') {
          result = verifyPrompt(step.verify, action.answer);
        } else {
          result = { ok: false, reason: 'unknown verify mode' };
        }
      } catch (err) {
        result = { ok: false, reason: `verifier threw: ${err.message}` };
      }

      if (result.ok) {
        handle.succeed();
        const gained = xpAfterHints(step, hintsUsedThisStep);
        const s = loadProgress();
        markStepComplete(s, pack.id, step.id, gained);
        saveProgress(s);
        ui.renderSuccess(step, gained);
        resolved = true;
      } else {
        handle.fail();
        ui.renderFailure(step, result.reason || 'that does not look right yet');
      }
    }
  }

  const finalState = loadProgress();
  markQuestComplete(finalState, pack.id);
  saveProgress(finalState);
  ui.renderQuestComplete(pack, finalState.profile.xp);
  return { completed: true };
}
