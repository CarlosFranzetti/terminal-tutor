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
            "The terminal is your window into the file system — it lets you see what is in any folder without clicking through icons. You arrive at Midnight Polygon Studios at 8:59am. Your badge doesn't work yet. A senior dev opens the door, drops a laptop in your arms: \"Game's done. 47,000 lines of open-world mayhem. CEO wants it on GitHub before lunch or heads roll — probably yours.\" You open the terminal. First step: see what you're dealing with.",
          objective: "List the files in the project to see what you're dealing with.",
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: r.exitCode === 0, reason: 'expected a directory listing' }),
          },
          hints: [
            'The terminal lets you list files in the current folder — like opening Finder, but faster. This is how developers orient themselves in a new project.',
            '`ls` is the command for listing files. Add `-la` to see hidden files and details like file sizes and permissions.',
            'Try: `ls` or `ls -la` for details',
          ],
          xp: 15,
        },
        {
          id: 's1-readme',
          narration:
            "There is a README in there. The CEO will ask what stack this thing is built on during his launch tweet. You should know before you push 47,000 lines of mystery code to the internet. `cat` prints any file's contents directly to the terminal.",
          objective: 'Read the README.md to understand the project.',
          verify: { mode: 'shell', exitCode: 0, stdoutContains: 'StreetRacer' },
          hints: [
            '`cat` prints a file\'s contents to the terminal — like opening it in a text editor, but without leaving the command line.',
            '`cat` followed by the filename prints that file. Most projects have a README.md in the root.',
            'Try: `cat README.md`',
          ],
          xp: 15,
        },
        {
          id: 's1-git-status',
          type: 'step',
          narration:
            "Git is a version control system — it tracks every change to your code so you can go back in time, collaborate with others, and ship safely. Before pushing anything, you need to know: what has changed? Is everything committed? `git status` answers all of that.",
          objective: 'Check the git status of the project.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: /branch|modified|untracked|commit|Changes|nothing/i.test(r.stdout + r.stderr) || r.exitCode === 0, reason: 'expected git status output' }),
          },
          hints: [
            'Git keeps a log of every saved change to your code. `git status` shows you what has changed since the last save (commit), what is staged to be saved, and what is not tracked at all.',
            '`git status` shows the current state — staged, modified, and untracked files. Run it inside any git repository.',
            'Try: `git status`',
          ],
          xp: 20,
        },
        {
          id: 's1-branch',
          type: 'branch',
          narration:
            "There are modified files and an untracked CHANGELOG. Two paths forward: be careful and review exactly what changed, or stage everything and trust the process.",
          branches: [
            {
              label: 'Review the diff first — I want to know what changed',
              flavor: 'Cautious developer. Fewer surprises.',
              steps: [
                {
                  id: 's1-b1-diff',
                  narration: "A diff shows the exact lines that changed — additions in green, removals in red. Reviewing the diff before staging means no surprises end up in production. Smart developers always check.",
                  objective: 'View the git diff to see what changed.',
                  verify: {
                    mode: 'shell',
                    custom: (r: ShellResult) => ({ ok: r.exitCode === 0, reason: 'expected git diff output' }),
                  },
                  hints: [
                    'A diff compares your current files to the last committed snapshot. It shows exactly what changed and where — additions are marked with `+`, removals with `-`.',
                    '`git diff` shows unstaged changes. Run it with no arguments to see everything that has changed.',
                    'Try: `git diff`',
                  ],
                  xp: 20,
                },
                {
                  id: 's1-b1-add',
                  narration: "Staging is Git's preparation step — you choose which changes to include in the next snapshot before sealing it with a commit. `git add` picks what goes in, then `git commit` seals it.",
                  objective: 'Stage all changes for commit.',
                  verify: { mode: 'shell', exitCode: 0, custom: (r: ShellResult) => ({ ok: r.exitCode === 0, reason: 'expected git add to succeed' }) },
                  hints: [
                    'Staging means telling Git "include these changes in the next commit." You choose what to stage with `git add` — everything at once or file by file.',
                    '`git add .` stages all changes in the current directory. `-A` also works and catches deletions.',
                    'Try: `git add .` or `git add -A`',
                  ],
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
                  narration: "Bold. Staging tells Git which changes to include in the next commit. When you trust the team's work, stage everything in one shot and keep moving.",
                  objective: 'Stage all changes for commit.',
                  verify: { mode: 'shell', exitCode: 0, custom: (r: ShellResult) => ({ ok: r.exitCode === 0, reason: 'expected git add to succeed' }) },
                  hints: [
                    'Staging is how Git knows what to include in the next commit. `git add` stages files — you can add everything at once or file by file.',
                    '`git add .` stages all changes in the current directory. `-A` also works.',
                    'Try: `git add .`',
                  ],
                  xp: 20,
                },
              ],
            },
          ],
        } as any,
        {
          id: 's1-commit',
          narration:
            "A commit is a permanent snapshot in Git's history — it records exactly what changed and when, with your message explaining why. Every commit is a checkpoint you can return to. Good commit messages make you a better teammate.",
          objective: 'Commit the staged changes with a meaningful message.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: /main|commit|file|changed/i.test(r.stdout + r.stderr) || r.exitCode === 0, reason: 'expected a successful commit' }),
          },
          hints: [
            'A commit saves a permanent snapshot of your staged changes to Git\'s history with a message explaining what they contain. Future developers (including you) will read it.',
            '`git commit -m` saves staged changes. The `-m` flag lets you write the message inline in quotes. Any non-empty message works.',
            'Try: `git commit -m "feat: v0.9.0 — ready to ship"`',
          ],
          xp: 25,
        },
        {
          id: 's1-gh-check',
          narration:
            "The GitHub CLI (`gh`) lets you work with GitHub directly from your terminal — creating repos, opening PRs, checking auth — all without a browser. Before using any tool, confirm it is installed and check its version.",
          objective: 'Confirm the `gh` CLI is installed and print its version.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: r.exitCode === 0 || /gh version/i.test(r.stdout), reason: 'expected gh version output' }),
          },
          hints: [
            'CLI tools are programs you run by typing their name in the terminal. Before using one, confirm it is installed by asking it to identify itself.',
            'Most CLI tools have a flag to print their version number. This confirms the tool is installed.',
            'Try: `gh --version`',
          ],
          xp: 15,
        },
        {
          id: 's1-auth',
          narration:
            "Authentication means proving to GitHub that you are who you say you are. `gh` needs to be connected to your GitHub account before it can create repos or make any API calls on your behalf.",
          objective: 'Check your GitHub authentication status.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: /github\.com|Logged in|carlosfranzetti|oauth/i.test(r.stdout + r.stderr) || r.exitCode === 0, reason: 'expected auth status output' }),
          },
          hints: [
            'Authentication links the `gh` tool to your GitHub account. Without it, `gh` cannot create repositories or do anything that requires your identity. Think of it as logging in.',
            '`gh auth status` checks whether you are logged in, shows which account is active, and lists what permissions your token has.',
            'Try: `gh auth status`',
          ],
          xp: 20,
        },
        {
          id: 's1-create',
          narration:
            "A GitHub repository is a remote home for your code — hosted on GitHub's servers, accessible from anywhere. `gh repo create` creates one without ever opening a browser.",
          objective: 'Create a public GitHub repo for the game.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: /Created|github\.com|street-racer|repository/i.test(r.stdout) || r.exitCode === 0, reason: 'expected repo creation output' }),
          },
          hints: [
            'A repository on GitHub is a remote copy of your project that others can access, clone, and contribute to. `gh repo create` creates one under your account without needing a browser.',
            '`gh repo create` takes the repo name. Add `--public` to make it visible to everyone.',
            'Try: `gh repo create street-racer-unlimited --public`',
          ],
          xp: 35,
        },
        {
          id: 's1-push',
          narration:
            "The remote exists. Pushing sends your local commits to that remote repository on GitHub. Without this step, your code only exists on your machine.",
          objective: 'Push the code to GitHub.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: /main|Writing objects|done|->|branch/i.test(r.stdout + r.stderr) || r.exitCode === 0, reason: 'expected push output' }),
          },
          hints: [
            'Pushing uploads your local commits to the remote repository on GitHub. Without this step, your code only exists locally.',
            '`git push origin main` pushes your commits to the `main` branch on GitHub. Add `-u` to set the upstream link for future pushes.',
            'Try: `git push origin main` or `git push -u origin main`',
          ],
          xp: 35,
        },
        {
          id: 's1-verify',
          narration:
            "11:49am. Eleven minutes to spare. Verify the repo is live. `gh repo view` shows the repo details right in your terminal — no browser needed.",
          objective: 'View the live repo to confirm it shipped.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: /street-racer|carlosfranzetti|github/i.test(r.stdout) || r.exitCode === 0, reason: 'expected repo view output' }),
          },
          hints: [
            'After pushing, verify your repository is live without opening a browser. `gh repo view` shows name, description, URL, and visibility.',
            '`gh repo view` shows the current project\'s remote repo. You can also pass `owner/repo` to view any public repo.',
            'Try: `gh repo view carlosfranzetti/street-racer-unlimited`',
          ],
          xp: 20,
        },
        {
          id: 's1-victory',
          narration:
            "It's live. The CEO tweets. 4,200 retweets in an hour. The senior dev pokes their head in: \"Not bad for day one.\" You have now pushed a project to GitHub from the terminal — no browser, no GUI. Seal the moment.",
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
          hints: [
            '`echo` prints any text to the terminal. It is often used in scripts to output messages.',
            '`echo` followed by your message in quotes prints it. Your message just needs to include "shipped".',
            'Try: `echo "StreetRacer Unlimited: shipped"`',
          ],
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
            "When you open a terminal, you are always inside a folder — your current working directory. Every command runs relative to that location. 2:47am. The game jam portal closes at 3:00am. Neon Heist is on your laptop. Thirteen minutes. First: know where you are.",
          objective: 'Find out where you are and what files are here.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: r.stdout.length > 1 || r.exitCode === 0, reason: 'expected some output' }),
          },
          hints: [
            'Your terminal always has a current location — a folder you are working inside. `pwd` shows you the full path to that folder. `ls` shows what files are in it.',
            '`pwd` prints your current directory path. `ls` lists the files there. Run them to orient yourself.',
            'Try: `ls` or `pwd`',
          ],
          xp: 10,
        },
        {
          id: 's2-git-status',
          narration:
            "Before committing, check whether git is tracking this project. If git is initialized, `git status` shows the current state. If not, you would need to run `git init` first.",
          objective: 'Check git status.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: /branch|modified|untracked|commit|Changes/i.test(r.stdout + r.stderr) || r.exitCode === 0, reason: 'expected git status output' }),
          },
          hints: [
            'Git must be initialized in a folder before it can track files. `git status` confirms whether git is set up and shows what has changed.',
            '`git status` shows staged files, modified files, and untracked files. It also tells you if you are not in a git repo at all.',
            'Try: `git status`',
          ],
          xp: 20,
        },
        {
          id: 's2-add',
          narration:
            "2:49am. Modified files and the final boss audio untracked. Eleven minutes. Staging tells Git which changes to include in your commit. Stage everything — no time to be selective.",
          objective: 'Stage all changes.',
          verify: { mode: 'shell', exitCode: 0, custom: (r: ShellResult) => ({ ok: r.exitCode === 0, reason: 'expected git add to succeed' }) },
          hints: [
            'Staging is how Git knows what to include in the next commit. `git add` is the staging command — you pick what goes in before sealing it with a commit.',
            '`git add .` stages everything in the current directory. `-A` also works and catches deletions.',
            'Try: `git add .`',
          ],
          xp: 15,
        },
        {
          id: 's2-commit',
          narration:
            "2:50am. Ten minutes. A commit freezes your staged changes into Git's permanent history. The judges will see this message — make it honest.",
          objective: 'Commit with a message that represents the game well.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: /commit|main|file/i.test(r.stdout + r.stderr) || r.exitCode === 0, reason: 'expected commit success' }),
          },
          hints: [
            'A commit saves your staged changes permanently with a message explaining what they contain. The message is public — judges (and collaborators) will read it.',
            '`git commit -m` commits with a message inline. Use quotes around your message.',
            'Try: `git commit -m "feat: Neon Heist — game jam submission"`',
          ],
          xp: 20,
        },
        {
          id: 's2-auth',
          narration:
            "2:51am. Nine minutes. Is `gh` authenticated? The last thing you need right now is a login prompt mid-push. Check now.",
          objective: 'Check your GitHub auth status.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: /github\.com|Logged in|carlosfranzetti/i.test(r.stdout + r.stderr) || r.exitCode === 0, reason: 'expected auth status' }),
          },
          hints: [
            'Authentication connects `gh` to your GitHub account. Without it, `gh` cannot create repos or push. Check now before you hit a wall at 2:58am.',
            '`gh auth status` shows your GitHub login state — who you are logged in as and what permissions your token has.',
            'Try: `gh auth status`',
          ],
          xp: 15,
        },
        {
          id: 's2-create',
          narration:
            "2:52am. Eight minutes. Authenticated. A GitHub repository is a remote home for your code on GitHub's servers. `gh repo create` creates one without opening a browser.",
          objective: 'Create a public GitHub repo called `neon-heist`.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: /Created|github\.com|neon-heist|repository/i.test(r.stdout) || r.exitCode === 0, reason: 'expected repo creation' }),
          },
          hints: [
            'A GitHub repository is a remote home for your code. `gh repo create` creates one under your account. Game jam submissions must be public so judges can access them.',
            '`gh repo create` takes the repo name. Use `--public` to make it publicly accessible.',
            'Try: `gh repo create neon-heist --public`',
          ],
          xp: 30,
        },
        {
          id: 's2-push',
          narration:
            "2:54am. Six minutes. The remote is live. Pushing sends your local commits to that remote repository on GitHub.",
          objective: 'Push to GitHub.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: /main|objects|done|branch/i.test(r.stdout + r.stderr) || r.exitCode === 0, reason: 'expected push output' }),
          },
          hints: [
            'Pushing uploads your local commits to the remote repository on GitHub. Without this step, your code only exists locally and the judges cannot see it.',
            '`git push origin main` sends your commits up. `-u` sets the upstream link for future pushes.',
            'Try: `git push origin main` or `git push -u origin main`',
          ],
          xp: 30,
        },
        {
          id: 's2-branch',
          type: 'branch',
          narration:
            "2:56am. Four minutes. The push succeeded. Two things you could do: confirm the repo is live, or go straight to printing the submission URL.",
          branches: [
            {
              label: "Verify the repo first — I need to confirm it's public",
              flavor: 'Double-checker. You have the time.',
              steps: [
                {
                  id: 's2-b1-view',
                  narration: "2:57am. Three minutes. `gh repo view` confirms the repo is live and publicly accessible — without opening a browser.",
                  objective: "View the repo to confirm it's live.",
                  verify: {
                    mode: 'shell',
                    custom: (r: ShellResult) => ({ ok: /neon-heist|github|public/i.test(r.stdout) || r.exitCode === 0, reason: 'expected repo view' }),
                  },
                  hints: [
                    'After pushing, verify your repository is live. `gh repo view` shows repo details right in your terminal.',
                    '`gh repo view` followed by `owner/repo` shows that repo\'s metadata.',
                    'Try: `gh repo view carlosfranzetti/neon-heist`',
                  ],
                  xp: 15,
                },
              ],
            },
            {
              label: "Straight to the submission — I trust the push succeeded",
              flavor: "Go fast. You've done this before.",
              steps: [
                {
                  id: 's2-b2-echo',
                  narration: "2:57am. Maximum confidence. Print the URL so you can paste it into the submission form.",
                  objective: 'Echo the repo URL so you can paste it.',
                  verify: { mode: 'shell', exitCode: 0, stdoutContains: 'github.com' },
                  hints: [
                    '`echo` prints text to the terminal. Use it to print the URL so you can copy-paste it into the submission form.',
                    '`echo` followed by your URL in quotes prints it. GitHub repo URLs follow the pattern: github.com/username/repo.',
                    'Try: `echo "https://github.com/carlosfranzetti/neon-heist"`',
                  ],
                  xp: 15,
                },
              ],
            },
          ],
        } as any,
        {
          id: 's2-victory',
          narration:
            "2:59am. One minute to spare. Submission sent. You lean back and the caffeine crash hits like a truck. Six hours later: \"🏆 Neon Heist — Best Overall, 48hr Game Jam.\" 847 stars overnight. You pushed a complete game to GitHub in 13 minutes.",
          art: `
  ╔═══════════════════╗
  ║   🏆 FIRST PLACE  ║
  ║   NEON HEIST      ║
  ║   48hr Game Jam   ║
  ╚═══════════════════╝
`,
          objective: 'Print "winner" to celebrate.',
          verify: { mode: 'shell', exitCode: 0, stdoutContains: 'winner' },
          hints: [
            '`echo` prints any text to the terminal.',
            '`echo` followed by your message in quotes. Include "winner".',
            'Try: `echo "game jam winner"`',
          ],
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
            "Forking starts with understanding what you are forking. Any public GitHub repository can be inspected from your terminal. OpCity is an open-source GTA clone — 2,400 stars, slow physics engine. You found the fix. The maintainer has been silent for months. Time to fork and ship the improvement yourself.",
          objective: "View the upstream repo to understand what you're forking.",
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: /opcity|github|opengame|public|description/i.test(r.stdout) || r.exitCode === 0, reason: 'expected repo info' }),
          },
          hints: [
            'Before forking, inspect the source repo. `gh repo view` shows any public repository\'s metadata — stars, description, language, and URL.',
            '`gh repo view` can show any public repository. Pass the full name as `owner/repo`.',
            'Try: `gh repo view opengame/opcity`',
          ],
          xp: 20,
        },
        {
          id: 's3-check-auth',
          narration:
            "Forking creates a personal copy of someone else's repository under your own GitHub account. `gh` needs to know who you are — your fork will live under your username.",
          objective: 'Check your GitHub auth status.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: /github\.com|carlosfranzetti|Logged in/i.test(r.stdout + r.stderr) || r.exitCode === 0, reason: 'expected auth output' }),
          },
          hints: [
            'Forking requires your GitHub identity — the fork will be created under your account. `gh auth status` confirms you are logged in.',
            '`gh auth status` shows your authenticated account and what permissions your token has.',
            'Try: `gh auth status`',
          ],
          xp: 15,
        },
        {
          id: 's3-fork',
          narration:
            "A fork is your personal copy of someone else's repository on GitHub. Unlike cloning (which just copies locally), forking creates a new repo under your account on GitHub. You can make changes freely, then propose them back via a pull request.",
          objective: 'Fork the `opengame/opcity` repository.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: /fork|Created|carlosfranzetti|opcity|github/i.test(r.stdout) || r.exitCode === 0, reason: 'expected fork output' }),
          },
          hints: [
            'A fork is your own copy of someone else\'s GitHub repository, stored under your account. It lets you make changes without touching the original — then propose those changes back via a pull request.',
            '`gh repo fork` creates a fork under your account. Pass the repo name as `owner/repo`.',
            'Try: `gh repo fork opengame/opcity`',
          ],
          xp: 35,
        },
        {
          id: 's3-clone',
          narration:
            "Your fork exists on GitHub but not yet on your computer. Cloning downloads the repository to your local machine so you can actually edit the code. Clone YOUR fork — not the original — so your commits go to the right place.",
          objective: 'Clone your fork to work on it locally.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: /Cloning|done|objects|opcity/i.test(r.stdout + r.stderr) || r.exitCode === 0, reason: 'expected clone output' }),
          },
          hints: [
            'Cloning downloads a GitHub repository to your local machine. You need a local copy to edit code — your fork on GitHub is just the remote copy.',
            '`git clone` followed by the URL downloads the repo. Use YOUR fork\'s URL, not the original upstream URL.',
            'Try: `git clone https://github.com/carlosfranzetti/opcity.git`',
          ],
          xp: 20,
        },
        {
          id: 's3-explore',
          narration:
            "Cloned. Now navigate the codebase. The physics engine is somewhere in `src/`. Find it before making any changes.",
          objective: 'List the files in the `src/` directory.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: /physics|engine|game|player|src|\.js/i.test(r.stdout) || r.stdout.length > 2 || r.exitCode === 0, reason: 'expected a file listing' }),
          },
          hints: [
            '`ls` lists directory contents. You can pass a directory name to list that specific folder rather than your current location.',
            '`ls` followed by a path lists that directory. Use it to explore the `src/` folder.',
            'Try: `ls src/`',
          ],
          xp: 15,
        },
        {
          id: 's3-read',
          narration:
            "There it is — `src/physics.js`. Read it. Find the collision detection loop you are about to fix.",
          objective: 'Read the physics engine file.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: r.exitCode === 0, reason: 'expected file contents' }),
          },
          hints: [
            '`cat` prints a file\'s contents to the terminal. Use it to read any text file without opening an editor.',
            '`cat` followed by the file path prints its contents.',
            'Try: `cat src/physics.js`',
          ],
          xp: 15,
        },
        {
          id: 's3-branch',
          type: 'branch',
          narration:
            "You have read the physics engine. Branches let you work on changes in isolation without affecting the main codebase. Before committing your fix, create a branch. Pick your naming style.",
          branches: [
            {
              label: 'Create a fix branch: fix/static-collision-skip',
              flavor: 'Bug fix framing — this is correcting a defect.',
              steps: [
                {
                  id: 's3-b1-branch',
                  narration: "A branch is an isolated workspace for your change. Other developers work on their own branches simultaneously — nobody steps on each other's work. The branch name appears in the pull request.",
                  objective: 'Create a new branch called `fix/static-collision-skip`.',
                  verify: {
                    mode: 'shell',
                    custom: (r: ShellResult) => ({ ok: r.exitCode === 0, reason: 'expected branch creation' }),
                  },
                  hints: [
                    'A branch is an independent line of development where you can make changes freely without affecting the main branch. Creating one is the first step before any code change.',
                    '`git checkout -b` creates a new branch AND switches to it in one step. Name it descriptively.',
                    'Try: `git checkout -b fix/static-collision-skip`',
                  ],
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
                  narration: "A branch isolates your work from the main codebase. The name is visible in pull requests and git history — make it descriptive so reviewers know what to expect.",
                  objective: 'Create a branch called `perf/skip-static-collision`.',
                  verify: {
                    mode: 'shell',
                    custom: (r: ShellResult) => ({ ok: r.exitCode === 0, reason: 'expected branch creation' }),
                  },
                  hints: [
                    'A branch is an independent workspace for your change. The `perf/` prefix is a convention that signals this is a performance improvement.',
                    '`git checkout -b` creates and switches to a new branch in one command.',
                    'Try: `git checkout -b perf/skip-static-collision`',
                  ],
                  xp: 20,
                },
              ],
            },
          ],
        } as any,
        {
          id: 's3-commit-fix',
          narration:
            "You make the change — three lines removed, a comment added explaining why. Stage it and commit with a message that tells the maintainer exactly what you did.",
          objective: 'Stage and commit the physics fix.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: /commit|main|file|changed/i.test(r.stdout + r.stderr) || r.exitCode === 0, reason: 'expected a commit' }),
          },
          hints: [
            'Stage your changes with `git add .`, then commit with `git commit -m` and a message describing the fix. You can chain them with `&&`.',
            '`git add .` stages everything. `git commit -m` seals it with a message. Use `&&` to run both in sequence.',
            'Try: `git add . && git commit -m "perf: skip collision check for static objects (+40% fps)"`',
          ],
          xp: 25,
        },
        {
          id: 's3-push-branch',
          narration:
            "Committed. Pushing the branch uploads it from your local machine to your fork on GitHub. The maintainer needs to see it there before you can open a pull request.",
          objective: 'Push your branch to your fork on GitHub.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: /objects|done|branch|main|->|perf|fix/i.test(r.stdout + r.stderr) || r.exitCode === 0, reason: 'expected push output' }),
          },
          hints: [
            'Pushing a branch uploads it from your local machine to GitHub. Without this, your branch and commits only exist locally — the maintainer cannot see them.',
            '`git push -u origin` followed by your branch name (or `HEAD` for the current branch) pushes it and sets the upstream link.',
            'Try: `git push -u origin HEAD`',
          ],
          xp: 25,
        },
        {
          id: 's3-pr',
          narration:
            "A pull request (PR) is a formal proposal to merge your changes into another repository. You are saying: \"I made this improvement — would you like to include it?\" Even if the maintainer is slow to respond, opening the PR is how open source works.",
          objective: 'Open a pull request to the upstream repo.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: /pull|PR|Created|github\.com|request/i.test(r.stdout) || r.exitCode === 0, reason: 'expected PR creation' }),
          },
          hints: [
            'A pull request proposes your branch\'s changes for inclusion in another repository. The maintainer reviews your code and decides whether to merge it. This is the standard way to contribute to open source.',
            '`gh pr create` opens a PR from your branch. Add `--title` to describe your change and `--body` for details.',
            'Try: `gh pr create --title "perf: skip collision for static objects (+40% fps)" --body "Removes redundant collision checks"',
          ],
          xp: 40,
        },
        {
          id: 's3-victory',
          narration:
            "The PR is open. The community responds within the hour. 23 upvotes. The maintainer returns from sabbatical: \"Merging. Thank you for not giving up on this.\" OpCity 1.4 ships with your change in the credits.",
          art: `
  ┌────────────────────────────┐
  │  PR MERGED  ✓              │
  │  perf: +40% physics fps    │
  │  contributor: you          │
  └────────────────────────────┘
`,
          objective: 'Print "merged" to mark the moment.',
          verify: { mode: 'shell', exitCode: 0, stdoutContains: 'merged' },
          hints: [
            '`echo` prints any text to the terminal.',
            '`echo` followed by your message in quotes. Include "merged".',
            'Try: `echo "PR merged — 40% faster for everyone"`',
          ],
          xp: 30,
        },
      ],
    },
  ],
};

export default pack;
