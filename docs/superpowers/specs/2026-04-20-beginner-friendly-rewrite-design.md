# Beginner-Friendly Rewrite — Design Spec

**Date:** 2026-04-20  
**Status:** Approved  
**Scope:** Option A — Content rewrite + lenient verifier

## Goal

Make Terminal Tutor genuinely teach beginners how to use `gh` and `git` from scratch. Two levers: (1) widen verifiers so reasonable command variations pass, (2) rewrite narration and hints so every step explains the *concept* before asking the player to act.

## Section 1 — Lenient Verifiers

Every step's `custom` verifier gets widened to accept common beginner variations.

### Specific rules

| Command family | Accept |
|----------------|--------|
| Listing files | `ls`, `ls -l`, `ls -la`, `ls -lah`, `ls -A`, `ll`, `la`, `pwd && ls` |
| Staging | `git add .` OR `git add -A` OR `git add --all` OR `git add src/` |
| Committing | Any `git commit -m` with any quote style and any non-empty message |
| Pushing | `git push` OR `git push -u origin main` OR `git push --set-upstream origin main` OR `git push origin main` |
| gh repo create | Flags in any order; `--public` and `--source` and `--push` each optional individually |
| git status | Any invocation of `git status` (already lenient) |
| git diff | Any invocation of `git diff` |
| git checkout -b | Any branch name (not just the exact prescribed name) |
| gh auth status | Any `gh auth` invocation |
| gh --version | Any `gh --version` or `gh version` |
| which | Always pass (already does in web; confirm in CLI) |

### Implementation approach

Replace brittle regex checks with OR-logic: `exitCode === 0 OR pattern matches`. For multi-condition checks, pass if ANY condition is met (not ALL).

### Files changed

- `quests/github-cli.js`
- `quests/copilot-cli.js`
- `web/lib/quests/github-cli.ts`
- `web/lib/quests/copilot-cli.ts`

## Section 2 — Narration & Hints Rewrite

### Narration pattern

Every step narration follows this structure:

> **[Concept sentence]** — what this thing is and why it exists.  
> **[Story sentence]** — what's happening in the narrative right now.  
> **[Action bridge]** — what the player needs to do.

Example (before):
> "11:34am. Time to create the remote repo."

Example (after):
> "GitHub is where code lives on the internet — a remote copy that anyone (or just your team) can access and clone. Creating a repo puts your local project up there. 11:34am. One command creates the remote home for StreetRacer Unlimited."

### Hint ladder pattern

Every step gets exactly 3 hints:

- **Hint 1** — Concept. Explains *what* the thing is and *why* you'd use it. No command yet.
- **Hint 2** — Shape. Names the command and its structure. No copy-paste answer.
- **Hint 3** — Exact. The full working command they can type directly.

Example (git add step):
- Hint 1: "Staging is Git's way of selecting which changes go into the next snapshot. Think of it as packing a box — you choose what goes in before sealing it with a commit."
- Hint 2: "`git add` followed by what you want to stage. Use `.` to stage everything in the current directory."
- Hint 3: "Try: `git add .`"

### Files changed

Same 4 quest files.

## Section 3 — Web Failure Feedback

### Current behavior

```
✗ Not quite. Try again.
```

### New behavior

When verification fails, show the step's first hint text as a contextual nudge, plus a reminder of the control keys:

```
✗ Not quite.
  💡 [Hint 1 text from the step]
  Type h for more hints  •  s to skip  •  q to quit
```

This surfaces the concept immediately on first failure without making the player ask for a hint.

### File changed

- `web/components/TerminalGame.tsx` — failure display block only

## Scope boundaries

- No new quest packs (post-MVP)
- No structural changes to stories or branch points
- No changes to XP values or level math
- CLI and web quest files stay in sync (same content, same verifier logic)
