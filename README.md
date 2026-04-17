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

## Play it now — browser version 🌐

The web version runs entirely in your browser. No install, no setup. Looks and feels exactly like a real terminal.

👉 **[terminal-tutor.vercel.app](https://terminal-tutor.vercel.app)**

Features:
- xterm.js terminal emulator — real keyboard input, cursor, scrollback
- Simulated shell responds to `ls`, `cd`, `cat`, `git`, `gh`, `npm`, and more
- Saves progress to `localStorage` — quit any time, resume later
- Two quests included (more coming)

---

## Run it locally — CLI version 💻

```bash
# Requires Node 18+
git clone https://github.com/carlosfranzetti/terminal-tutor.git
cd terminal-tutor
npm install
node bin/tt.js
```

Or link it globally:

```bash
npm link
tt
```

---

## Quests

| Quest | Tool | Steps | XP |
|---|---|---|---|
| **Ship the Ripoff** | `gh` + `git` | 12 | 250 |
| **Summon the Copilot** | `gh copilot` | 9 | 220 |

### Ship the Ripoff
It's your first day at Midnight Polygon Studios. The CEO wants *StreetRacer Unlimited* — a GTA-inspired open-world racing game — live on GitHub before noon. You learn `ls`, `cat`, `git status/add/commit/push`, `gh auth`, `gh repo create`, and `gh repo view`.

### Summon the Copilot
Learn to install and use the GitHub Copilot CLI extension — `gh extension`, `gh copilot explain/suggest/run`.

---

## Controls (CLI)

Inside any quest:

| Key | Action |
|---|---|
| `Enter` | Run the command |
| `h` | Request a hint (penalty: −25% XP per hint) |
| `s` | Skip this step (no XP) |
| `q` | Quit and save progress |

Controls are identical in the browser version.

---

## Adding your own quest pack

A pack is a single `.js` file in `quests/` (CLI) or `web/lib/quests/` (web). Drop it in and it auto-loads.

```js
// quests/my-pack.js
export default {
  id: 'my-pack',
  title: 'The Pack Title',
  synopsis: 'One-line pitch.',
  tool: 'my-cli',
  steps: [
    {
      id: 'step-1',
      narration: 'The story beat...',
      objective: 'What the player must do.',
      verify: { mode: 'shell', stdoutContains: 'expected output', exitCode: 0 },
      hints: ['Vague hint', 'More specific', 'Nearly explicit — try: `command`'],
      xp: 30,
    },
  ],
};
```

**Verification modes:**
- `shell` — runs the command; supports `exitCode`, `stdoutContains`, `stdoutMatches` (regex), `stderrContains`, `custom(result)`
- `which` — checks a binary is on PATH
- `prompt` — multiple-choice question

---

## Web app (browser version)

The web version lives in `web/` — a Next.js 14 app with App Router and TypeScript.

```
web/
  app/              Next.js app router
  components/
    TerminalGame.tsx  xterm.js terminal + full game loop
  lib/
    quests/         Quest pack definitions (TypeScript)
    shell-sim.ts    Simulated shell (ls, git, gh, npm, …)
    verifier.ts     Predicate evaluation (same logic as CLI)
    xp.ts           XP / level math
    hints.ts        Hint ladder + XP penalty
    progress.ts     localStorage progress store
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
quests/            CLI quest packs
web/               Browser version (Next.js)
test/              Unit and integration tests
CLAUDE.md          Repo guide for AI assistants
TDD.md             Full technical design
```

---

## Contributing

Open an issue or PR. New quest packs are the highest-leverage contribution — one well-written pack teaches a whole CLI tool. Run `npm test` before opening a PR against the CLI.

## License

MIT — Carlos Franzetti
