# Beginner-Friendly Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make Terminal Tutor genuinely teach beginners by widening verifiers and rewriting narration/hints to explain concepts before asking for commands.

**Architecture:** Rewrite all 4 quest files (2 CLI, 2 web) with concept-first narration and lenient OR-logic verifiers; add hint-on-failure feedback to TerminalGame.tsx.

**Tech Stack:** Node.js ESM (CLI), Next.js + TypeScript (web), xterm.js (web terminal)

---

### Task 1: Rewrite quests/github-cli.js (CLI)

**Files:** Modify `quests/github-cli.js`

- [ ] Replace the entire file with the beginner-friendly version (see content below)
- [ ] Run `npm test` and verify no schema errors
- [ ] Commit: `git commit -m "feat: beginner-friendly narration + lenient verifiers for gh CLI quest"`

### Task 2: Rewrite quests/copilot-cli.js (CLI)

**Files:** Modify `quests/copilot-cli.js`

- [ ] Replace with beginner-friendly version
- [ ] Run `npm test`
- [ ] Commit

### Task 3: Rewrite web/lib/quests/github-cli.ts (web)

**Files:** Modify `web/lib/quests/github-cli.ts`

- [ ] Same treatment: concept narration + lenient verifiers + better hints
- [ ] Fix `stdoutMatches: 'gh version'` steps to use custom OR-logic verifier
- [ ] Fix auth steps that lack `|| r.exitCode === 0` fallback

### Task 4: Rewrite web/lib/quests/copilot-cli.ts (web)

**Files:** Modify `web/lib/quests/copilot-cli.ts`

- [ ] Same treatment
- [ ] Fix `stdoutMatches: 'gh version'` steps

### Task 5: Web failure feedback

**Files:** Modify `web/components/TerminalGame.tsx` lines ~444-448

- [ ] On verification failure, show `step.hints[0]` as contextual nudge
- [ ] Change "Type h for a hint" to "Type h for more hints"

### Task 6: Commit, push, deploy

- [ ] `git add -A && git commit -m "feat: beginner-friendly rewrite complete"`
- [ ] `git push`
- [ ] `vercel --prod`
