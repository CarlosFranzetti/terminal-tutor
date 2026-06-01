// Git Basics quest pack — web version (TypeScript mirror of quests/git-basics.js)
// Teaches: git status, git add, git commit, git diff, git log, git show, git checkout --, git push

import type { Pack } from '../types';

const gitBasics: Pack = {
  order: 6,
  id: 'git-basics',
  title: 'Snapshots of Bad Decisions',
  synopsis: 'Git remembers everything. So will your teammates.',
  tool: 'git',
  stories: [
    // ─── Story 1: The One-Line Fix ───────────────────────────────────────────
    {
      id: 'the-one-line-fix',
      title: 'The One-Line Fix',
      setting:
        "You were asked to fix a typo in a config file. It should have taken 30 seconds. It did take 30 seconds. But now you're staring at a modified file and wondering: how do developers actually know what's safe to save?",
      steps: [
        {
          id: 'check-status',
          narration:
            "You fixed the typo. One character. Felt good.\n\n  But now what? You've heard people talk about \"committing changes\" but you're not sure what you actually changed or whether you changed something you shouldn't have. Before you do anything else, you need to see the current state of the repo.\n\n  `git status` shows you which files are modified, which are staged, and which are untracked. It's the first command most developers run — every single time.",
          objective: 'Run `git status` to see what has changed in the repo.',
          verify: {
            mode: 'shell',
            command: 'git status',
            custom: ({ stdout, stderr, exitCode }: { stdout: string; stderr: string; exitCode: number }, input: string) => {
              if (!/git\s+status/.test(input)) return { ok: false, reason: 'use `git status`' };
              if (exitCode !== 0) return { ok: false, reason: stderr || 'git status failed — are you inside a git repo?' };
              return { ok: true };
            },
          },
          hints: [
            "git status tells you the current state of your working directory — what's modified, what's staged, and what hasn't been touched.",
            "You don't need any flags or arguments. Just run it from inside a git repo.",
            'Run exactly: git status',
          ],
          xp: 15,
        },
        {
          id: 'stage-the-fix',
          narration:
            'There it is — your modified file sitting under "Changes not staged for commit." Git knows about it. It\'s just waiting for you to say: yes, this one, include this.\n\n  `git add <file>` stages a file — it moves your change into the "ready to commit" zone. Think of it as packing a box before you ship it. You decide what goes in, then seal it with a commit.\n\n  Stage the file you changed. One file, one fix.',
          objective: 'Run `git add <filename>` to stage your modified file.',
          verify: {
            mode: 'shell',
            command: 'git status',
            custom: ({ stdout, stderr, exitCode }: { stdout: string; stderr: string; exitCode: number }, input: string) => {
              if (!/git\s+add/.test(input)) return { ok: false, reason: 'use `git add` to stage the file' };
              if (exitCode !== 0) return { ok: false, reason: stderr || 'command failed' };
              if (stdout.includes('Changes to be committed')) return { ok: true };
              return { ok: false, reason: "file doesn't appear staged — check git status" };
            },
          },
          hints: [
            'git add stages changes for commit. You give it a filename: git add src/player.js',
            "Run git status first if you're not sure which file to add. Look under \"Changes not staged for commit.\"",
            'Run: git add src/player.js',
          ],
          xp: 20,
        },
        {
          id: 'commit-the-fix',
          narration:
            'Staged. Packed. Ready to ship.\n\n  A commit is a snapshot — a permanent record in the project\'s history saying "at this moment, the code looked like this, and here\'s why." Future you (and everyone else on the team) will read your commit message when something breaks.\n\n  `git commit -m "your message"` creates the snapshot. Write something that explains what changed and why — not just "fix" or "update." You\'ll thank yourself later.',
          objective: 'Run `git commit -m "..."` with a clear, descriptive message about your change.',
          verify: {
            mode: 'shell',
            command: 'git log --oneline -1',
            custom: ({ stdout, stderr, exitCode }: { stdout: string; stderr: string; exitCode: number }, input: string) => {
              if (!/git\s+commit/.test(input)) return { ok: false, reason: 'use `git commit` to save the snapshot' };
              if (!/-m/.test(input)) return { ok: false, reason: 'add a message with the -m flag: git commit -m "your message"' };
              const message = input.match(/-m\s+["'](.+?)["']/)?.[1] ?? '';
              if (message.length < 5) return { ok: false, reason: 'write a real commit message — describe what you fixed' };
              if (/^(fix|update|change|edit|done|wip)$/i.test(message.trim()))
                return { ok: false, reason: 'be more specific — what exactly did you fix?' };
              if (exitCode !== 0) return { ok: false, reason: stderr || 'commit failed' };
              return { ok: true };
            },
          },
          hints: [
            'git commit -m "message" creates a snapshot. The message should explain what changed — future readers (including you) will thank you.',
            'Avoid one-word messages like "fix" or "update." Try: "fix typo in database config" — specific and useful.',
            'Run: git commit -m "fix typo in config file"',
          ],
          xp: 25,
        },
      ],
    },

    // ─── Story 2: It Was Just a Small Change ─────────────────────────────────
    {
      id: 'it-was-just-a-small-change',
      title: 'It Was Just a Small Change',
      setting:
        "You fixed one thing. You are almost certain you only touched one thing. And yet git status is showing three modified files. You genuinely do not remember touching two of them.",
      steps: [
        {
          id: 'assess-the-damage',
          narration:
            "Three files. You stare at the list.\n\n  One of them you definitely changed — that was the point. The other two you have no memory of touching. Maybe your editor auto-formatted something. Maybe you accidentally hit save on the wrong file. Maybe you've been at this for too long today.\n\n  Either way: `git status` tells you what changed. `git diff` tells you exactly how it changed, line by line. Run status first. Then you'll know what you're dealing with.",
          objective: 'Run `git status` to see which files are modified.',
          verify: {
            mode: 'shell',
            command: 'git status',
            custom: ({ stdout, stderr, exitCode }: { stdout: string; stderr: string; exitCode: number }, input: string) => {
              if (!/git\s+status/.test(input)) return { ok: false, reason: 'use `git status`' };
              if (exitCode !== 0) return { ok: false, reason: stderr || 'git status failed' };
              return { ok: true };
            },
          },
          hints: [
            "git status shows you what has changed since your last commit.",
            "No flags needed. Run it from inside your repo.",
            "Run exactly: git status",
          ],
          xp: 10,
        },
        {
          id: 'inspect-the-diff',
          narration:
            "Now you know the files. But knowing the file name doesn't tell you whether the change is intentional.\n\n  `git diff` shows you the exact lines that changed — additions in green, removals in red. This is how you figure out whether a file was actually edited or just touched by your editor doing something clever without asking.\n\n  Look at the diff before you commit anything. Never commit a mystery.",
          objective: 'Run `git diff` to see the exact line-by-line changes.',
          verify: {
            mode: 'shell',
            command: 'git diff',
            custom: ({ stdout, stderr, exitCode }: { stdout: string; stderr: string; exitCode: number }, input: string) => {
              if (!/git\s+diff/.test(input)) return { ok: false, reason: 'use `git diff` to inspect the changes' };
              if (exitCode !== 0) return { ok: false, reason: stderr || 'git diff failed' };
              return { ok: true };
            },
          },
          hints: [
            "git diff shows what has changed but not yet been staged. Lines starting with + were added, lines with - were removed.",
            "Run it without any arguments to see all unstaged changes across every modified file.",
            "Run exactly: git diff",
          ],
          xp: 25,
        },
        {
          id: 'commit-only-yours',
          narration:
            "Now you know: one file has your real change. The others were auto-formatted by your editor.\n\n  You have two options: commit everything together (messy history) or stage just your intentional change and commit it cleanly. The second option is better and takes five extra seconds.\n\n  Stage only the file you meant to change, then commit it. Leave the rest for later — or discard them if they're irrelevant.",
          objective: 'Stage just one of the modified files with `git add <file>` then commit it.',
          verify: {
            mode: 'shell',
            command: 'git log --oneline -1',
            custom: ({ stdout, stderr, exitCode }: { stdout: string; stderr: string; exitCode: number }, input: string) => {
              if (!/git\s+commit/.test(input)) return { ok: false, reason: 'finish by committing: git commit -m "your message"' };
              if (!/-m/.test(input)) return { ok: false, reason: 'include a message with -m' };
              if (exitCode !== 0) return { ok: false, reason: stderr || 'commit failed' };
              return { ok: true };
            },
          },
          hints: [
            "Use git add <specific-file> rather than git add . — that way only your intentional change goes in.",
            "After staging just one file, git status should show it under \"Changes to be committed\" and the others still under \"Changes not staged.\"",
            "Run: git add src/player.js then git commit -m \"your change description\"",
          ],
          xp: 30,
        },
      ],
    },

    // ─── Story 3: The Commit Message Archaeologist ────────────────────────────
    {
      id: 'the-commit-message-archaeologist',
      title: 'The Commit Message Archaeologist',
      setting:
        'Something broke. It was working on Friday. It is not working now. Someone changed something over the weekend and the only way to figure out what is to read the commit history. You open it. The last six messages are: "fix", "actual fix", "real fix", "please work", "final", "final-final".',
      steps: [
        {
          id: 'read-the-history',
          narration:
            "This is a real commit history. You've seen it before — maybe you've written it before.\n\n  `git log` shows every commit: who made it, when, and what they wrote. This is your archaeological dig through the project. The clues are whatever the developer left behind.\n\n  Sometimes the clues are useful. Sometimes the clues are \"final-final.\" Either way, this is where you start.",
          objective: 'Run `git log` to see the commit history.',
          verify: {
            mode: 'shell',
            command: 'git log --oneline',
            custom: ({ stdout, stderr, exitCode }: { stdout: string; stderr: string; exitCode: number }, input: string) => {
              if (!/git\s+log/.test(input)) return { ok: false, reason: 'use `git log` to view the history' };
              if (exitCode !== 0) return { ok: false, reason: stderr || 'git log failed' };
              return { ok: true };
            },
          },
          hints: [
            "git log prints the commit history — most recent first. Each entry shows the commit hash, author, date, and message.",
            "Try git log --oneline for a compact view — one line per commit.",
            "Run: git log --oneline",
          ],
          xp: 15,
        },
        {
          id: 'inspect-a-commit',
          narration:
            "You see the list. A parade of \"fix\" and \"update\" messages marching backward in time.\n\n  But you notice one commit that has an actual description: something that sounds related to the area that broke. You want to see exactly what that commit changed.\n\n  `git show <hash>` opens a specific commit and shows you the full diff — every line added and removed. This is how you actually understand what someone did, not just that they did something.\n\n  Copy a commit hash from your log and inspect it.",
          objective: "Run `git show <commit-hash>` to inspect a specific commit's changes.",
          verify: {
            mode: 'shell',
            command: 'git log --oneline -1',
            custom: ({ stdout, stderr, exitCode }: { stdout: string; stderr: string; exitCode: number }, input: string) => {
              if (!/git\s+show/.test(input)) return { ok: false, reason: 'use `git show <hash>` to inspect the commit' };
              if (!/git\s+show\s+[0-9a-f]{4,}/.test(input))
                return { ok: false, reason: 'provide a commit hash after git show — copy one from git log --oneline' };
              if (exitCode !== 0) return { ok: false, reason: stderr || 'git show failed — double-check the hash' };
              return { ok: true };
            },
          },
          hints: [
            "git show displays the full details of a commit including the diff. You need to give it a hash.",
            "Get a hash from git log --oneline — it's the short string of letters and numbers at the start of each line.",
            "Run: git show <paste-hash-here> — example: git show a3f9c12",
          ],
          xp: 30,
        },
      ],
    },

    // ─── Story 4: The README Disaster ────────────────────────────────────────
    {
      id: 'the-readme-disaster',
      title: 'The README Disaster',
      setting:
        "You deleted README.md. You didn't mean to — you were cleaning up the root directory and your muscle memory betrayed you. Nothing crashed. The tests still pass. Nobody has noticed yet. This somehow makes everything worse.",
      steps: [
        {
          id: 'confirm-the-crime',
          narration:
            "The first thing to do is confirm what git knows.\n\n  When you delete a tracked file, git sees it immediately — it shows up in `git status` as \"deleted.\" This is actually good news: if git is tracking it, git can restore it.\n\n  Check the status. See it for yourself.",
          objective: 'Run `git status` to confirm the deletion is tracked.',
          verify: {
            mode: 'shell',
            command: 'git status',
            custom: ({ stdout, stderr, exitCode }: { stdout: string; stderr: string; exitCode: number }, input: string) => {
              if (!/git\s+status/.test(input)) return { ok: false, reason: 'use `git status`' };
              if (exitCode !== 0) return { ok: false, reason: stderr || 'git status failed' };
              return { ok: true };
            },
          },
          hints: [
            "git status shows the current state of your working directory — including deleted files.",
            "If a file is tracked by git, deleting it will show up as a deletion under \"Changes not staged for commit.\"",
            "Run exactly: git status",
          ],
          xp: 10,
        },
        {
          id: 'restore-the-file',
          narration:
            "There it is: \"deleted: README.md.\" But it's not gone — not yet. Git still has the last committed version.\n\n  `git checkout -- <file>` restores a file to its last committed state, discarding any local changes (or in this case, the deletion). Modern git calls this `git restore <file>` — same idea, newer syntax. Either one works here.\n\n  Bring it back. Nobody ever has to know.",
          objective: 'Run `git checkout -- README.md` to restore the deleted file.',
          verify: {
            mode: 'shell',
            command: 'ls',
            custom: ({ stdout, stderr, exitCode }: { stdout: string; stderr: string; exitCode: number }, input: string) => {
              if (!/git\s+checkout\s+--/.test(input) && !/git\s+restore/.test(input)) {
                return { ok: false, reason: 'use `git checkout -- README.md` to restore the file' };
              }
              if (!/README/.test(input)) return { ok: false, reason: 'specify README.md as the file to restore' };
              if (exitCode !== 0) return { ok: false, reason: stderr || 'restore failed' };
              if (!stdout.includes('README')) return { ok: false, reason: "README.md doesn't seem to be back — try again" };
              return { ok: true };
            },
          },
          hints: [
            "git checkout -- <file> discards local changes and restores the file to its last committed state. This works for deletions too.",
            "Modern git has git restore <file> which does the same thing — use whichever you prefer.",
            "Run: git checkout -- README.md",
          ],
          xp: 30,
        },
      ],
    },

    // ─── Story 5: The End-of-Week Survival Check ─────────────────────────────
    {
      id: 'the-end-of-week-survival-check',
      title: 'The End-of-Week Survival Check',
      setting:
        "It is the end of your first full week. Your tech lead asked you to share your changes before the weekend. Before you push anything, you want to make sure your work is actually in good shape — nothing unexpected is modified, your commits are real, and your history makes enough sense that a human could read it.",
      steps: [
        {
          id: 'verify-clean-status',
          narration:
            "Before you share your work, check what's actually there.\n\n  A clean working tree — nothing modified, nothing untracked — means your changes are committed and ready. An unexpected list of modified files means you have uncommitted work sitting on your machine that no one can see.\n\n  Run `git status`. If it says \"nothing to commit, working tree clean,\" you're in good shape. If it doesn't, you need to deal with what it shows.",
          objective: 'Run `git status` to check the state of your working directory.',
          verify: {
            mode: 'shell',
            command: 'git status',
            custom: ({ stdout, stderr, exitCode }: { stdout: string; stderr: string; exitCode: number }, input: string) => {
              if (!/git\s+status/.test(input)) return { ok: false, reason: 'use `git status`' };
              if (exitCode !== 0) return { ok: false, reason: stderr || 'git status failed' };
              return { ok: true };
            },
          },
          hints: [
            "git status shows you whether your working directory is clean or whether there are uncommitted changes.",
            "\"Nothing to commit, working tree clean\" means everything is saved. Anything else means you still have work to do.",
            "Run exactly: git status",
          ],
          xp: 10,
        },
        {
          id: 'review-your-log',
          narration:
            "Status looks okay. Now check your history.\n\n  `git log` shows every commit you've made. Before you share your branch, look at the last few entries: are the messages understandable? Does the order make sense? Would a teammate reading this know what you did and why?\n\n  You're not looking for perfection — you're looking for anything that would make someone ask \"what does this mean?\"",
          objective: 'Run `git log --oneline` to review your recent commits.',
          verify: {
            mode: 'shell',
            command: 'git log --oneline',
            custom: ({ stdout, stderr, exitCode }: { stdout: string; stderr: string; exitCode: number }, input: string) => {
              if (!/git\s+log/.test(input)) return { ok: false, reason: 'use `git log` to view the history' };
              if (exitCode !== 0) return { ok: false, reason: stderr || 'git log failed' };
              return { ok: true };
            },
          },
          hints: [
            "git log shows your commit history. --oneline makes it compact — one commit per line.",
            "Look at the messages. Would someone who didn't write them understand what they mean?",
            "Run: git log --oneline",
          ],
          xp: 15,
        },
        {
          id: 'push-your-work',
          narration:
            "Status is clean. Log looks reasonable. Time to share it.\n\n  `git push` sends your committed work to the remote repository — the version everyone else can see. Until you push, your commits only exist on your machine. Pushing is how your work becomes real to the team.\n\n  End the week by shipping your work. It's a small thing, but it matters.",
          objective: 'Run `git push` to send your commits to the remote repository.',
          verify: {
            mode: 'shell',
            command: 'git log --oneline -1',
            custom: ({ stdout, stderr, exitCode }: { stdout: string; stderr: string; exitCode: number }, input: string) => {
              if (!/git\s+push/.test(input)) return { ok: false, reason: 'use `git push` to send your commits upstream' };
              if (exitCode !== 0) return { ok: false, reason: stderr || 'git push failed — do you have a remote set up?' };
              return { ok: true };
            },
          },
          hints: [
            "git push sends your local commits to the remote. The remote is usually named origin.",
            "If you're on a new branch, you may need: git push -u origin <branch-name> to set the upstream.",
            "Run: git push",
          ],
          xp: 25,
        },
      ],
    },
  ],
};

export default gitBasics;
