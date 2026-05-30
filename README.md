# Terminal Tutor

**Gamified, story-driven CLI trainer — learn by doing, in your real terminal or your browser.**

```
   ______              _           __   ______      __
  /_  __/__  ________ (_)__  ___ _/ /  /_  __/_ __/ /____  ____
   / / / _ \/ __/ __ // / _ \/ _ `/ /    / / / // / __/ _ \/ __/
  /_/  \___/_/ /_/ /_/_/_//_/\_,_/_/    /_/  \_,_/\__/\___/_/
```

## What is this?

Terminal Tutor replaces sprawling docs and copy-paste tutorials with **quests** — short, narrative missions where every beat of the story maps to a real command you run in your shell (or in the browser). It watches what you run, verifies it worked, and unlocks the next beat.

---

## Features

The web version runs entirely in your browser. No install, no setup. Looks and feels exactly like a real terminal.

👉 **[terminal-tutor.vercel.app](https://terminal-tutor.vercel.app)**

Features:
- xterm.js terminal emulator — real keyboard input, cursor, scrollback
- Simulated shell responds to `ls`, `cd`, `cat`, `git`, `gh`, `npm`, and more
- Saves progress to `localStorage` — quit any time, resume later

---

## Tech Stack

- **Language**: TypeScript
- **CLI**: Node.js with custom game engine
- **Web**: Next.js 14 (App Router) + xterm.js terminal emulator
- **Storage**: localStorage for progress persistence

---

## Setup

### Browser Version (Recommended)

👉 **[terminal-tutor.vercel.app](https://terminal-tutor.vercel.app)**

No installation required — just open and play!

### Local CLI Version

```bash
# Requires Node 18+
git clone https://github.com/carlosfranzetti/terminal-tutor.git
cd terminal-tutor
npm install
node bin/tt.js
```

Or install globally:

```bash
gnpm link
# Now run 'tt' from anywhere
tt
```

---

## Quest packs

| Pack | Tool | Stories | Steps | Total XP |
|---|---|---|---|---|
| **Ghost in the Shell** | `gh copilot` | 3 | 25 | ~430 |

### Ghost in the Shell — `gh copilot`

Three branching stories about using `gh copilot explain` and `gh copilot suggest` when you're stuck in the terminal.

| Story | Setting |
|---|---|
| **Summon the Copilot** | Standup in 20 minutes. Learn `gh copilot` before the sprint starts. |
| **Debug at 3am** | Production down. Cryptic error. Stack Overflow has nothing. You have Copilot. |
| **The New Hire's Secret Weapon** | Week 1. Impossible ticket. `gh copilot suggest` writes the commands you don't know yet. |

Each story has a **branching decision point** — your choice shapes the path through the quest.

---

## Screenshots

![Terminal Tutor gameplay showing story narrative and command input](screenshots/gameplay.png)

![Quest selection screen](screenshots/quests.png)

---

## Controls

| Key | Action |
|---|---|
| `Enter` | Run the command |
| `h` | Request a hint (−25% XP penalty) |
| `s` | Skip current step (no XP) |
| `q` | Quit and save progress |

---

## Adding a quest pack

A pack is a single `.js` file in `quests/`. Drop it in and it auto-loads at next launch.

### Simple pack (flat steps)

```js
// quests/my-pack.js
export default {
  id: 'my-pack',
  title: 'The Pack Title',
  synopsis: 'One-line pitch.',
  tool: 'my-cli',
  stories: [
    {
      id: 'story-1',
      title: 'Story One',
      setting: 'One-liner shown in the story picker.',
      steps: [
        {
          id: 'step-1',
          narration: 'The story beat — second person, present tense.',
          objective: 'What the player must do.',
          verify: { mode: 'shell', stdoutContains: 'expected output', exitCode: 0 },
          hints: ['Vague hint', 'More specific', 'Nearly explicit — try: `command`'],
          xp: 30,
        },
      ],
    },
  ],
};
```

### With branching

```js
steps: [
  {
    id: 'bp-1',
    type: 'branch',
    narration: 'Two paths appear before you.',
    branches: [
      {
        label: 'Path A',
        flavor: 'One-line description shown in picker.',
        steps: [/* normal steps */],
      },
      {
        label: 'Path B',
        flavor: 'Alternative route.',
        steps: [/* normal steps */],
      },
    ],
  },
],
```

### Verification modes

| Mode | What it checks |
|---|---|
| `shell` | Runs the command; evaluates `exitCode`, `stdoutContains`, `stdoutMatches` (regex), `stderrContains`, `custom(result, input)` |
| `which` | Checks a binary is on PATH (`verify.binary`) |
| `prompt` | Multiple-choice question (`verify.choices`, `verify.answer` or `verify.answers[]`) |

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full authoring guide.

---

## Web app (browser version)

The web version lives in `web/` — a Next.js 14 app with App Router and TypeScript.

```
web/
  app/              Next.js app router
  components/
    TerminalGame.tsx  xterm.js terminal + full game loop
  lib/
    quests/         Quest pack definitions (TypeScript mirrors of quests/)
    shell-sim.ts    Simulated shell (ls, git, gh, npm, …)
    verifier.ts     Predicate evaluation (same logic as CLI verifier.js)
    xp.ts           XP / level math
    hints.ts        Hint ladder + XP penalty
    progress.ts     localStorage progress store
    types.ts        Shared TypeScript types
```

### Develop the web version

```bash
cd web
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

### Deploy to Vercel

```bash
cd web
npx vercel --prod
```

---

## Project layout

```
bin/tt.js          CLI entrypoint
src/app.js         CLI screens and flow
src/engine/        loader, runner, verifier, hints, progress, xp
src/ui/            theme, splash, browser, player, components
quests/            CLI quest packs (.js)
web/               Browser version (Next.js 14, TypeScript)
test/              Unit and integration tests
CLAUDE.md          Repo guide for AI assistants
TDD.md             Full technical design document
CONTRIBUTING.md    How to add quest packs and contribute code
```

---

## Contributing

Open an issue or PR. New quest packs are the highest-leverage contribution — one well-written pack teaches a whole CLI tool. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR.

```bash
npm test   # must be green before submitting
```

## License

MIT — Carlos Franzetti
