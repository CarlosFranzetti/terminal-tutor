import type { Pack, ShellResult } from '../types';

const CAR_ART = `
        _______________
       /|             |\\
      / |   STREET    | \\
     /__|_____________|__\\
    |      O       O      |
     \\____________________/
       oo             oo
`;

const GAME_JAM_ART = `
    ██████╗  ██████╗
   ██╔════╝ ██╔═══██╗
   ██║  ███╗██║   ██║
   ██║   ██║██║   ██║
   ╚██████╔╝╚██████╔╝
    ╚═════╝  ╚═════╝
   GAME JAM — 13 MIN LEFT
`;

const FORK_ART = `
      upstream
         |
         *  opengame/opcity
        / \\
       *   *  ← your fork
       |
    you/opcity-fast
`;

const pack: Pack = {
  id: 'github-cli',
  title: 'The GitHub Chronicles',
  synopsis: 'Three stories. One tool. Ship code with `gh` before everything falls apart.',
  tool: 'gh',
  stories: [

    // ──────────────────────────────────────────────────────────────────────
    // STORY 1: Ship the Ripoff
    // ──────────────────────────────────────────────────────────────────────
    {
      id: 'ship-the-ripoff',
      title: 'Ship the Ripoff',
      setting: 'Day 1 at Midnight Polygon Studios. Push StreetRacer Unlimited by noon or heads roll.',
      art: CAR_ART,
      steps: [
        {
          id: 's1-survey',
          narration:
            "You arrive at Midnight Polygon Studios at 8:59am. Your badge doesn't work yet. You knock. A senior dev opens the door, drops a laptop in your arms and says: \"Game's done. 47,000 lines of open-world mayhem. CEO wants it on GitHub before lunch or heads roll — probably yours.\" The door closes. You open the terminal.",
          objective: 'List the files in the project to see what you\'re dealing with.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: (r: ShellResult) => ({ ok: /src|assets|package|index|README|game|\./i.test(r.stdout) || r.stdout.length > 2, reason: 'expected a directory listing' }),
          },
          hints: ['You need to see what\'s actually in this directory.', 'The classic command for listing files is `ls`.', 'Try: `ls` or `ls -la` for details'],
          xp: 15,
        },
        {
          id: 's1-readme',
          narration:
            "There's a README in there. The CEO will ask what stack this thing is built on during his launch tweet. You should probably know before you push 47,000 lines of mystery code to the internet.",
          objective: 'Read the README.md to understand the project.',
          verify: { mode: 'shell', exitCode: 0, stdoutContains: 'StreetRacer' },
          hints: ['You want to print a file\'s contents to the terminal.', '`cat` is the classic tool for this.', 'Try: `cat README.md`'],
          xp: 15,
        },
        {
          id: 's1-git-status',
          type: 'step',
          narration:
            "Okay, Three.js and Cannon.js — solid stack. Now: is this even tracked by git? And if it is, is everything committed? You don't push a half-staged mess to a public repo.",
          objective: 'Check the git status of the project.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: (r: ShellResult) => ({ ok: /branch|modified|untracked|commit|Changes|nothing/i.test(r.stdout), reason: 'expected git status output' }),
          },
          hints: ['Git can show you the current state of the repo.', 'There\'s a `git` subcommand specifically for this.', 'Try: `git status`'],
          xp: 20,
        },
        {
          id: 's1-branch',
          type: 'branch',
          narration:
            "There are modified files and an untracked CHANGELOG. Two paths forward. You could be careful and review exactly what changed — or just stage everything and trust the process. What do you do?",
          branches: [
            {
              label: 'Review the diff first — I want to know what changed',
              flavor: 'Cautious developer. Fewer surprises.',
              steps: [
                {
                  id: 's1-b1-diff',
                  narration: "Smart. Never push blind. Check the actual diff before staging anything.",
                  objective: 'View the git diff to see what changed.',
                  verify: {
                    mode: 'shell', exitCode: 0,
                    custom: (r: ShellResult) => ({ ok: /diff|@@|player|vehicles|\+\+\+/i.test(r.stdout) || r.exitCode === 0, reason: 'expected git diff output' }),
                  },
                  hints: ['`git diff` shows you unstaged changes.', 'Run it with no arguments to see all changes.', 'Try: `git diff`'],
                  xp: 20,
                },
                {
                  id: 's1-b1-add',
                  narration: "Clean changes. No surprises. Stage it all — you've earned the confidence.",
                  objective: 'Stage all changes for commit.',
                  verify: { mode: 'shell', exitCode: 0, custom: (r: ShellResult) => ({ ok: r.exitCode === 0, reason: 'expected git add to succeed' }) },
                  hints: ['`git add` stages files for the next commit.', 'You want to add everything at once.', 'Try: `git add .` or `git add -A`'],
                  xp: 15,
                },
              ],
            },
            {
              label: 'Stage everything now — I trust the team',
              flavor: 'Fast mover. Ship it, fix it later.',
              steps: [
                {
                  id: 's1-b2-add',
                  narration: "Bold. The team knows what they're doing. Stage it all in one shot.",
                  objective: 'Stage all changes for commit.',
                  verify: { mode: 'shell', exitCode: 0, custom: (r: ShellResult) => ({ ok: r.exitCode === 0, reason: 'expected git add to succeed' }) },
                  hints: ['`git add` stages files for commit.', 'Use `.` to stage everything in the current directory.', 'Try: `git add .`'],
                  xp: 20,
                },
              ],
            },
          ],
        } as any,
        {
          id: 's1-commit',
          narration:
            "Staged. Now seal it with a commit message that future-you will respect. Something that says 'we shipped' without screaming 'we panicked.'",
          objective: 'Commit the staged changes with a meaningful message.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: (r: ShellResult) => ({ ok: /main|commit|file|changed/i.test(r.stdout), reason: 'expected a successful commit' }),
          },
          hints: ['`git commit` saves a snapshot of staged changes.', 'Always include a message with the `-m` flag.', 'Try: `git commit -m "feat: v0.9.0 — ready to ship"`'],
          xp: 25,
        },
        {
          id: 's1-gh-check',
          narration:
            "11:34am. Twenty-six minutes. Time to create the remote repo. But first — is `gh` even installed? A junior dev once tried to do this manually via the API at noon. They are no longer with us.",
          objective: 'Confirm the `gh` CLI is installed and print its version.',
          verify: { mode: 'shell', exitCode: 0, stdoutMatches: 'gh version' },
          hints: ['Most CLIs have a flag to print their version.', 'It usually involves the word `version`.', 'Try: `gh --version`'],
          xp: 15,
        },
        {
          id: 's1-auth',
          narration:
            "Version checks out — recent build. Now: are you authenticated? `gh` needs to know who you are before it creates anything on your behalf.",
          objective: 'Check your GitHub authentication status.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: /github\.com|Logged in|carlosfranzetti|oauth/i.test(r.stdout + r.stderr), reason: 'expected auth status output' }),
          },
          hints: ['There is a subcommand family for auth.', 'It starts with `gh auth`.', 'Try: `gh auth status`'],
          xp: 20,
        },
        {
          id: 's1-create',
          narration:
            "Authenticated. 11:41am. Nineteen minutes. Create the repo. Public — the CEO explicitly said 'the people should be able to fork this.' You've never agreed with him on anything before today.",
          objective: 'Create a public GitHub repo for the game.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: (r: ShellResult) => ({ ok: /Created|github\.com|street-racer|repository/i.test(r.stdout), reason: 'expected repo creation output' }),
          },
          hints: ['`gh repo create` creates a new remote repository.', 'Use `--public` to make it public.', 'Try: `gh repo create street-racer-unlimited --public`'],
          xp: 35,
        },
        {
          id: 's1-push',
          narration:
            "The remote exists. The commit is ready. 11:47am. Thirteen minutes. One command stands between 47,000 lines of chaos and the entire internet.",
          objective: 'Push the code to GitHub.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: (r: ShellResult) => ({ ok: /main|Writing objects|done|->|branch/i.test(r.stdout), reason: 'expected push output' }),
          },
          hints: ['`git push` sends your commits to the remote.', 'Specify the remote (origin) and branch (main).', 'Try: `git push origin main`'],
          xp: 35,
        },
        {
          id: 's1-verify',
          narration:
            "11:49am. Eleven minutes to spare. The CEO is composing his tweet. Verify the repo is live before he tags it publicly.",
          objective: 'View the live repo to confirm it shipped.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: (r: ShellResult) => ({ ok: /street-racer|carlosfranzetti|github/i.test(r.stdout), reason: 'expected repo view output' }),
          },
          hints: ['`gh repo view` shows a repo\'s metadata.', 'Pass the repo name as `owner/repo`.', 'Try: `gh repo view carlosfranzetti/street-racer-unlimited`'],
          xp: 20,
        },
        {
          id: 's1-victory',
          narration:
            "It's live. The CEO tweets: \"We shipped. The people's GTA. Fork it. Break it. Build on it.\" 4,200 retweets in an hour. The senior dev who handed you the laptop pokes their head in: \"Not bad for day one.\" Seal the moment.",
          art: `
   ★ ★ ★  SHIPPED  ★ ★ ★
        _____
       /     \\
      |  GH   |
      |  ✓    |
       \\_____/
          |
        __|__
       /     \\
`,
          objective: 'Echo a message containing "shipped".',
          verify: { mode: 'shell', exitCode: 0, stdoutContains: 'shipped' },
          hints: ['Use `echo` to print text.', 'Your message just needs to include "shipped".', 'Try: `echo "StreetRacer Unlimited: shipped"`'],
          xp: 25,
        },
      ],
    },

    // ──────────────────────────────────────────────────────────────────────
    // STORY 2: The Midnight Deploy
    // ──────────────────────────────────────────────────────────────────────
    {
      id: 'midnight-deploy',
      title: 'The Midnight Deploy',
      setting: '2:47am. Your indie game "Neon Heist" just won the 48-hour game jam. You have 13 minutes to submit it on GitHub.',
      art: GAME_JAM_ART,
      steps: [
        {
          id: 's2-survey',
          narration:
            "2:47am. The jam ends at 3:00am. The judges need a GitHub link. Your game \"Neon Heist\" — a neon cyberpunk heist game built in 47 hours and 58 minutes of caffeine-fuelled chaos — is sitting on your laptop. You open the terminal. Thirteen minutes.",
          objective: 'Find out where you are and what files are here.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: (r: ShellResult) => ({ ok: r.stdout.length > 1 || r.exitCode === 0, reason: 'expected some output' }),
          },
          hints: ['Check your current directory with `pwd` and list files with `ls`.', 'Both are useful here.', 'Try: `ls` or `pwd`'],
          xp: 10,
        },
        {
          id: 's2-git-status',
          narration:
            "Files are here. 2:48am. Now — does git know about any of this? The whole last hour of features might be uncommitted. Check.",
          objective: 'Check git status.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: (r: ShellResult) => ({ ok: /branch|modified|untracked|commit|Changes/i.test(r.stdout), reason: 'expected git status output' }),
          },
          hints: ['`git status` shows the current state of your repo.', 'It tells you what\'s staged, unstaged, and untracked.', 'Try: `git status`'],
          xp: 20,
        },
        {
          id: 's2-add',
          narration:
            "2:49am. Modified files and the final boss audio untracked. Eleven minutes. Stage everything — no time to be precious.",
          objective: 'Stage all changes.',
          verify: { mode: 'shell', exitCode: 0, custom: (r: ShellResult) => ({ ok: r.exitCode === 0, reason: 'expected git add to succeed' }) },
          hints: ['`git add` stages files.', '`.` means "all files in the current directory".', 'Try: `git add .`'],
          xp: 15,
        },
        {
          id: 's2-commit',
          narration:
            "2:50am. Ten minutes. Commit message. The judges will see this. Make it count — or at least make it coherent.",
          objective: 'Commit with a message that represents the game well.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: (r: ShellResult) => ({ ok: /commit|main|file/i.test(r.stdout), reason: 'expected commit success' }),
          },
          hints: ['`git commit -m` commits with a message.', 'Keep it professional — judges will read it.', 'Try: `git commit -m "feat: Neon Heist — game jam submission"`'],
          xp: 20,
        },
        {
          id: 's2-auth',
          narration:
            "2:51am. Nine minutes. Is `gh` authenticated? The last thing you need right now is a login prompt.",
          objective: 'Check your GitHub auth status.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: /github\.com|Logged in|carlosfranzetti/i.test(r.stdout + r.stderr), reason: 'expected auth status' }),
          },
          hints: ['`gh auth status` shows your GitHub login state.', 'Run it now before you hit a wall at 2:58am.', 'Try: `gh auth status`'],
          xp: 15,
        },
        {
          id: 's2-create',
          narration:
            "2:52am. Eight minutes. Authenticated. Create the repo. Public. Game jam submissions must be public.",
          objective: 'Create a public GitHub repo called `neon-heist`.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: (r: ShellResult) => ({ ok: /Created|github\.com|neon-heist|repository/i.test(r.stdout), reason: 'expected repo creation' }),
          },
          hints: ['`gh repo create` creates a remote repo.', 'Use `--public` to make it publicly accessible.', 'Try: `gh repo create neon-heist --public`'],
          xp: 30,
        },
        {
          id: 's2-push',
          narration:
            "2:54am. Six minutes. The remote is live. Push the commit. Everything. Now.",
          objective: 'Push to GitHub.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: (r: ShellResult) => ({ ok: /main|objects|done|branch/i.test(r.stdout), reason: 'expected push output' }),
          },
          hints: ['`git push origin main` sends your commits up.', 'If it asks about upstream, use `-u` flag.', 'Try: `git push origin main` or `git push -u origin main`'],
          xp: 30,
        },
        {
          id: 's2-branch',
          type: 'branch',
          narration:
            "2:56am. Four minutes. The push succeeded. Two things you could do: check the repo is live, or go straight to writing the submission form URL. What's it gonna be?",
          branches: [
            {
              label: 'Verify the repo first — I need to confirm it\'s public',
              flavor: 'Double-checker. You have the time.',
              steps: [
                {
                  id: 's2-b1-view',
                  narration: "2:57am. Three minutes. Quick — verify it's live and actually public.",
                  objective: 'View the repo to confirm it\'s live.',
                  verify: {
                    mode: 'shell', exitCode: 0,
                    custom: (r: ShellResult) => ({ ok: /neon-heist|github|public/i.test(r.stdout), reason: 'expected repo view' }),
                  },
                  hints: ['`gh repo view` shows repo details.', 'It confirms the repo exists and its visibility.', 'Try: `gh repo view carlosfranzetti/neon-heist`'],
                  xp: 15,
                },
              ],
            },
            {
              label: 'Straight to the submission — I trust the push succeeded',
              flavor: 'Go fast. You\'ve done this before.',
              steps: [
                {
                  id: 's2-b2-echo',
                  narration: "2:57am. Maximum confidence. Print the URL and paste it in the form.",
                  objective: 'Echo the repo URL so you can paste it.',
                  verify: { mode: 'shell', exitCode: 0, stdoutContains: 'github.com' },
                  hints: ['Print the GitHub URL with echo.', 'It follows the pattern: github.com/username/repo.', 'Try: `echo "https://github.com/carlosfranzetti/neon-heist"`'],
                  xp: 15,
                },
              ],
            },
          ],
        } as any,
        {
          id: 's2-victory',
          narration:
            "2:59am. One minute to spare. Submission sent. You set your laptop down, lean back, and the caffeine crash hits like a truck. Six hours later you wake up to a notification: \"🏆 Neon Heist — Best Overall, 48hr Game Jam.\" Your GitHub gets 847 stars overnight.",
          art: `
  ╔═══════════════════╗
  ║   🏆 FIRST PLACE  ║
  ║   NEON HEIST      ║
  ║   48hr Game Jam   ║
  ╚═══════════════════╝
`,
          objective: 'Print "winner" to celebrate.',
          verify: { mode: 'shell', exitCode: 0, stdoutContains: 'winner' },
          hints: ['Use `echo`.', 'Include the word "winner".', 'Try: `echo "game jam winner"`'],
          xp: 30,
        },
      ],
    },

    // ──────────────────────────────────────────────────────────────────────
    // STORY 3: Fork the World
    // ──────────────────────────────────────────────────────────────────────
    {
      id: 'fork-the-world',
      title: 'Fork the World',
      setting: 'You found a 40% physics speedup in "OpCity" (open-source GTA clone). The maintainer is MIA. Time to fork.',
      art: FORK_ART,
      steps: [
        {
          id: 's3-recon',
          narration:
            "You've been playing OpCity — an open-source GTA clone — for weeks. Last night, at 1am, you spotted it: the physics engine re-runs collision detection on objects that haven't moved. Removing that check makes the game 40% faster on low-end hardware. You filed an issue two weeks ago. The maintainer has been silent for three months. The community deserves this fix. Time to fork.",
          objective: 'View the upstream repo to understand what you\'re forking.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: (r: ShellResult) => ({ ok: /opcity|github|opengame|public|description/i.test(r.stdout), reason: 'expected repo info' }),
          },
          hints: ['Before forking, look at the source repo.', '`gh repo view` can show any public repo.', 'Try: `gh repo view opengame/opcity`'],
          xp: 20,
        },
        {
          id: 's3-check-auth',
          narration:
            "Good. 2,400 stars, actively used by thousands. Your fix will matter. Before you fork, make sure `gh` knows who you are — your fork will live under your account.",
          objective: 'Check your GitHub auth status.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: /github\.com|carlosfranzetti|Logged in/i.test(r.stdout + r.stderr), reason: 'expected auth output' }),
          },
          hints: ['`gh auth status` shows your authenticated identity.', 'Your fork will be created under your account.', 'Try: `gh auth status`'],
          xp: 15,
        },
        {
          id: 's3-fork',
          narration:
            "Authenticated. Fork it. This creates a copy of the repo under your account that you can push to freely, then open a PR from.",
          objective: 'Fork the `opengame/opcity` repository.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: (r: ShellResult) => ({ ok: /fork|Created|carlosfranzetti|opcity|github/i.test(r.stdout) || r.exitCode === 0, reason: 'expected fork output' }),
          },
          hints: ['`gh repo fork` creates a fork under your account.', 'Pass the upstream repo as `owner/repo`.', 'Try: `gh repo fork opengame/opcity`'],
          xp: 35,
        },
        {
          id: 's3-clone',
          narration:
            "Your fork is live. Clone it locally so you can make the change.",
          objective: 'Clone your fork to work on it locally.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: (r: ShellResult) => ({ ok: /Cloning|done|objects|opcity/i.test(r.stdout), reason: 'expected clone output' }),
          },
          hints: ['`git clone` downloads a repo to your machine.', 'Clone your fork (not the upstream).', 'Try: `git clone https://github.com/carlosfranzetti/opcity.git`'],
          xp: 20,
        },
        {
          id: 's3-explore',
          narration:
            "Cloned. Now navigate the codebase. The physics engine is somewhere in `src/`. Find it.",
          objective: 'List the files in the `src/` directory.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: (r: ShellResult) => ({ ok: /physics|engine|game|player|src|\.js/i.test(r.stdout) || r.stdout.length > 2, reason: 'expected a file listing' }),
          },
          hints: ['`ls` lists directory contents.', 'Pass the directory name as an argument.', 'Try: `ls src/`'],
          xp: 15,
        },
        {
          id: 's3-read',
          narration:
            "There it is — `src/physics.js`. Read it. Find the collision detection loop you're about to fix.",
          objective: 'Read the physics engine file.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: (r: ShellResult) => ({ ok: r.exitCode === 0, reason: 'expected file contents' }),
          },
          hints: ['`cat` prints file contents.', 'You want to read `src/physics.js`.', 'Try: `cat src/physics.js`'],
          xp: 15,
        },
        {
          id: 's3-branch',
          type: 'branch',
          narration:
            "You've read the physics engine. The redundant collision check is on line 247. Before committing your fix, you need to create a branch. Two naming conventions: feature branches or fix branches. Pick your style.",
          branches: [
            {
              label: 'Create a fix branch: fix/static-collision-skip',
              flavor: 'Bug fix framing — this is correcting a defect.',
              steps: [
                {
                  id: 's3-b1-branch',
                  narration: "Fix branches communicate urgency and correctness. Create it.",
                  objective: 'Create a new branch called `fix/static-collision-skip`.',
                  verify: {
                    mode: 'shell', exitCode: 0,
                    custom: (r: ShellResult) => ({ ok: r.exitCode === 0, reason: 'expected branch creation' }),
                  },
                  hints: ['`git checkout -b` creates and switches to a new branch.', 'Name the branch descriptively.', 'Try: `git checkout -b fix/static-collision-skip`'],
                  xp: 20,
                },
              ],
            },
            {
              label: 'Create a perf branch: perf/skip-static-collision',
              flavor: 'Performance framing — this is an optimization.',
              steps: [
                {
                  id: 's3-b2-branch',
                  narration: "Perf branches communicate the win clearly. Create it.",
                  objective: 'Create a branch called `perf/skip-static-collision`.',
                  verify: {
                    mode: 'shell', exitCode: 0,
                    custom: (r: ShellResult) => ({ ok: r.exitCode === 0, reason: 'expected branch creation' }),
                  },
                  hints: ['`git checkout -b` creates and switches to a new branch.', 'Use `perf/` prefix for performance improvements.', 'Try: `git checkout -b perf/skip-static-collision`'],
                  xp: 20,
                },
              ],
            },
          ],
        } as any,
        {
          id: 's3-commit-fix',
          narration:
            "You make the change — three lines removed, a comment added explaining why, and a benchmark showing 40% improvement on the commit message. Stage and commit.",
          objective: 'Stage and commit the physics fix.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: (r: ShellResult) => ({ ok: /commit|main|file|changed/i.test(r.stdout) || r.exitCode === 0, reason: 'expected a commit' }),
          },
          hints: ['Stage with `git add .` then commit with `git commit -m`.', 'Include a description of the fix in the message.', 'Try: `git add . && git commit -m "perf: skip collision check for static objects (+40% fps)"`'],
          xp: 25,
        },
        {
          id: 's3-push-branch',
          narration:
            "Committed. Push your branch to your fork so you can open a PR.",
          objective: 'Push your branch to your fork on GitHub.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: (r: ShellResult) => ({ ok: /objects|done|branch|main|->|perf|fix/i.test(r.stdout), reason: 'expected push output' }),
          },
          hints: ['Push to your fork with `git push origin <branch-name>`.', 'Your branch name is what you created in the previous step.', 'Try: `git push origin perf/skip-static-collision` (or your branch name)'],
          xp: 25,
        },
        {
          id: 's3-pr',
          narration:
            "Branch is on GitHub. Now open the pull request to the upstream repo. This is your pitch to the maintainer (and the whole community watching).",
          objective: 'Open a pull request to the upstream repo.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: (r: ShellResult) => ({ ok: /pull|PR|Created|github\.com|request/i.test(r.stdout) || r.exitCode === 0, reason: 'expected PR creation' }),
          },
          hints: ['`gh pr create` opens a PR from your branch to the upstream.', 'Add a title with `--title` and a body with `--body`.', 'Try: `gh pr create --title "perf: skip collision for static objects (+40% fps)" --body "Removes redundant collision checks"`'],
          xp: 40,
        },
        {
          id: 's3-victory',
          narration:
            "The PR is open. The community responds within the hour. 23 upvotes, 3 \"this fixed my game\" comments, and one message from the maintainer who just came back from a sabbatical: \"Merging. Thank you for not giving up on this.\" Two weeks later OpCity 1.4 ships with your change in the credits.",
          art: `
  ┌────────────────────────────┐
  │  PR MERGED  ✓              │
  │  perf: +40% physics fps    │
  │  contributor: you          │
  └────────────────────────────┘
`,
          objective: 'Print "merged" to mark the moment.',
          verify: { mode: 'shell', exitCode: 0, stdoutContains: 'merged' },
          hints: ['Use `echo`.', 'Include "merged".', 'Try: `echo "PR merged — 40% faster for everyone"`'],
          xp: 30,
        },
      ],
    },
  ],
};

export default pack;
