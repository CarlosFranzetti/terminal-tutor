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
          narration: "The terminal is your window into the file system — it lets you see what's in any folder without clicking through icons. You arrive at Midnight Polygon Studios at 8:59am. A senior dev drops a laptop in your arms: \"Game's done. 47,000 lines of open-world mayhem. CEO wants it on GitHub before lunch or heads roll — probably yours.\" You open the terminal. First step: see what you're working with.",
          objective: 'List the files in the current directory to survey the project.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /^(ls|ll|la|pwd)\b/i.test(input.trim()) && r.exitCode === 0, reason: 'list directory contents with ls or check your location with pwd' })
          },
          hints: [
            'The terminal lets you list files in the current folder — like opening Finder, but faster. This is how developers orient themselves in a new project.',
            '`ls` is the command for listing files. Add `-la` to see hidden files and details like file sizes and permissions.',
            'Try: `ls` or `ls -la`'
          ],
          xp: 15
        },
        {
          id: 's1-git-status',
          narration: "Git is a version control system — it tracks every change to your code, lets you go back in time, and makes collaboration possible. Before pushing anything to GitHub, you need to know: what has changed? Is everything committed? `git status` answers all of that in one shot.",
          objective: 'Check the git status of the project.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /git\s+status/i.test(input) && (/branch|modified|untracked|commit|Changes|nothing/i.test(r.stdout + r.stderr) || r.exitCode === 0), reason: 'run git status' })
          },
          hints: [
            'Git keeps a log of every saved change to your code. `git status` shows you what has changed since the last save (commit), what is staged to be saved, and what is not tracked at all.',
            '`git status` is the command. Run it inside any git repository to see its current state.',
            'Try: `git status`'
          ],
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
                  narration: "A diff shows the exact lines that changed — additions in green, removals in red. Before staging anything, reading the diff means no surprises end up in production. Smart developers always check before they ship.",
                  objective: 'View the git diff to see what changed in the working tree.',
                  verify: {
                    mode: 'shell',
                    custom: (r, input) => ({ ok: /git\s+diff/i.test(input) && r.exitCode === 0, reason: 'run git diff' })
                  },
                  hints: [
                    'A diff compares your current files to the last committed snapshot. It shows exactly what changed and where — additions are marked with `+`, removals with `-`.',
                    '`git diff` shows unstaged changes. Run it with no arguments to see everything that has changed.',
                    'Try: `git diff`'
                  ],
                  xp: 20
                },
                {
                  id: 's1-b1-add',
                  narration: "Staging is Git's preparation step — you choose which changes to include in the next snapshot before sealing it with a commit. Think of it like packing a box: `git add` picks what goes in, then `git commit` tapes it shut.",
                  objective: 'Stage all changes for commit.',
                  verify: {
                    mode: 'shell',
                    custom: (r, input) => ({ ok: /git\s+add/i.test(input) && r.exitCode === 0, reason: 'stage files with git add' })
                  },
                  hints: [
                    'Staging means telling Git "include these changes in the next commit." You choose what to stage with `git add` — you can stage everything at once or pick individual files.',
                    '`git add` followed by a path stages that path. Use `.` to stage everything in the current directory, or `-A` to stage all changes everywhere.',
                    'Try: `git add .` or `git add -A`'
                  ],
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
                  narration: "Bold. Staging tells Git which changes to include in the next commit. When you trust the team's work, you can stage everything in one shot and keep moving.",
                  objective: 'Stage all changes for commit.',
                  verify: {
                    mode: 'shell',
                    custom: (r, input) => ({ ok: /git\s+add/i.test(input) && r.exitCode === 0, reason: 'stage files with git add' })
                  },
                  hints: [
                    'Staging is how Git knows what to include in the next commit. `git add` stages files — you can add everything at once or file by file.',
                    '`git add` followed by `.` stages all changes in the current directory. `-A` also works and catches deletions.',
                    'Try: `git add .` or `git add -A`'
                  ],
                  xp: 20
                }
              ]
            }
          ]
        },
        {
          id: 's1-commit',
          narration: "A commit is a permanent snapshot in Git's history — it records exactly what changed and when, with your message explaining why. Every commit is a checkpoint you can return to. Good commit messages make you a better teammate because future-you (and everyone else) will read them.",
          objective: 'Commit the staged changes with a descriptive message.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /git\s+commit/i.test(input) && (/commit|file|changed|main/i.test(r.stdout + r.stderr) || r.exitCode === 0), reason: 'commit with git commit -m' })
          },
          hints: [
            'A commit saves a permanent snapshot of your staged changes to Git\'s history. Every commit needs a message that explains what changed and why — future developers (including you) will read it.',
            '`git commit -m` saves staged changes. The `-m` flag lets you write the message inline. Use quotes around your message.',
            'Try: `git commit -m "feat: v0.9.0 ready to ship"`'
          ],
          xp: 25
        },
        {
          id: 's1-gh-version',
          narration: "The GitHub CLI (`gh`) lets you work with GitHub directly from your terminal — creating repos, opening PRs, checking auth — all without a browser. Before using any tool, it's good practice to confirm it's installed and check its version. This also tells you if you need to update.",
          objective: 'Confirm the `gh` CLI is installed and print its version.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+(--version|-v)/i.test(input) && (r.exitCode === 0 || /gh version/i.test(r.stdout)), reason: 'check gh version with gh --version' })
          },
          hints: [
            'CLI tools (command-line interfaces) are programs you run by typing their name in the terminal. Before using one, confirm it is installed by asking it to identify itself.',
            'Most CLI tools have a flag to print their version number. This confirms the tool is installed and shows which version you have.',
            'Try: `gh --version`'
          ],
          xp: 15
        },
        {
          id: 's1-auth',
          narration: "Authentication means proving to GitHub that you are who you say you are. `gh` needs to be connected to your GitHub account before it can create repos or make API calls on your behalf. Think of it as logging in — without it, `gh` can\'t do anything on your behalf.",
          objective: 'Check your GitHub authentication status.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+auth/i.test(input) && (/github\.com|Logged in|not logged/i.test(r.stdout + r.stderr) || r.exitCode === 0), reason: 'check auth with gh auth status' })
          },
          hints: [
            'Authentication links the `gh` tool to your GitHub account. Without it, `gh` cannot create repositories, open PRs, or do anything that requires your identity. Think of it as logging in.',
            '`gh auth` is the subcommand for managing authentication. `status` checks whether you are already logged in and shows which account is active.',
            'Try: `gh auth status`'
          ],
          xp: 20
        },
        {
          id: 's1-repo-create',
          narration: "A GitHub repository is a remote home for your code — hosted on GitHub\'s servers, accessible from anywhere, and shareable with collaborators. `gh repo create` creates one without ever opening a browser. You can create the repo and push your code in a single command.",
          objective: 'Create a new public GitHub repo named "street-racer-unlimited".',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+repo\s+create/i.test(input) && (/Created|github\.com|repository|street-racer/i.test(r.stdout) || r.exitCode === 0), reason: 'create repo with gh repo create' })
          },
          hints: [
            'A repository on GitHub is a remote copy of your project that others can access, clone, and contribute to. `gh repo create` creates one under your account without needing a browser.',
            '`gh repo create` takes the repo name. Add `--public` to make it visible to everyone, `--source=.` to use the current folder as the source, and `--push` to upload your commits immediately.',
            'Try: `gh repo create street-racer-unlimited --public --source=. --push`'
          ],
          xp: 30
        },
        {
          id: 's1-shipped',
          narration: "The repo is live. 47,000 lines of StreetRacer Unlimited, pushed to GitHub with 8 minutes to spare. `gh repo view` lets you confirm everything landed safely — right in the terminal.",
          objective: 'Confirm the push succeeded by viewing the remote repo.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+repo\s+view/i.test(input) && (/street-racer|github\.com|Description|public/i.test(r.stdout) || r.exitCode === 0), reason: 'view the repo with gh repo view' })
          },
          hints: [
            'After pushing, you can verify your repository is live by viewing it from the terminal. This shows the repo name, description, visibility, and URL.',
            '`gh repo view` shows details about the current project\'s remote repository. You can also pass an owner/repo name to view any public repo.',
            'Try: `gh repo view`'
          ],
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
          narration: "When you open a terminal, you are always \'inside\' a folder — your current working directory. Every command runs relative to that location. 2:47am. The game jam portal closes at 3:00am. Neon Heist is on your laptop. First: know where you are and what\'s here.",
          objective: 'Print your current directory and list its contents.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /^(ls|ll|la|pwd)\b/i.test(input.trim()) && (r.stdout.length > 0 || r.exitCode === 0), reason: 'list files with ls or print your location with pwd' })
          },
          hints: [
            'Your terminal always has a "current location" — a folder you are working inside. `pwd` (print working directory) shows you the full path to that folder. `ls` shows what files are in it.',
            '`pwd` prints your current directory path. `ls` lists the files there. You can run them together.',
            'Try: `pwd` then `ls`'
          ],
          xp: 10
        },
        {
          id: 's2-status',
          narration: "Before committing anything, you need to know if git is even tracking this project. If git is initialized here, `git status` will show the current state. If not, you\'ll see an error telling you so — and you\'d need to run `git init` first.",
          objective: 'Check the git status of the project.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /git\s+status/i.test(input) && (/branch|modified|untracked|commit|Changes/i.test(r.stdout + r.stderr) || r.exitCode === 0), reason: 'run git status' })
          },
          hints: [
            'Git must be initialized in a folder before it can track files. `git status` shows the current state — staged files, modified files, and untracked files. It also confirms whether git is set up at all.',
            '`git status` shows everything: what\'s staged, what\'s changed, and what\'s untracked. Run it from inside any folder to see the state.',
            'Try: `git status`'
          ],
          xp: 15
        },
        {
          id: 's2-add',
          narration: "Git is initialized. 11 minutes left. Staging tells Git which changes to include in your next commit. You\'re selecting everything — all your game files, art, code, sounds — to be part of this snapshot.",
          objective: 'Stage all project files for commit.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /git\s+add/i.test(input) && r.exitCode === 0, reason: 'stage files with git add' })
          },
          hints: [
            'Staging is how Git knows what to include in the next commit. You pick what goes in — then `git commit` seals it. `git add` is the staging command.',
            '`git add .` stages everything in the current directory. The `.` means "here and all subdirectories." `-A` is also accepted and does the same thing.',
            'Try: `git add .`'
          ],
          xp: 15
        },
        {
          id: 's2-commit',
          narration: "9 minutes. A commit freezes your staged changes into Git\'s permanent history. The judges will see this message. It will live in the git log forever — make it honest.",
          objective: 'Commit the staged files with a message.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /git\s+commit/i.test(input) && (/commit|file|changed/i.test(r.stdout) || r.exitCode === 0), reason: 'commit with git commit -m' })
          },
          hints: [
            'A commit saves your staged changes permanently to Git\'s history with a message explaining what they contain. The message is public — judges (and collaborators) will read it.',
            '`git commit -m` commits staged changes. The `-m` flag lets you write your message inline in quotes.',
            'Try: `git commit -m "feat: neon heist v1.0 — jam submission"`'
          ],
          xp: 20
        },
        {
          id: 's2-auth',
          narration: "7 minutes. The repo doesn\'t exist on GitHub yet. First: confirm you\'re authenticated. `gh` needs to know who you are before it can create anything on GitHub on your behalf. If you\'re not logged in, you\'re not submitting this game.",
          objective: 'Check GitHub CLI authentication status.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+auth/i.test(input) && (/github\.com|Logged in|not logged/i.test(r.stdout + r.stderr) || r.exitCode === 0), reason: 'check auth with gh auth status' })
          },
          hints: [
            'Authentication connects `gh` to your GitHub account. Without it, `gh` cannot create repositories or push code on your behalf. Check your status now, not at 2:58am.',
            '`gh auth status` shows whether you are logged in, which account is active, and what permissions your token has.',
            'Try: `gh auth status`'
          ],
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
                  narration: "Creating the repository explicitly gives you control. A GitHub repository is a remote home for your code — `gh repo create` creates one under your account instantly.",
                  objective: 'Create a new public GitHub repo named "neon-heist".',
                  verify: {
                    mode: 'shell',
                    custom: (r, input) => ({ ok: /gh\s+repo\s+create/i.test(input) && (/Created|github\.com|neon-heist|repository/i.test(r.stdout) || r.exitCode === 0), reason: 'create repo with gh repo create' })
                  },
                  hints: [
                    'A GitHub repository is a remote home for your code on GitHub\'s servers. `gh repo create` creates one under your account without needing a browser.',
                    '`gh repo create` takes the repo name. Use `--public` to make it publicly accessible to the judges.',
                    'Try: `gh repo create neon-heist --public`'
                  ],
                  xp: 25
                },
                {
                  id: 's2-b1-push',
                  narration: "The repo exists on GitHub. Pushing sends your local commits to that remote repository. The `-u` flag sets the \'upstream\' — it links your local branch to the remote one so future pushes are simpler.",
                  objective: 'Push the commit to the remote GitHub repo.',
                  verify: {
                    mode: 'shell',
                    custom: (r, input) => ({ ok: /git\s+push/i.test(input) && (/Writing|objects|done|->|branch|main/i.test(r.stdout + r.stderr) || r.exitCode === 0), reason: 'push with git push' })
                  },
                  hints: [
                    'Pushing uploads your local commits to the remote repository on GitHub. Without this step, your code only exists on your machine.',
                    '`git push` sends commits to the remote. If the remote branch is new, use `-u origin main` to set the upstream link.',
                    'Try: `git push -u origin main`'
                  ],
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
                  narration: "`gh repo create` can create the GitHub repository AND push your commits in a single command. `--source=.` uses the current directory as the source. `--push` uploads everything immediately after creating the repo.",
                  objective: 'Create the GitHub repo and push all commits in one command.',
                  verify: {
                    mode: 'shell',
                    custom: (r, input) => ({ ok: /gh\s+repo\s+create/i.test(input) && (/Created|github\.com|Writing|objects|neon-heist/i.test(r.stdout) || r.exitCode === 0), reason: 'create and push with gh repo create' })
                  },
                  hints: [
                    '`gh repo create` can do two things at once: create the remote repo AND push your local commits. This saves a step when you are in a hurry.',
                    '`gh repo create` with `--source=.` uses the current directory and `--push` uploads your commits immediately after creating the repo.',
                    'Try: `gh repo create neon-heist --public --source=. --push`'
                  ],
                  xp: 30
                }
              ]
            }
          ]
        },
        {
          id: 's2-view',
          narration: "2:58am. Two minutes to spare. The game is on GitHub. You submit the URL to the jam portal. Neon Heist is in. `gh repo view` confirms the repo is live right from the terminal.",
          objective: 'View the remote repo to confirm everything is live.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+repo\s+view/i.test(input) && (/neon-heist|github\.com|Description|star|fork/i.test(r.stdout) || r.exitCode === 0), reason: 'view repo with gh repo view' })
          },
          hints: [
            'After pushing, you can verify your repository is live without opening a browser. `gh repo view` shows the repo\'s name, description, URL, and visibility.',
            '`gh repo view` shows details about the current project\'s remote repository. Run it from inside your project directory.',
            'Try: `gh repo view`'
          ],
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
          narration: "Forking starts with understanding what you are forking. Any public GitHub repository can be inspected from your terminal. OpCity is an open-source city builder — 12,000 stars, notoriously slow physics engine. Someone on Reddit found a 40% speedup. The maintainer has not responded in 6 months. Time to fork it yourself.",
          objective: 'View the upstream OpCity repo on GitHub to understand what you\'re working with.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+repo\s+view/i.test(input) && (/opcity|github\.com|Description|star|fork|language/i.test(r.stdout) || r.exitCode === 0), reason: 'view the upstream repo with gh repo view' })
          },
          hints: [
            'Before forking, look at the source repo to understand what you are working with. `gh repo view` shows any public repository\'s metadata — stars, description, language, URL.',
            '`gh repo view` can inspect any public repository. Pass the full repo name in the format `owner/repo`.',
            'Try: `gh repo view opengame/opcity`'
          ],
          xp: 20
        },
        {
          id: 's3-auth',
          narration: "Forking creates a personal copy of someone else\'s repository under your own GitHub account. To do that, `gh` needs to know who you are — your fork will live under your username.",
          objective: 'Check your GitHub authentication status.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+auth/i.test(input) && (/github\.com|Logged in|not logged/i.test(r.stdout + r.stderr) || r.exitCode === 0), reason: 'check auth with gh auth status' })
          },
          hints: [
            'Forking requires your GitHub identity — the fork will be created under your account. `gh auth status` confirms you are logged in before you proceed.',
            '`gh auth status` shows your current authentication state and which account is active.',
            'Try: `gh auth status`'
          ],
          xp: 15
        },
        {
          id: 's3-fork',
          narration: "A fork is your personal copy of someone else\'s repository on GitHub. Unlike cloning (which just copies locally), forking creates a new repo under your account on GitHub. You can make changes freely, open pull requests, and the original maintainer never has to grant you write access.",
          objective: 'Fork the opengame/opcity repository to your account.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+repo\s+fork/i.test(input) && (/fork|Created|opcity|github\.com/i.test(r.stdout) || r.exitCode === 0), reason: 'fork the repo with gh repo fork' })
          },
          hints: [
            'A fork is your own copy of someone else\'s GitHub repository, stored under your account. It lets you make changes without touching the original — then propose those changes back via a pull request.',
            '`gh repo fork` creates a fork of any public repository under your GitHub account. Pass the repo name as `owner/repo`.',
            'Try: `gh repo fork opengame/opcity`'
          ],
          xp: 30
        },
        {
          id: 's3-clone',
          narration: "Your fork exists on GitHub but not yet on your computer. Cloning downloads the repository to your local machine so you can actually edit the code. Always clone your fork — not the original — so your commits go to the right place.",
          objective: 'Clone your fork of OpCity to your local machine.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /git\s+clone/i.test(input) && (/Cloning|done|objects|opcity/i.test(r.stdout + r.stderr) || r.exitCode === 0), reason: 'clone with git clone' })
          },
          hints: [
            'Cloning downloads a GitHub repository to your local machine. You need a local copy to actually edit code — your fork on GitHub is just a remote copy.',
            '`git clone` followed by the URL downloads the repo. Use YOUR fork\'s URL, not the original upstream URL.',
            'Try: `git clone https://github.com/<your-username>/opcity.git`'
          ],
          xp: 20
        },
        {
          id: 's3-branch',
          type: 'branch',
          narration: "Inside the repo. You are about to make the physics change. Branches let you work on changes in isolation without affecting the main codebase. What do you name your branch?",
          branches: [
            {
              label: 'fix/physics-broadphase-optimization',
              flavor: 'Describes what you fixed. Conservative, clear.',
              steps: [
                {
                  id: 's3-b1-checkout',
                  narration: "A branch is an independent line of development. Creating one lets you make your changes without touching `main`. The branch name tells maintainers what you worked on — it appears in the pull request.",
                  objective: 'Create and switch to a branch named "fix/physics-broadphase-optimization".',
                  verify: {
                    mode: 'shell',
                    custom: (r, input) => ({ ok: /git\s+(checkout\s+-b|switch\s+-c)/i.test(input) && r.exitCode === 0, reason: 'create a branch with git checkout -b' })
                  },
                  hints: [
                    'A branch is an isolated copy of the codebase where you can make changes freely. Other developers work on their own branches simultaneously — nobody steps on each other\'s work.',
                    '`git checkout -b` creates a new branch AND switches to it in one step. The branch name should describe what you are changing.',
                    'Try: `git checkout -b fix/physics-broadphase-optimization`'
                  ],
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
                  narration: "A branch is an isolated workspace for your change. Quantifying the improvement in the branch name (like \"40pct\") makes the value immediately clear to anyone who reads the pull request.",
                  objective: 'Create and switch to a branch named "perf/40pct-physics-speedup".',
                  verify: {
                    mode: 'shell',
                    custom: (r, input) => ({ ok: /git\s+(checkout\s+-b|switch\s+-c)/i.test(input) && r.exitCode === 0, reason: 'create a branch with git checkout -b' })
                  },
                  hints: [
                    'A branch isolates your work from the main codebase. The name is visible in pull requests and git history — make it descriptive so reviewers know what to expect.',
                    '`git checkout -b` creates and switches to a new branch in one command.',
                    'Try: `git checkout -b perf/40pct-physics-speedup`'
                  ],
                  xp: 20
                }
              ]
            }
          ]
        },
        {
          id: 's3-push-branch',
          narration: "You have made the physics change, staged it, and committed it. Now push the branch to your fork on GitHub. This makes it visible to the maintainer so you can open a pull request from it. The `-u` flag sets the upstream link so future pushes are simpler.",
          objective: 'Push your local branch to your forked remote.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /git\s+push/i.test(input) && (/objects|done|branch|->|Writing/i.test(r.stdout + r.stderr) || r.exitCode === 0), reason: 'push the branch with git push' })
          },
          hints: [
            'Pushing a branch uploads it from your local machine to GitHub. Without this step, your branch and commits only exist locally — the maintainer cannot see them.',
            '`git push -u origin` followed by your branch name (or `HEAD` for the current branch) pushes it and sets the upstream link.',
            'Try: `git push -u origin HEAD`'
          ],
          xp: 20
        },
        {
          id: 's3-pr',
          narration: "A pull request (PR) is a formal proposal to merge your changes into another repository. You are saying: \"I made this improvement — would you like to include it?\" Even if the maintainer is slow to respond, opening the PR is how open source works. The community can see it, comment on it, and use your fork in the meantime.",
          objective: 'Open a pull request against the upstream opengame/opcity repo.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+pr\s+create/i.test(input) && (/pull request|PR|Created|github\.com|request/i.test(r.stdout) || r.exitCode === 0), reason: 'open a PR with gh pr create' })
          },
          hints: [
            'A pull request proposes your branch\'s changes for inclusion in another repository. The maintainer reviews your code and decides whether to merge it. It is the standard way to contribute to open source projects.',
            '`gh pr create` opens a pull request from your current branch. Use `--repo` to target the upstream repo (not your fork). Add a `--title` and `--body` to describe your change.',
            'Try: `gh pr create --repo opengame/opcity --title "perf: 40% physics engine speedup" --body "Broadphase collision optimization reduces overhead by 40%"'
          ],
          xp: 35
        }
      ]
    }
  ]
};
