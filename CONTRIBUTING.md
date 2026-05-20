# Contributing to Terminal Tutor

Thanks for your interest. New quest packs are the highest-leverage contribution — one well-written pack teaches a whole CLI tool to every future user.

---

## Table of contents

1. [Quick start](#1-quick-start)
2. [Adding a quest pack (CLI)](#2-adding-a-quest-pack-cli)
3. [Keeping CLI and web in sync](#3-keeping-cli-and-web-in-sync)
4. [Verification mode reference](#4-verification-mode-reference)
5. [Writing good narration and hints](#5-writing-good-narration-and-hints)
6. [Branching stories](#6-branching-stories)
7. [Testing your pack](#7-testing-your-pack)
8. [Contributing engine or UI code](#8-contributing-engine-or-ui-code)
9. [Pull request checklist](#9-pull-request-checklist)

---

## 1. Quick start

```bash
git clone https://github.com/carlosfranzetti/terminal-tutor.git
cd terminal-tutor
npm install
node bin/tt.js      # launch and play to see the current experience
npm test            # must be green before you open a PR
```

---

## 2. Adding a quest pack (CLI)

Create a single file under `quests/` that default-exports a pack object. The engine auto-loads every `.js` file in that directory.

### Minimal pack

```js
// quests/my-tool.js

export default {
  id: 'my-tool',           // kebab-case, unique
  title: 'My Tool Quest',  // shown in the quest browser
  synopsis: 'Learn my-tool in three missions.',  // one-liner pitch
  tool: 'my-tool',         // the CLI being taught

  stories: [
    {
      id: 'story-1',
      title: 'First Mission',
      setting: 'You just got paged. The tool is not installed.',

      steps: [
        {
          id: 'check-install',
          narration: 'Before you can use my-tool, you need to confirm it is installed. Check whether it lives on your PATH.',
          objective: 'Confirm `my-tool` is on your PATH.',
          verify: { mode: 'which', binary: 'my-tool' },
          hints: [
            '`which` searches your PATH for a binary and prints its location if found.',
            '`which` followed by the binary name is all you need.',
            'Try: `which my-tool`',
          ],
          xp: 15,
        },
        {
          id: 'run-version',
          narration: 'It is installed. Confirm the version so you know what you are working with.',
          objective: 'Print the my-tool version.',
          verify: {
            mode: 'shell',
            stdoutMatches: 'my-tool\\s+v?\\d+\\.\\d+',
            exitCode: 0,
          },
          hints: [
            'Most CLI tools print their version with `--version`.',
            'Try: `my-tool --version`',
          ],
          xp: 20,
        },
      ],
    },
  ],
};
```

### Schema requirements

The loader validates every pack at startup and logs a readable error for any violation. Requirements:

| Field | Requirement |
|---|---|
| `id` | Non-empty string, unique across all packs |
| `title` | Non-empty string |
| `synopsis` | Non-empty string |
| `tool` | Non-empty string |
| `stories` | Non-empty array; each story needs `id`, `title`, `steps` |
| `step.id` | Non-empty string, unique within the pack |
| `step.narration` | Non-empty string |
| `step.objective` | Non-empty string |
| `step.hints` | Array with at least 1 entry (aim for 3+) |
| `step.xp` | Non-negative number |
| `step.verify.mode` | `'shell'` \| `'which'` \| `'prompt'` |
| `which` verify | Requires `verify.binary` (string) |
| `prompt` verify | Requires `verify.choices` (2+ items) and `verify.answer` or `verify.answers[]` |

---

## 3. Keeping CLI and web in sync

The browser version lives in `web/lib/quests/` as TypeScript. When you add or change a CLI pack, also update (or create) the matching TypeScript file.

```
quests/my-tool.js           ← CLI version (JavaScript)
web/lib/quests/my-tool.ts   ← Web version (TypeScript, same content)
web/lib/quests/index.ts     ← Add: export { default as myTool } from './my-tool';
```

The TypeScript type definitions live in `web/lib/types.ts`. The pack shape is the same — you are mostly just adding `const pack: Pack = { ... }` and the type import.

The web shell simulator (`web/lib/shell-sim.ts`) may need new command handlers if your pack uses commands it does not already handle. Check `runCommand()` in that file and add a `[/^my-tool(\s|$)/, handler]` entry if needed.

---

## 4. Verification mode reference

### `shell` — real command execution

```js
verify: {
  mode: 'shell',
  exitCode: 0,                       // optional — check exit code
  stdoutContains: 'success',         // optional — substring match
  stdoutMatches: 'v\\d+\\.\\d+',    // optional — regex match (JS regex string)
  stderrContains: 'warning',         // optional — stderr substring match
  custom: (result, input) => {       // optional — escape hatch
    const ok = /my-tool\s+run/i.test(input) && result.exitCode === 0;
    return { ok, reason: 'use my-tool run' };
  },
}
```

All predicates are AND-combined. A step passes only when every specified predicate matches.

**Prefer lenient predicates** (`stdoutContains` over exact match, `stdoutMatches` regex over `stdoutContains` when you need flexibility). This reduces false failures as upstream CLIs update their output.

**`custom` receives `(result, input)`:**
- `result` — `{ stdout: string, stderr: string, exitCode: number }`
- `input` — the raw string the user typed (before shell execution)
- return `{ ok: boolean, reason?: string }`

### `which` — binary presence check

```js
verify: { mode: 'which', binary: 'gh' }
```

Checks whether the named binary is on PATH using `which` (Unix) or `where` (Windows). Always returns `ok: true` in the browser version.

### `prompt` — multiple-choice question

```js
verify: {
  mode: 'prompt',
  choices: ['Option A', 'Option B', 'Option C'],
  answer: 'Option A',          // single correct answer
  // OR:
  answers: ['Option A', 'Option B'],  // multiple valid answers
}
```

No shell execution. The player sees an `@inquirer/prompts` `select`. Use this for conceptual checkpoints between hands-on steps.

---

## 5. Writing good narration and hints

### Narration

- **Second person, present tense.** "You stand at the repo root. The push just failed."
- **Story context first, mechanics second.** Lead with the narrative situation; the objective box delivers the technical task.
- **Keep it under ~4 sentences.** The typewriter effect makes long narration feel slow.
- **ASCII art is optional.** Use it when you want visual variety between steps.

### Hints

Write at least three hints per step, from most oblique to nearly explicit:

```js
hints: [
  // 1 — concept, no syntax
  'Most CLI tools expose their installed version through a standard flag.',

  // 2 — approach, partial syntax
  '`--version` is the conventional flag. Combine it with the tool name.',

  // 3 — nearly the answer
  'Try: `my-tool --version`',
],
```

Rules:
- Hint 1: points toward the concept, not the command
- Hint 2: names the flag or pattern, still doesn't spell it out
- Hint 3: gives the command with any sensitive values redacted — the player should be able to copy-paste with minor adaptation

Never make hint 1 so oblique that it is useless. Never make hint 3 an exact copy of the expected command without any adaptation needed — leave the learner one small step.

---

## 6. Branching stories

A `BranchPoint` in the steps array forks the path. The player picks one branch; both branches converge back into the parent step list after the branch.

```js
steps: [
  { id: 'before', /* ... */ },

  {
    id: 'the-fork',
    type: 'branch',
    narration: 'Two approaches appear. Which do you take?',
    branches: [
      {
        label: 'Approach A — theory first',
        flavor: 'Read the docs before you run anything.',
        steps: [
          { id: 'a-read-docs', /* ... */ },
        ],
      },
      {
        label: 'Approach B — hands-on first',
        flavor: 'Run it and figure it out.',
        steps: [
          { id: 'b-run-it', /* ... */ },
        ],
      },
    ],
  },

  { id: 'after-convergence', /* both paths land here */ },
],
```

**Step IDs must be unique within the pack.** Prefix branch-specific step IDs with the branch identifier (e.g. `a-read-docs`, `b-run-it`) to avoid collisions.

---

## 7. Testing your pack

```bash
npm test          # run all tests — loader validates all packs in quests/
node bin/tt.js    # play through your pack end-to-end manually
```

The loader's schema test (`test/loader.test.js`) will catch shape errors automatically. Common mistakes:

- Missing `hints` array (needs ≥ 1 entry)
- `verify.mode` not one of `shell | which | prompt`
- Duplicate step IDs
- `prompt` verify missing `choices` or `answer`/`answers`

After tests pass, play through every story and every branch manually to confirm:
- Narration reads naturally
- Verification passes on the expected commands
- Hints progress logically from oblique to explicit
- XP awards feel proportional to step difficulty

---

## 8. Contributing engine or UI code

Engine (`src/engine/`) and UI (`src/ui/`) code follows these conventions:

- ESM throughout. Files end in `.js`, imports use explicit extensions.
- Two-space indent, single quotes, semicolons on.
- Named exports only from engine modules (no default exports). Quest packs use default exports.
- Small files (<200 lines). If a file grows past that, split by responsibility.
- Engine code returns data; `src/ui/` renders it. `console.log` only in `src/ui/`.
- Every animation must have a static fallback guarded by `supportsAnimation()`.
- New verification modes: add the mode name to the schema in `loader.js` AND add the branch in `verifier.js`. Add unit tests in `test/verifier.test.js` covering success and each failure reason.

### Running a single test file

```bash
node --test test/verifier.test.js
```

---

## 9. Pull request checklist

Before opening a PR:

- [ ] `npm test` passes (27/27 green)
- [ ] New pack: played through all stories and all branches manually
- [ ] New pack: updated `web/lib/quests/` TypeScript counterpart
- [ ] New pack: updated `web/lib/quests/index.ts` export
- [ ] New verify mode: schema updated in `loader.js` + unit tests in `verifier.test.js`
- [ ] No `console.log` in engine files
- [ ] No imports from `src/engine/` or `src/ui/` inside a quest pack file
- [ ] Progress writes remain atomic (write-then-rename pattern)
