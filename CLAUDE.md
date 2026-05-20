# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

Terminal Tutor is a Node.js CLI (`tt`) that teaches real command-line tools through short story-driven quests. A **quest pack** is a single declarative JavaScript file under `quests/` that the engine auto-loads. Each step of a quest has narration, an objective, a verification spec, and a ladder of progressive hints. The engine runs commands in the user's real shell and verifies stdout/stderr/exit-code predicates. Progress is persisted to `~/.terminal-tutor/progress.json`.

See `TDD.md` for the full architecture. See `README.md` for the user-facing story and the quest-pack authoring guide.

## Stack

Runtime: Node.js 18+ with ESM (`"type": "module"`).
Core libraries: `chalk`, `gradient-string`, `figlet`, `chalk-animation`, `boxen`, `ora`, `cli-progress`, `@inquirer/prompts`.
No native deps. No network calls in the app itself (the user's commands may hit the network — that's fine).
Test runner: `node --test` (Node's built-in).

## Directory map

```
bin/tt.js          Entry point. Shebang, arg parsing, dispatch to app.js.
src/app.js         Top-level screens: splash → browser → player → summary.
src/engine/
  loader.js        Discovers quests/*.js, validates shape, returns catalog.
  runner.js        Quest state machine (narrate, await_command, verifying, resolve).
  verifier.js      shell / which / prompt verifiers.
  hints.js         Hint ladder + per-step XP penalty.
  progress.js      Atomic JSON store at ~/.terminal-tutor/progress.json.
  xp.js            level = ceil(sqrt(xp / 50)).
src/ui/
  theme.js         Palette, gradients, symbols.
  splash.js        Figlet title + chalk-animation intro, then static.
  browser.js       Inquirer list of quest packs with resume badges.
  player.js        Narration, typewriter, boxed objective, spinner, XP burst.
  components.js    Shared: typewriter, boxed panel, progress bar, divider.
quests/
  github-cli.js    MVP pack #1.
  copilot-cli.js   MVP pack #2.
test/              Unit + integration tests.
web/               Browser version (Next.js 14, App Router, TypeScript).
  app/             Next.js routes.
  components/
    TerminalGame.tsx  xterm.js terminal + full game loop (mirrors runner.js logic).
  lib/             TypeScript mirror of src/engine/ — same predicates, different shell.
    shell-sim.ts   Simulated shell (ls, git, gh, npm, …) — replaces real subprocess.
    verifier.ts    Predicate evaluation — same logic as CLI verifier.js.
    quests/        TypeScript quest packs (must stay in sync with quests/).
```

## CLI ↔ Web parity

The web app re-implements `src/engine/` in TypeScript under `web/lib/`. The logic must stay in sync:
- `verifier.ts` mirrors `verifier.js` — same predicates, but runs against `shell-sim.ts` instead of a real subprocess.
- `which` mode always returns `ok: true` in the browser (tool presence is assumed).
- Quest packs exist in both `quests/` (CLI, JS) and `web/lib/quests/` (web, TS). When editing a quest, update both.

## Running and testing

```bash
# CLI
npm install
node bin/tt.js           # launch directly
npm link && tt           # install globally as `tt`
npm test                 # run all tests
node --test test/<file>.test.js   # run a single test file

# Web
cd web && npm install
npm run dev              # http://localhost:3000
npm run build            # production build
```

Environment flags the code respects:
- `NO_COLOR=1` — disable color and animations (static fallbacks).
- `TT_PROGRESS_DIR` — override the progress directory (used by tests).
- `TT_FAKE_SHELL=1` — verifier uses a deterministic fake shell (used by the smoke test).

## Invariants (don't break these)

1. **Quest packs are pure data.** A pack file must not import from `src/engine` or `src/ui`. The only function a pack may include is a `custom` verifier, which receives `{ stdout, stderr, exitCode }` and returns `{ ok, reason }`.
2. **Progress writes are atomic.** Always write to a temp file then `rename`. Never leave the progress file truncated.
3. **The state machine persists after every successful step.** If you add a new transition, update `progress.js` from the same place you would emit the "step complete" event.
4. **The UI kit is the only layer allowed to call `console.log`.** Engine code returns data; `src/ui` renders it. This keeps the engine unit-testable.
5. **Every animation has a static fallback.** If `NO_COLOR` is set or the terminal reports <60 columns, skip animations and render the static version.
6. **Verification is lenient by default.** Prefer `stdoutContains` and regex over exact matches. When adding a predicate, default to "match if any match" not "match only if all match."

## Conventions

- ESM everywhere. Files end in `.js`, import with explicit extensions (`./verifier.js`).
- Two-space indent, single quotes, semicolons on.
- Filenames are kebab-case; exported functions are camelCase; types (JSDoc) are PascalCase.
- Small files (<200 lines) over big ones. If a file grows past that, split by responsibility.
- No default exports from engine modules — named exports only — except quest packs, which default-export their object.
- Every user-visible string goes through `src/ui/theme.js` so the tone and color palette stay consistent.

## How to add a new quest pack

1. Create `quests/<slug>.js` exporting a default object with `id`, `title`, `synopsis`, `tool`, `steps`.
2. Each step needs `id`, `narration`, `objective`, `verify`, `hints` (3+), and `xp`.
3. Write narration in second person ("You stand at the gates…"), objectives as imperatives, and hints from oblique → nearly-explicit.
4. Prefer `stdoutContains` / `stdoutMatches` over brittle exact checks.
5. Run `npm test` — the loader's schema test will catch shape errors.
6. Launch the app and play through the new pack end to end.

See `README.md` for the full pack authoring guide and `TDD.md` §3.1 for the schema.

## How to add a new verification mode

Add the mode name to the schema in `src/engine/loader.js`, add a branch in `src/engine/verifier.js` that returns `{ ok: boolean, reason?: string, detail?: string }`, and add a unit test under `test/verifier.test.js` covering success and the failure reasons.

## What not to do

- Don't add telemetry. There is no network call in the engine.
- Don't add destructive verifiers (e.g. auto-running `rm`). The user types and runs their own commands; we only observe.
- Don't couple the engine to a specific shell. Shell resolution lives in one place in `verifier.js`.
- Don't block on slow animations. Any animation lasting more than a few seconds has a skip path.
- Don't introduce a build step for MVP. The app runs straight from source with Node 18+.

## Current status

MVP in progress. GitHub CLI and Copilot CLI packs ship in MVP; Claude Code, Codex CLI, Terminal Basics, and database packs are post-MVP (see PRD).
