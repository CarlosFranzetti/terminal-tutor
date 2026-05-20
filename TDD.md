# Terminal Tutor — Technical Design Document (TDD)

**Owner:** Carlos Franzetti  
**Date:** April 16, 2026 (updated May 2026)  
**Status:** MVP — shipped  
**Source PRD:** `PRD.md`

---

## 1. Context and goals

Terminal Tutor is a gamified, story-driven CLI trainer that runs in the user's real shell (and in the browser as a Next.js web app). The MVP delivers a launchable terminal application with a colorful, animated UI that lets a learner pick a quest pack, choose a story, play through story-driven steps that verify real commands, request progressive hints, track XP, and resume a quest. The MVP ships one quest pack (GitHub Copilot CLI, three stories with branching paths). The engine is modular so new packs drop in as data files — no engine changes required.

Design goals, in priority order:
1. Zero-friction first-run experience
2. A safe, reliable command-verification loop
3. An architecture where a new quest pack is a single self-contained file
4. A delightful visual experience that earns the "gamified" claim
5. A codebase small enough to extend in an afternoon

---

## 2. High-level architecture

Terminal Tutor is a Node.js CLI (`tt`). It uses Node 18+ and has no native dependencies. Four layers:

| Layer | Entry point | Responsibility |
|---|---|---|
| Entry | `bin/tt.js` | Arg parsing, process setup, dispatch to app |
| App shell | `src/app.js` | Top-level screens: splash → browser → story picker → player |
| Engine | `src/engine/` | Headless: loads packs, runs state machine, verifies, manages hints, persists progress |
| UI kit | `src/ui/` | All presentation: gradients, animations, panels, spinners, prompts |

Quest packs live under `quests/` as plain JavaScript modules that default-export a declarative quest object.

### Flow

```
boot → load progress + packs → splash → quest browser
     → story picker → player loop (narrate → prompt → verify → resolve) → persist
```

---

## 3. Component design

### 3.1 Quest pack format

A pack file under `quests/` default-exports an object with five top-level fields:

| Field | Type | Purpose |
|---|---|---|
| `id` | string | Unique pack identifier (kebab-case) |
| `title` | string | Display name |
| `synopsis` | string | One-line pitch shown in the browser |
| `tool` | string | The real CLI being taught (e.g. `gh copilot`) |
| `stories` | `Story[]` | One or more stories (see below) |

**Legacy note:** Packs may also use a flat `steps[]` array (no stories). The loader normalises these into a single `{ id: 'default' }` story so the rest of the engine sees a uniform shape.

#### Story

Each story has `id`, `title`, `setting` (shown in the story picker), optional `art` (ASCII art), and `steps` — an array of `Step | BranchPoint`.

#### Step

```js
{
  id: 'step-1',              // unique within pack
  narration: '...',          // story text shown before prompt (second-person)
  objective: '...',          // plain-English goal shown in the objective box
  verify: { mode: 'shell', ...predicates },
  hints: ['...', '...', '...'],  // 3+ hints, oblique → nearly-explicit
  xp: 30,
  art: '...',                // optional ASCII art shown above narration
}
```

#### BranchPoint

```js
{
  id: 'bp-1',
  type: 'branch',
  narration: '...',          // shown above the branch picker
  branches: [
    { label: '...', flavor: '...', steps: [/* Step[] */] },
    { label: '...', flavor: '...', steps: [/* Step[] */] },
  ],
}
```

After the branch picker resolves, both paths converge back into the parent `steps[]`. Any steps after the BranchPoint in the parent array are shared by all branches.

Packs are pure data plus optional `custom` predicate functions. A pack does not import engine code, keeping packs portable and hot-loadable.

### 3.2 Engine state machine

The quest player is a state machine with four states:

```
narrate → await_command → verifying → resolve → narrate (next step)
                ↑__________________↙ (on failure)
```

- **narrate** — prints step story, renders objective panel, transitions to `await_command`
- **await_command** — shows prompt with keyboard options (`[enter] run · [h] hint · [s] skip · [q] quit`)
- **verifying** — shows animated spinner, awaits verification result
- **resolve** — on success: awards XP, persists, → next step; on failure: shows reason, → `await_command`

Branch points are resolved by `resolveSteps()` before the step loop begins. The UI calls `pickBranch()` and the resolved flat list of steps is used for the remainder of the story.

### 3.3 Command verification

Three modes:

| Mode | Mechanism | Predicates |
|---|---|---|
| `shell` | Spawns `/bin/sh -c <command>` (Windows: `cmd /c`) with user's env | `exitCode`, `stdoutContains`, `stdoutMatches` (regex), `stderrContains`, `custom(result, input)` |
| `which` | Calls `which`/`where` to check if a binary is on PATH | `binary` |
| `prompt` | Multiple-choice question, no shell spawn | `choices`, `answer` (single) or `answers` (array) |

All predicates are additive (AND). A step passes only if every specified predicate matches. Prefer `stdoutContains` and `stdoutMatches` over `exitCode`-only checks for more resilient verification.

The `custom` function receives `{ stdout, stderr, exitCode }` and the raw input string; it returns `{ ok, reason }`. Custom functions are the escape hatch for predicates too complex to express declaratively.

Verification runs in the user's actual shell, not a sandbox. Quest narration is responsible for telling the user when a step will create files or remote state.

### 3.4 Hint system

Hints are an ordered array on each step. The first hint is the most oblique; the last is essentially the answer. The engine tracks a `hintsUsed` counter per step per quest.

**XP penalty:** Each hint costs 25% of the step's base XP. Using all hints reduces the award to 25% of base, floored at 5 XP minimum.

```
xp = max(floor(base * 0.25), floor(base - base * 0.25 * hintsUsed))
     with minimum = max(5, floor(base * 0.25))
```

### 3.5 Progress store

Progress is a single JSON file at `~/.terminal-tutor/progress.json` (overridable with `TT_PROGRESS_DIR`).

```json
{
  "profile": {
    "xp": 120,
    "level": 2,
    "createdAt": "2026-05-01T10:00:00.000Z"
  },
  "quests": {
    "copilot-cli": {
      "storyId": "debug-at-3am",
      "completedStepIds": ["c1-which", "c1-extension-list"],
      "currentStepId": "c1-auth",
      "hintsUsed": { "c1-which": 1 },
      "startedAt": "2026-05-01T10:00:00.000Z",
      "completedAt": null
    }
  }
}
```

All writes are atomic: write to `<file>.tmp` → `rename` to final path. `profile.level` is recomputed and persisted each time XP changes so the stored value is always accurate.

### 3.6 XP and levelling

```js
level = ceil(sqrt(xp / 50))   // level 1 at xp=0, level 2 at xp=50, level 3 at xp=200 …
```

`xp.js` exports three pure functions: `levelForXp(xp)`, `xpForNextLevel(xp)`, `progressToNextLevel(xp)`.

### 3.7 UI kit

The UI kit wraps: `chalk` (color), `gradient-string` (multi-color text), `figlet` (ASCII banner), `chalk-animation` (splash animation), `boxen` (bordered panels), `ora` (spinners), `@inquirer/prompts` (menus, input, confirm).

Animation is used deliberately and always has a static fallback. `supportsAnimation()` checks `NO_COLOR` and `process.stdout.isTTY`. Narrow terminals (<70 cols) skip animations. `TT_NO_TYPEWRITER=1` disables the typewriter effect (used in tests).

---

## 4. Data flow

```
boot
 └── loadProgress()           reads ~/.terminal-tutor/progress.json
 └── loadPacks()              globs quests/*.js, validates, normalises
 └── showSplash()             figlet + animation (or static fallback)
 └── loop:
      renderProfileHeader()   xp + level bar
      pickQuest()             inquirer list
      pickStory()             inquirer list
      runQuest(pack, story)
        resolveSteps()        flatten BranchPoints via pickBranch()
        for each step:
          renderStepIntro()   typewriter narration + objective panel
          promptCommand()     input or select
          verifyShell/Which/Prompt()
          markStepComplete()  xp += gain; level = levelForXp(xp)
          saveProgress()      atomic write
      renderQuestComplete()   victory panel
```

There are no network calls in the engine. Quest packs ship bundled. The only external I/O is: the user's shell (command execution) and the progress JSON file.

---

## 5. CLI ↔ Web parity

The web app (`web/`) re-implements `src/engine/` in TypeScript under `web/lib/`. The logic must stay in sync:

| CLI | Web | Notes |
|---|---|---|
| `verifier.js` | `verifier.ts` | Same predicates; web runs against `shell-sim.ts` not a real subprocess |
| `hints.js` | `hints.ts` | Identical math |
| `xp.js` | `xp.ts` | Identical math |
| `progress.js` | `progress.ts` | localStorage instead of JSON file |
| `quests/*.js` | `web/lib/quests/*.ts` | Must stay in sync — edit both when changing a pack |

`which` mode always returns `ok: true` in the browser (tool presence is assumed). The shell simulator (`shell-sim.ts`) handles `ls`, `cd`, `cat`, `git`, `gh`, `npm`, and more with realistic stateful responses.

---

## 6. Key decisions and trade-offs

**Node.js over Python** — the TUI animation ecosystem is richer and produces a more polished feel with less code.

**Pure-data pack format** — contributions are safer (no arbitrary code unless declared in `custom`) and the engine stays decoupled. Packs import nothing from the engine.

**Real shell, not sandbox** — for fidelity. "Learn the real CLI" is the promise. Mitigated by narration, hints, and explicit confirm before skips.

**Stories + branching** — adds narrative depth without extra engine complexity. Branching is resolved up-front (before the step loop) so the state machine stays simple.

**XP penalty per hint** — encourages genuine learning without blocking progress. The minimum XP floor (25% or 5, whichever is higher) ensures the player always earns *something*.

---

## 7. Testing strategy

| Scope | Location | Approach |
|---|---|---|
| Verifier predicates | `test/verifier.test.js` | Unit, fake shell (`TT_FAKE_SHELL=1`) |
| Pack schema validation | `test/loader.test.js` | Unit, valid + invalid packs |
| Progress store | `test/progress.test.js` | Unit, tmp dir (`TT_PROGRESS_DIR`) |
| XP / level math | `test/xp.test.js` | Unit, pure functions |
| Hint ladder | `test/hints.test.js` | Unit, pure functions |
| State machine | `test/runner.test.js` | Integration, scripted UI mock |
| End-to-end smoke | `test/app-smoke.test.js` | Full app with fake pack + fake shell |

Run all tests: `npm test`

Manual QA covers animated UI, since "does it feel good" is not automatable.

---

## 8. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Verification too strict → players get stuck | Lenient predicates (contains over equals, regex over literal); progressive hint ladder ending near the answer; skip option |
| Terminal compatibility | Every animation has a static fallback; `NO_COLOR` is honoured |
| Quest packs drifting from real CLI behaviour | Packs are data files maintainers can patch quickly; engine reports the exact failing predicate |
| Web/CLI packs diverging | Both live in the same repo; CLAUDE.md enforces sync requirement |

---

## 9. Directory layout

```
terminal-tutor/
  bin/
    tt.js                   # entrypoint, shebang, arg parsing
  src/
    app.js                  # screens and top-level flow
    engine/
      loader.js             # quest pack discovery + schema validation + normalisation
      runner.js             # state machine (supports stories + branch points)
      verifier.js           # shell / which / prompt verifiers
      hints.js              # hint ladder + XP penalty math
      progress.js           # atomic JSON store; updates profile.level on XP change
      xp.js                 # level curve (pure)
    ui/
      theme.js              # palette, gradients, symbols, animation guards
      splash.js             # animated figlet title + static fallback
      browser.js            # quest selector + story picker
      player.js             # narration, prompts, spinner, branch picker, XP burst
      components.js         # boxed panel, progress bar, typewriter, key hint
  quests/
    copilot-cli.js          # Ghost in the Shell — 3 stories, branching paths
  web/                      # Browser version (Next.js 14, TypeScript)
    app/                    # Next.js App Router
    components/
      TerminalGame.tsx       # xterm.js terminal + full game loop
    lib/
      types.ts              # shared TypeScript types
      shell-sim.ts          # stateful shell simulator (ls, git, gh, npm, …)
      verifier.ts           # predicate evaluation (same logic as verifier.js)
      hints.ts              # hint ladder (mirrors hints.js)
      xp.ts                 # level curve (mirrors xp.js)
      progress.ts           # localStorage progress store
      quests/
        copilot-cli.ts      # TypeScript mirror of quests/copilot-cli.js
        index.ts            # re-exports all web packs
  test/
    verifier.test.js
    loader.test.js
    progress.test.js
    runner.test.js
    hints.test.js
    xp.test.js
    app-smoke.test.js
  package.json
  README.md
  TDD.md
  CLAUDE.md
  CONTRIBUTING.md
  PRD.md
```

---

## 10. Open questions

- Should hint penalties accumulate across a quest or reset per step? (Current: per step)
- Should `skip` lock out a "perfect run" badge? (Deferred to achievements work)
- Should we ship a no-install `npx terminal-tutor` entrypoint?
- Post-MVP quest packs: Claude Code CLI, Codex CLI, Terminal Basics, database CLIs (psql, mongosh)
