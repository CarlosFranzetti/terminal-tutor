# Terminal Tutor

**Gamified, story-driven CLI trainer that runs in your real terminal.**
Learn `gh`, the GitHub Copilot CLI, and more through short narrative quests that verify real commands in your shell.

```
   ______              _           __   ______      __
  /_  __/__  ________ (_)__  ___ _/ /  /_  __/_ __/ /____  ____
   / / / _ \/ __/ __ // / _ \/ _ `/ /    / / / // / __/ _ \/ __/
  /_/  \___/_/ /_/ /_/_/_//_/\_,_/_/    /_/  \_,_/\__/\___/_/
```

## Why

CLI tools are powerful but the on-ramp is brutal: sprawling docs, out-of-date blog posts, copy-paste commands you don't understand. Terminal Tutor replaces that with **quests** — short, themed missions where each beat of the story maps to a real command you run in your own shell. Terminal Tutor watches what you run, verifies it worked, and unlocks the next beat. You finish a quest having actually used the tool, not just read about it.

## Quick start

```bash
# Requires Node 18+
npm install
npm link       # exposes the `tt` command

tt             # launch Terminal Tutor
```

You can also run it without installing:

```bash
npx terminal-tutor
```

On first launch Terminal Tutor shows an animated splash, lists the quest packs it found, and lets you pick one. Each quest has a story, numbered steps, progressive hints, and an XP reward. Progress saves after every step, so you can quit (`q`) any time and resume later.

## Controls

Inside a quest:

- **Enter** — run the command you typed
- **h** — ask for a hint (first one is oblique, each next one is more specific)
- **s** — skip this step (still advances the story, no XP)
- **q** — quit and save progress

## What ships in MVP

Two quest packs are included:

- **GitHub CLI** — install, auth, create a repo, open a PR, review issues.
- **GitHub Copilot CLI** — install, auth, and three core prompts (`explain`, `suggest`, `run`).

Plus the engine that runs them, a resume-anywhere progress store at `~/.terminal-tutor/progress.json`, a colorful animated UI, and a hint ladder with progressive XP penalties.

## Adding your own quest pack

A quest pack is a single file under `quests/` that exports a plain object. The engine loads every `quests/*.js` automatically — no registration, no rebuild.

```js
// quests/my-pack.js
export default {
  id: "my-pack",
  title: "The Pack Title",
  synopsis: "One-line pitch for the quest browser.",
  tool: "my-cli",
  steps: [
    {
      id: "install",
      narration: "You stand at the gates of the Shell Kingdom...",
      objective: "Check that `my-cli` is installed.",
      verify: { mode: "which", binary: "my-cli" },
      hints: [
        "You need to prove the tool exists on your machine.",
        "`which` is the classic way to ask your shell where a binary lives.",
        "Try: `which my-cli`"
      ],
      xp: 20
    },
    {
      id: "hello",
      narration: "The gatekeeper wants a greeting in its own tongue.",
      objective: "Run `my-cli hello` and see the greeting.",
      verify: {
        mode: "shell",
        stdoutContains: "hello",
        exitCode: 0
      },
      hints: ["Run the tool with the command it asks for.", "Try: `my-cli hello`"],
      xp: 30
    }
  ]
};
```

Drop the file in `quests/`, relaunch Terminal Tutor, and it appears in the browser.

### Verification modes

- `shell` — runs the user's command in `/bin/sh -c`; supports `exitCode`, `stdoutContains`, `stdoutMatches` (regex), `stderrContains`, and `custom(result)` predicates.
- `which` — checks whether a binary is on PATH.
- `prompt` — multiple-choice question, no shell execution.

### Design guidelines for packs

Write narration like a text adventure, not a textbook. Keep each step to one real command. Write at least three hints per step, ordered from oblique to nearly-explicit. Prefer `stdoutContains` over exact matches so the step stays robust to upstream CLI output changes. If a step will create files or remote state, say so in the narration.

## Project layout

```
bin/tt.js          # entrypoint
src/app.js         # screens and flow
src/engine/        # loader, runner, verifier, hints, progress, xp
src/ui/            # theme, splash, browser, player, components
quests/            # pack files — each pack is one file
test/              # unit and integration tests
TDD.md             # full technical design
CLAUDE.md          # repo guide for Claude
```

## Contributing

Open an issue or PR. New quest packs are the highest-leverage contribution: one well-written pack teaches a whole CLI. Bug fixes to verifiers and the engine are the second. Please run the test suite (`npm test`) before opening a PR.

## License

MIT.
