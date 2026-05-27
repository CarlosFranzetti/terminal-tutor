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

- **Story-driven learning**: Each quest is a narrative adventure that teaches real CLI commands
- **Dual mode**: Play in your actual terminal or in-browser with xterm.js emulation
- **Real command verification**: Runs and validates actual shell commands, not just simulations
- **Progress tracking**: Saves your XP and progress to localStorage
- **Extensible quest system**: Add new CLI tools by dropping a single `.js` file
- **Hint system**: Get unstuck with progressive hints (small XP penalty)
- **No setup for browser**: Jump in immediately at terminal-tutor.vercel.app

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

## Demo

**Live Demo**: [terminal-tutor.vercel.app](https://terminal-tutor.vercel.app)

Two quests available:
- **Ship the Ripoff** — Learn `gh` and `git` basics (12 steps, 250 XP)
- **Summon the Copilot** — Master `gh copilot` commands (9 steps, 220 XP)

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

## Future Improvements

- More quest packs for popular CLI tools (npm, docker, aws)
- Multiplayer mode for classroom settings
- Achievement badges and leaderboards
- Custom quest editor UI
- Mobile-friendly touch controls

---

## Contributing

New quest packs are the highest-leverage contribution! Each pack teaches a whole CLI tool through narrative. Check `TDD.md` for technical details.

```bash
npm test  # Run tests before submitting PR
```

## License

MIT — Carlos Franzetti