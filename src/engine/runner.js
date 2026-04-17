// Quest state machine. Emits events via an injected ui object so the engine
// stays pure-data-in/data-out and unit testable.
//
// ui contract:
//   renderStepIntro(step, ctx) -> void
//   promptCommand() -> Promise<{ kind: 'run'|'hint'|'skip'|'quit', command?: string, answer?: string }>
//   renderVerifying() -> { succeed, fail }   // returns control handle
//   renderSuccess(step, xpGained) -> void
//   renderFailure(step, reason) -> void
//   renderHint(text, index, total) -> void
//   renderQuestStart(pack, resumeFromStepId) -> void
//   renderQuestComplete(pack, totalXp) -> void

import { verifyShell, verifyWhich, verifyPrompt } from './verifier.js';
import { nextHint, xpAfterHints } from './hints.js';
import {
  loadProgress,
  saveProgress,
  markStepComplete,
  markQuestComplete,
  setCurrentStep,
  ensureQuestState,
  trackHintUsed
} from './progress.js';

export async function runQuest(pack, ui) {
  const state = loadProgress();
  const q = ensureQuestState(state, pack.id);
  const done = new Set(q.completedStepIds);

  // Find first unfinished step (resume) or start from 0.
  let startIdx = 0;
  for (let i = 0; i < pack.steps.length; i++) {
    if (!done.has(pack.steps[i].id)) {
      startIdx = i;
      break;
    }
    if (i === pack.steps.length - 1) startIdx = pack.steps.length; // all done
  }

  ui.renderQuestStart(pack, startIdx > 0 ? pack.steps[startIdx - 1]?.id : null);

  if (startIdx >= pack.steps.length) {
    markQuestComplete(state, pack.id);
    saveProgress(state);
    ui.renderQuestComplete(pack, state.profile.xp);
    return { completed: true, replay: true };
  }

  for (let i = startIdx; i < pack.steps.length; i++) {
    const step = pack.steps[i];
    setCurrentStep(state, pack.id, step.id);
    saveProgress(state);

    let hintsUsedThisStep = 0;
    let resolved = false;

    ui.renderStepIntro(step, { index: i, total: pack.steps.length, questTitle: pack.title });

    while (!resolved) {
      const action = await ui.promptCommand(step);

      if (action.kind === 'quit') {
        return { quit: true };
      }

      if (action.kind === 'hint') {
        const hint = nextHint(step, hintsUsedThisStep);
        if (hint) {
          hintsUsedThisStep += 1;
          trackHintUsed(state, pack.id, step.id);
          saveProgress(state);
          ui.renderHint(hint.text, hint.index + 1, hint.total);
        } else {
          ui.renderHint('You have heard all I can tell you, traveler.', 0, 0);
        }
        continue;
      }

      if (action.kind === 'skip') {
        ui.renderFailure(step, 'step skipped — no XP awarded');
        resolved = true;
        // move on without marking complete
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
        markStepComplete(state, pack.id, step.id, gained);
        saveProgress(state);
        ui.renderSuccess(step, gained);
        resolved = true;
      } else {
        handle.fail();
        ui.renderFailure(step, result.reason || 'that does not look right yet');
        // loop: user can retry, hint, skip, or quit
      }
    }
  }

  markQuestComplete(state, pack.id);
  saveProgress(state);
  ui.renderQuestComplete(pack, state.profile.xp);
  return { completed: true };
}
