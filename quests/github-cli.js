// Quest pack: The GitHub Chronicles — 3 stories, branching paths.
// Teaches: gh install/verify, auth, repo create, push, PR, fork.

const CAR_ART = `
        _______________
       /|             |\\
      / |  STREET     | \\
     /__|_____________|__\\
    |      O       O      |
     \\____________________/
       oo             oo
`;

const GAMEJAM_ART = `
   ██████╗  █████╗ ███╗   ███╗███████╗
  ██╔════╝ ██╔══██╗████╗ ████║██╔════╝
  ██║  ███╗███████║██╔████╔██║█████╗
  ██║   ██║██╔══██║██║╚██╔╝██║██╔══╝
  ╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗
   ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝
  JAM — 13 MINUTES LEFT
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

export default {
  id: 'github-cli',
  title: 'The GitHub Chronicles',
  synopsis: 'Three stories. One tool. Ship code with `gh` before everything falls apart.',
  tool: 'gh',
  stories: [

    // ── STORY 1: Ship the Ripoff ─────────────────────────────────────────────
    {
      id: 'ship-the-ripoff',
      title: 'Ship the Ripoff',
      setting: 'Day 1 at Midnight Polygon Studios. Push StreetRacer Unlimited by noon or heads roll.',
      art: CAR_ART,
      steps: [
        {
          id: 's1-survey',
          narration: "You arrive at Midnight Polygon Studios at 8:59am. A senior dev drops a laptop in your arms: \"Game's done. 47,000 lines of open-world mayhem. CEO wants it on GitHub before lunch or heads roll — probably yours.\" You open the terminal.",
          objective: 'List the files in the current directory to survey what you\'re dealing with.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: r => ({ ok: r.stdout.length > 1 || r.exitCode === 0, reason: 'expected a file listing' })
          },
          hints: ['You need to see what\'s in this directory.', 'The classic command for listing files is `ls`.', 'Try: `ls` or `ls -la`'],
          xp: 15
        },
        {
          id: 's1-git-status',
          narration: "Files look solid. Is this even tracked by git? And is everything committed? You don't push a half-staged mess to a public repo on your first day.",
          objective: 'Check the git status of the project.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: r => ({ ok: /branch|modified|untracked|commit|Changes|nothing/i.test(r.stdout + r.stderr) || r.exitCode === 0, reason: 'expected git status output' })
          },
          hints: ['Git can show you the current state of the repo.', 'There\'s a git subcommand specifically for this.', 'Try: `git status`'],
          xp: 20
        },
        {
          id: 's1-branch',
          type: 'branch',
          narration: "There are modified files. Two paths forward: be careful and review the diff, or trust the team and stage everything now.",
          branches: [
            {
              label: 'Review the diff first — I want to know what changed',
              flavor: 'Cautious developer. Fewer surprises.',
              steps: [
                {
                  id: 's1-b1-diff',
                  narration: "Smart. Never push blind. Check the actual diff before staging anything.",
                  objective: 'View the git diff to see what changed in your working tree.',
                  verify: {
                    mode: 'shell', exitCode: 0,
                    custom: r => ({ ok: r.exitCode === 0, reason: 'expected git diff output' })
                  },
                  hints: ['`git diff` shows unstaged changes.', 'Run it with no arguments to see all changes.', 'Try: `git diff`'],
                  xp: 20
                },
                {
                  id: 's1-b1-add',
                  narration: "Clean changes. No surprises. Now stage everything — you've earned the confidence.",
                  objective: 'Stage all changes for commit.',
                  verify: {
                    mode: 'shell', exitCode: 0,
                    custom: r => ({ ok: r.exitCode === 0, reason: 'expected git add to succeed' })
                  },
                  hints: ['`git add` stages files for the next commit.', 'Use `.` to stage everything.', 'Try: `git add .`'],
                  xp: 15
                }
              ]
            },
            {
              label: 'Stage everything now — I trust the team',
              flavor: 'Fast mover. Ship it, fix it later.',
              steps: [
                {
                  id: 's1-b2-add',
                  narration: "Bold. The team knows what they're doing. Stage it all in one shot.",
                  objective: 'Stage all changes for commit.',
                  verify: {
                    mode: 'shell', exitCode: 0,
                    custom: r => ({ ok: r.exitCode === 0, reason: 'expected git add to succeed' })
                  },
                  hints: ['`git add` stages files for commit.', 'Use `.` to stage everything.', 'Try: `git add .`'],
                  xp: 20
                }
              ]
            }
          ]
        },
        {
          id: 's1-commit',
          narration: "Staged. Now seal it with a commit message that future-you will respect. Something that says 'we shipped' without screaming 'we panicked.'",
          objective: 'Commit the staged changes with a descriptive message.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: r => ({ ok: /commit|file|changed|main/i.test(r.stdout + r.stderr) || r.exitCode === 0, reason: 'expected a successful commit' })
          },
          hints: ['`git commit` saves a snapshot of staged changes.', 'Always include a message with the `-m` flag.', 'Try: `git commit -m "feat: v0.9.0 ready to ship"`'],
          xp: 25
        },
        {
          id: 's1-gh-version',
          narration: "11:34am. Time to create the remote repo. But first — is `gh` even installed? A junior dev once tried this manually via the API at noon. They are no longer with us.",
          objective: 'Confirm the `gh` CLI is installed and print its version.',
          verify: { mode: 'shell', exitCode: 0, stdoutMatches: 'gh version' },
          hints: ['Most CLIs have a flag to print their version.', 'The conventional phrasing uses the word `version`.', 'Try: `gh --version`'],
          xp: 15
        },
        {
          id: 's1-auth',
          narration: "Version checks out. Now: are you authenticated? `gh` needs to know who you are before it creates anything on your behalf.",
          objective: 'Check your GitHub authentication status.',
          verify: {
            mode: 'shell',
            custom: r => ({ ok: /github\.com|Logged in|not logged/i.test(r.stdout + r.stderr), reason: 'expected auth status output' })
          },
          hints: ['`gh auth` is the subcommand for authentication.', 'You want to check the current status.', 'Try: `gh auth status`'],
          xp: 20
        },
        {
          id: 's1-repo-create',
          narration: "Authenticated. Now create the public repo on GitHub. One command. The whole game's future lives in this moment.",
          objective: 'Create a new public GitHub repo named "street-racer-unlimited".',
          verify: {
            mode: 'shell',
            custom: r => ({ ok: /Created|github\.com|repository|street-racer/i.test(r.stdout) || r.exitCode === 0, reason: 'expected repo creation output' })
          },
          hints: ['`gh repo create` creates a new GitHub repository.', 'Use `--public` to make it public and `--source=.` to push the current directory.', 'Try: `gh repo create street-racer-unlimited --public --source=. --push`'],
          xp: 30
        },
        {
          id: 's1-shipped',
          narration: "The repo is live. 47,000 lines of StreetRacer Unlimited, pushed to GitHub with 8 minutes to spare. The CEO tweets. You are no longer the new hire.",
          objective: 'Confirm the push succeeded by checking the remote repo.',
          verify: {
            mode: 'shell',
            custom: r => ({ ok: /street-racer|github\.com|carlosfranzetti|Description/i.test(r.stdout) || r.exitCode === 0, reason: 'expected repo view output' })
          },
          hints: ['You can view a remote repo with `gh`.', 'The subcommand is `gh repo view`.', 'Try: `gh repo view`'],
          xp: 20
        }
      ]
    },

    // ── STORY 2: The Midnight Deploy ─────────────────────────────────────────
    {
      id: 'midnight-deploy',
      title: 'The Midnight Deploy',
      setting: '2:47am, game jam submission. 13 minutes to push Neon Heist before the portal closes.',
      art: GAMEJAM_ART,
      steps: [
        {
          id: 's2-where',
          narration: "2:47am. The game jam portal closes at 3:00am. You have Neon Heist — a neon cyberpunk heist game — sitting on your laptop. You've been coding for 36 hours straight. The question is: where the hell are you, and is git initialized?",
          objective: 'Print your current directory and list its contents.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: r => ({ ok: r.stdout.length > 0 || r.exitCode === 0, reason: 'expected some output' })
          },
          hints: ['You need your bearings. `pwd` prints the current directory.', 'Then `ls` to see what\'s here.', 'Try: `pwd` then `ls`'],
          xp: 10
        },
        {
          id: 's2-status',
          narration: "Files are there. Now — does git know about this game? If it's not initialized, you have a 12-minute git setup ahead of you. Check the status.",
          objective: 'Check the git status of the project.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: r => ({ ok: /branch|modified|untracked|commit|Changes/i.test(r.stdout + r.stderr) || r.exitCode === 0, reason: 'expected git status output' })
          },
          hints: ['Git status shows the current state of the repository.', 'It tells you if there\'s a repo here at all.', 'Try: `git status`'],
          xp: 15
        },
        {
          id: 's2-add',
          narration: "Git is initialized. 11 minutes left. Stage everything — art, code, sound effects, that 200-line collision detection function you're weirdly proud of.",
          objective: 'Stage all project files for commit.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: r => ({ ok: r.exitCode === 0, reason: 'expected git add to succeed' })
          },
          hints: ['`git add` stages files for commit.', 'Use `.` to add everything in the current directory.', 'Try: `git add .`'],
          xp: 15
        },
        {
          id: 's2-commit',
          narration: "9 minutes. Commit. The commit message will live in git history forever. Make it good. Or at least make it honest.",
          objective: 'Commit the staged files with a message.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: r => ({ ok: /commit|file|changed/i.test(r.stdout) || r.exitCode === 0, reason: 'expected commit success' })
          },
          hints: ['`git commit -m` saves a snapshot with a message.', 'The message should describe the state of the project.', 'Try: `git commit -m "feat: neon heist v1.0 — jam submission"`'],
          xp: 20
        },
        {
          id: 's2-auth',
          narration: "7 minutes. The repo doesn't exist on GitHub yet. First: confirm you're authenticated to `gh`. If you're not logged in, you're not submitting this game.",
          objective: 'Check GitHub CLI authentication status.',
          verify: {
            mode: 'shell',
            custom: r => ({ ok: /github\.com|Logged in|not logged/i.test(r.stdout + r.stderr), reason: 'expected auth status output' })
          },
          hints: ['`gh auth` is the subcommand for authentication.', 'Check your current status.', 'Try: `gh auth status`'],
          xp: 15
        },
        {
          id: 's2-branch',
          type: 'branch',
          narration: "6 minutes. Two ways to get this live. Create the repo and push separately, or let `gh repo create` handle everything in one shot.",
          branches: [
            {
              label: 'Verify the repo exists on GitHub first',
              flavor: 'Double-check before pushing. Worth the 30 seconds.',
              steps: [
                {
                  id: 's2-b1-create',
                  narration: "Smart habit. Create the repo explicitly, then push.",
                  objective: 'Create a new public GitHub repo named "neon-heist".',
                  verify: {
                    mode: 'shell',
                    custom: r => ({ ok: /Created|github\.com|neon-heist|repository/i.test(r.stdout) || r.exitCode === 0, reason: 'expected repo creation output' })
                  },
                  hints: ['`gh repo create` creates a GitHub repository.', 'Use `--public` to make it publicly visible.', 'Try: `gh repo create neon-heist --public`'],
                  xp: 25
                },
                {
                  id: 's2-b1-push',
                  narration: "Repo exists. Push the commits. 4 minutes to midnight.",
                  objective: 'Push the commit to the remote GitHub repo.',
                  verify: {
                    mode: 'shell',
                    custom: r => ({ ok: /Writing|objects|done|->|branch|main/i.test(r.stdout + r.stderr) || r.exitCode === 0, reason: 'expected push output' })
                  },
                  hints: ['`git push` sends your local commits to the remote.', 'If the remote was just created, you may need to set upstream.', 'Try: `git push -u origin main`'],
                  xp: 20
                }
              ]
            },
            {
              label: 'One command — create and push simultaneously',
              flavor: 'Fastest path. Lives on the edge.',
              steps: [
                {
                  id: 's2-b2-create-push',
                  narration: "High efficiency. One command creates the repo AND pushes your code in a single move.",
                  objective: 'Create the GitHub repo and push all commits in one command.',
                  verify: {
                    mode: 'shell',
                    custom: r => ({ ok: /Created|github\.com|Writing|objects|neon-heist/i.test(r.stdout) || r.exitCode === 0, reason: 'expected create+push output' })
                  },
                  hints: ['`gh repo create` can create and push in one shot.', 'Use `--source=.` and `--push` together.', 'Try: `gh repo create neon-heist --public --source=. --push`'],
                  xp: 30
                }
              ]
            }
          ]
        },
        {
          id: 's2-view',
          narration: "2:58am. Two minutes to spare. The game is on GitHub. You submit the URL to the jam portal. Neon Heist is in. You put down the Red Bull.",
          objective: 'View the remote repo to confirm everything is live.',
          verify: {
            mode: 'shell',
            custom: r => ({ ok: /neon-heist|github\.com|Description|star|fork/i.test(r.stdout) || r.exitCode === 0, reason: 'expected repo view output' })
          },
          hints: ['`gh repo view` shows repository details.', 'Run it from inside your project directory.', 'Try: `gh repo view`'],
          xp: 15
        }
      ]
    },

    // ── STORY 3: Fork the World ──────────────────────────────────────────────
    {
      id: 'fork-the-world',
      title: 'Fork the World',
      setting: 'Find 40% physics speedup in open-source OpCity. Maintainer is MIA. You must fork it.',
      art: FORK_ART,
      steps: [
        {
          id: 's3-recon',
          narration: "OpCity — open-source city builder with a notoriously slow physics engine. Someone on Reddit found a 40% speedup. The maintainer hasn't responded to issues in 6 months. Time to fork it yourself.",
          objective: 'View the upstream OpCity repo on GitHub to understand what you\'re working with.',
          verify: {
            mode: 'shell',
            custom: r => ({ ok: /opcity|github\.com|Description|star|fork|language/i.test(r.stdout) || r.exitCode === 0, reason: 'expected repo info' })
          },
          hints: ['`gh repo view` shows public GitHub repositories.', 'You can view any repo by its full name.', 'Try: `gh repo view opengame/opcity`'],
          xp: 20
        },
        {
          id: 's3-auth',
          narration: "Solid codebase. 12,000 stars. Now: confirm you're authenticated before creating a fork under your own account.",
          objective: 'Check your GitHub authentication status.',
          verify: {
            mode: 'shell',
            custom: r => ({ ok: /github\.com|Logged in|not logged/i.test(r.stdout + r.stderr), reason: 'expected auth output' })
          },
          hints: ['`gh auth status` checks your authentication.', 'You must be logged in to fork repositories.', 'Try: `gh auth status`'],
          xp: 15
        },
        {
          id: 's3-fork',
          narration: "Authenticated. Fork the repo. This creates your personal copy on GitHub — where you can make changes without touching the upstream.",
          objective: 'Fork the opengame/opcity repository to your account.',
          verify: {
            mode: 'shell',
            custom: r => ({ ok: /fork|Created|opcity|github\.com/i.test(r.stdout) || r.exitCode === 0, reason: 'expected fork output' })
          },
          hints: ['`gh repo fork` creates a fork under your GitHub account.', 'You can also clone it immediately.', 'Try: `gh repo fork opengame/opcity`'],
          xp: 30
        },
        {
          id: 's3-clone',
          narration: "Forked. Now pull it down locally so you can actually touch the code.",
          objective: 'Clone your fork of OpCity to your local machine.',
          verify: {
            mode: 'shell',
            custom: r => ({ ok: /Cloning|done|objects|opcity/i.test(r.stdout + r.stderr) || r.exitCode === 0, reason: 'expected clone output' })
          },
          hints: ['`git clone` downloads a repo to your machine.', 'The URL is your forked repo, not the upstream.', 'Try: `git clone https://github.com/<you>/opcity.git`'],
          xp: 20
        },
        {
          id: 's3-branch',
          type: 'branch',
          narration: "Inside the repo. You're about to make the physics change. What do you name your branch? Convention matters when you open the PR.",
          branches: [
            {
              label: 'fix/physics-broadphase-optimization',
              flavor: 'Describes what you fixed. Conservative, clear.',
              steps: [
                {
                  id: 's3-b1-checkout',
                  narration: "Good choice. Descriptive branch names tell the story. Create it and switch over.",
                  objective: 'Create and switch to a branch named "fix/physics-broadphase-optimization".',
                  verify: {
                    mode: 'shell',
                    custom: r => ({ ok: r.exitCode === 0, reason: 'expected branch creation and switch' })
                  },
                  hints: ['`git checkout -b` creates and switches to a new branch.', 'Name it exactly as specified.', 'Try: `git checkout -b fix/physics-broadphase-optimization`'],
                  xp: 20
                }
              ]
            },
            {
              label: 'perf/40pct-physics-speedup',
              flavor: 'Quantifies the improvement. Bolder, makes the PR title write itself.',
              steps: [
                {
                  id: 's3-b2-checkout',
                  narration: "Bold. Numbers in branch names get attention from maintainers.",
                  objective: 'Create and switch to a branch named "perf/40pct-physics-speedup".',
                  verify: {
                    mode: 'shell',
                    custom: r => ({ ok: r.exitCode === 0, reason: 'expected branch creation and switch' })
                  },
                  hints: ['`git checkout -b` creates and switches to a new branch.', 'Name it exactly as specified.', 'Try: `git checkout -b perf/40pct-physics-speedup`'],
                  xp: 20
                }
              ]
            }
          ]
        },
        {
          id: 's3-push-branch',
          narration: "You've made the physics change. Staged and committed. Now push the branch up to your fork so you can open a PR from it.",
          objective: 'Push your local branch to your forked remote.',
          verify: {
            mode: 'shell',
            custom: r => ({ ok: /objects|done|branch|->|Writing/i.test(r.stdout + r.stderr) || r.exitCode === 0, reason: 'expected push output' })
          },
          hints: ['`git push` with `-u origin <branch>` sets upstream and pushes.', 'Replace `<branch>` with your branch name.', 'Try: `git push -u origin HEAD`'],
          xp: 20
        },
        {
          id: 's3-pr',
          narration: "Branch is on GitHub. Now open the pull request against the upstream repo. Even if the maintainer is slow, this is how open source works: you do the work, you open the door.",
          objective: 'Open a pull request against the upstream opengame/opcity repo.',
          verify: {
            mode: 'shell',
            custom: r => ({ ok: /pull request|PR|Created|github\.com|request/i.test(r.stdout) || r.exitCode === 0, reason: 'expected PR creation output' })
          },
          hints: ['`gh pr create` opens a pull request from your current branch.', 'Use `--repo` to target the upstream repo.', 'Try: `gh pr create --repo opengame/opcity --title "perf: 40% physics engine speedup" --body "Broadphase collision optimization"`'],
          xp: 35
        }
      ]
    }
  ]
};
