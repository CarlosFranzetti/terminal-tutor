# Terminal Tutor — Technical Design Document (TDD)

**Owner:** Carlos Franzetti
**Date:** April 16, 2026
**Status:** MVP design
**Source PRD:** `Terminal_Tutor_MiniPRD.md`

## 1. Context and goals

Terminal Tutor is a gamified, story-driven CLI trainer that runs in the user's real shell. The MVP must deliver a launchable terminal application with a colorful, animated UI that lets a learner pick a quest pack, play through story-driven steps that verify real commands, request progressive hints, track XP, and resume a quest. The MVP ships two quest packs: GitHub CLI and GitHub Copilot CLI. The engine must be modular so new packs drop in as data, not code.

The design goals, in priority order, are: (1) zero-friction first-run experience, (2) a safe, reliable command verification loop, (3) an architecture where a new quest pack is a single self-contained file, (4) a delightful visual experience that earns the "gamified" claim, and (5) a codebase small enough to extend in an afternoon.

## 2. High-level architecture

Terminal Tutor is a Node.js CLI packaged as `terminal-tutor` (short alias `tt`). It uses Node 18+ and ships no native dependencies. The code is organized into four layers.

The **entry layer** (`bin/tt.js`) parses arguments, sets up the process, and dispatches to the app shell. The **app shell** (`src/app.js`) owns the top-level screens: splash, quest browser, quest player, and progress/profile views. The **engine** (`src/engine/`) is headless: it loads quest packs, runs a quest state machine, executes verification, manages hints, and reads/writes the progress store. The **UI kit** (`src/ui/`) owns all presentation: gradients, animated titles, progress bars, boxed panels, spinners, typewriter text, and keybindings. Quest packs live under `quests/` as plain JavaScript modules that export a declarative quest object.

The user boots the app, the app shell asks the engine for the pack catalog, renders a quest browser, and on selection hands control to the quest player. The player loops through steps: narrate, prompt, spawn a shell for verification, evaluate, branch on success or failure, and persist progress after every step.

## 3. Component design

### 3.1 Quest pack format

A quest pack is a single file under `quests/` that default-exports an object with five fields: `id`, `title`, `synopsis`, `tool` (the real CLI this pack teaches, e.g. `gh`), and `steps`. Each step declares `id`, `narration` (story text shown before the prompt), `objective` (plain-English goal), `command` (optional suggested command template for the hint system), `verify` (the verification spec, see 3.3), `hints` (ordered list of progressive nudges, most general first), and `xp`.

Packs are pure data plus optional predicate functions. A pack does not import engine code, which keeps packs portable and safe to hot-load. The engine validates each pack against a schema at load time and refuses to load malformed packs with a readable error.

### 3.2 Engine state machine

The quest player is a small state machine with four states: `narrate`, `await_command`, `verifying`, and `resolve`. `narrate` prints the step story, renders the objective panel, and transitions to `await_command`. `await_command` shows a prompt with keyboard options (`[enter] run · [h] hint · [s] skip · [q] quit`); on enter it collects the command string, transitions to `verifying`, and delegates to the verifier. `verifying` shows an animated spinner and awaits the verification result. `resolve` branches: on success it awards XP, persists progress, and transitions to the next step's `narrate`; on failure it shows the failure reason, offers another hint, and loops back to `await_command`.

### 3.3 Command verification

Verification supports three modes, chosen per step. `shell` mode spawns `/bin/sh -c <command>` (Windows uses `cmd /c`) with the user's environment, captures stdout/stderr/exit code, and checks a combination of optional predicates: `exitCode`, `stdoutContains`, `stdoutMatches` (regex), `stderrContains`, and `custom` (a function exported by the pack that receives the captured result and returns `{ ok, reason }`). `which` mode simply checks whether a binary is on PATH using `which`/`where`. `prompt` mode skips shell execution and asks the user a multiple-choice question (used for cognitive steps between hands-on ones).

For MVP, verification runs in the same working directory as the user's shell, not a sandbox. The narration and hints are responsible for telling the user when a step will create files or remote state. A `--sandbox` flag is deferred to post-MVP.

### 3.4 Hint system

Hints are an ordered array on the step. The first hint is the most oblique ("You need a command that asks the tool who you are"), the last is essentially the answer with a key flag redacted. The player tracks a hint index per step; each `h` keypress advances the index and renders the hint in a boxed panel with a typewriter effect. Using a hint costs 25% of the step's XP; using all hints reduces the step to 25% of the XP, floored at 5.

### 3.5 Progress store

Progress is a single JSON file at `~/.terminal-tutor/progress.json` with the shape `{ profile: { xp, level, createdAt }, quests: { [questId]: { completedStepIds, currentStepId, hintsUsed, startedAt, completedAt } } }`. All writes are atomic (write to a temp file, rename). The store is the single source of truth for resumption; the app shell reads it on boot to flag in-progress quests in the browser.

### 3.6 UI kit

The UI kit wraps a small set of libraries: `chalk` for color, `gradient-string` for multi-color titles, `figlet` for ASCII art banners, `chalk-animation` for pulse/rainbow/neon animations on the splash screen, `boxen` for bordered panels, `ora` for spinners during verification, `cli-progress` for XP and quest progress bars, and `@inquirer/prompts` for menus and confirmations. Every surface the user sees goes through the UI kit so the visual language stays consistent.

Animation is used deliberately: a rainbow animated title on the splash (stops after three seconds to respect CPU), a typewriter effect on narration and hints, a pulsing spinner during verification, a confetti-style XP burst on success, and a subtle color shift on level-up. The kit detects `NO_COLOR` and narrow terminals and gracefully degrades.

## 4. Data flow and integration points

Boot loads the progress store and the pack catalog (file glob on `quests/*.js`). The browser renders packs with resume-state badges. Selecting a pack enters the player, which reads the pack, looks up the user's `currentStepId`, and enters `narrate` for that step. Every successful step triggers a write to the progress store before the next narration. Quit at any time writes current state and exits cleanly.

There are no network calls in MVP. Quest packs ship bundled with the app. The only external integration is the user's shell, which is how Terminal Tutor executes and observes commands.

## 5. Key decisions and trade-offs

Node.js was chosen over Python because the TUI animation ecosystem (`chalk-animation`, `gradient-string`, `figlet`, `ora`, `boxen`, `cli-progress`) is markedly richer and produces a more polished feel with less code, and because the target users almost certainly have Node available when they are learning dev CLIs. A pure-data pack format was chosen over a plugin API because it makes contributions safer (no arbitrary code unless declared in a `custom` verifier) and keeps the engine decoupled. Running commands in the user's real shell rather than a sandboxed container was chosen for fidelity — the promise is "learn the real CLI" — at the cost of some foot-gun risk, which is mitigated by narration, hint language, and explicit confirmation before destructive steps.

XP and levels are deliberately minimal in MVP: a single global XP counter and a level curve `ceil(sqrt(xp / 50))`. No achievements, streaks, or social features until we see real usage.

## 6. Non-goals for MVP

No sandboxed execution, no telemetry, no remote pack registry, no multi-user profiles, no Windows-specific niceties beyond "it runs," no GUI, no AI-generated hints, and no editor for authoring packs. These are all plausible post-MVP investments.

## 7. Testing strategy

Unit tests cover the verifier predicates, the pack schema validator, the progress store's atomic writes, and the XP/level math. Integration tests drive the state machine with a mock shell to confirm that narrate → verify → resolve transitions correctly on success, failure, hint, skip, and quit. A smoke test boots the app with a fake pack and walks it to completion non-interactively. Manual QA covers the animated UI, since "does it feel good" is not automatable.

## 8. Risks and mitigations

The biggest risk is that verification is too strict and users get stuck; the mitigation is lenient predicates (contains over equals, regex over literal), a progressive hint ladder ending very close to the answer, and a `skip` option that still advances the story. The second risk is terminal compatibility; the mitigation is that every animation has a static fallback and `NO_COLOR` is honored. The third risk is packs drifting from the CLIs they teach when upstream tools change; the mitigation is that packs are data files that maintainers can patch quickly, and the engine reports the exact failing predicate so pack bugs surface clearly.

## 9. Directory layout

```
terminal-tutor/
  bin/
    tt.js                 # entrypoint, shebang, arg parsing
  src/
    app.js                # screens and top-level flow
    engine/
      loader.js           # quest pack discovery + schema validation
      runner.js           # state machine
      verifier.js         # shell/which/prompt verifiers
      hints.js            # hint ladder + XP penalty
      progress.js         # atomic JSON store
      xp.js               # level curve
    ui/
      theme.js            # palette, gradients, symbols
      splash.js           # animated title + intro
      browser.js          # quest selector
      player.js           # narration, prompts, spinner, success burst
      components.js       # boxed panel, progress bar, typewriter
  quests/
    github-cli.js
    copilot-cli.js
  test/
    verifier.test.js
    progress.test.js
    runner.test.js
  package.json
  README.md
  TDD.md
  CLAUDE.md
```

## 10. Open questions

Should hint penalties accumulate across a quest or reset per step (current plan: per step)? Should `skip` still count toward quest completion or lock it out of a "perfect run" badge (deferred to achievements work)? Should we ship a no-install `npx terminal-tutor` entrypoint in MVP (leaning yes, because it eliminates an install step)?
