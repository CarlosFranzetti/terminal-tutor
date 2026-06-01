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
  order: 3,
  id: 'github-cli',
  title: 'The GitHub Chronicles',
  synopsis: 'Three stories. One tool. Ship code with `gh` before everything falls apart.',
  tool: 'gh',
  stories: [

    // ── STORY 1: Ship the Ripoff ─────────────────────────────────────────────
    {
      id: 'ship-the-ripoff',
      title: 'Ship the Ripoff',
      setting: 'Day 1 at Midnight Polygon Studios. Push StreetRacer Unlimited to GitHub by noon or heads roll.',
      art: CAR_ART,
      steps: [
        {
          id: 's1-survey',
          narration: '8:59am. First day at Midnight Polygon Studios. You haven\'t found your desk yet.\n\n  A senior dev intercepts you at the door and drops a laptop into your arms: "Game\'s done. 47,000 lines of open-world mayhem. CEO wants it on GitHub before lunch, or heads roll — probably yours. You know `gh`, right?"\n\n  She walks away before you can answer.\n\n  The terminal is already open. You\'re going to ship this. But first: know what you\'re working with. The terminal gives you a text-based view of your filesystem — no Finder, no file icons, just direct access to every folder and file. `ls` lists the contents of your current directory. It\'s the first command any developer reaches for in an unfamiliar codebase.',
          objective: 'Run `ls` (or `ls -la`) to survey the project files.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /^(ls|ll|la|pwd)\b/i.test(input.trim()) && r.exitCode === 0, reason: 'list directory contents with ls or check your location with pwd' }),
          },
          hints: [
            '`ls` lists everything in your current directory — just like opening a folder in Finder, but instantly, in text. This is how developers orient themselves in a new project.',
            '`ls -la` is the power version: `-l` shows long format (permissions, size, date), `-a` shows hidden files (those starting with `.`).',
            'Run: `ls` or `ls -la`',
          ],
          xp: 15,
        },
        {
          id: 's1-git-status',
          narration: 'Files confirmed. Now: what state is this codebase in?\n\n  Git is a version control system — it tracks every change to your code across time. Every team uses it. Before you can push anything to GitHub, you need to know whether the code is committed, what\'s been changed, and whether anything is staging.\n\n  `git status` answers all of that in one shot: it shows what\'s been modified, what\'s staged for the next commit, and what Git isn\'t tracking at all. Think of it as a health check before surgery.',
          objective: 'Run `git status` to see the current state of the repository.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /git\s+status/i.test(input) && (/branch|modified|untracked|commit|Changes|nothing/i.test(r.stdout + r.stderr) || r.exitCode === 0), reason: 'run git status' }),
          },
          hints: [
            'Git is a version control system — it records a history of every change to your codebase. `git status` shows the current state: what\'s changed, what\'s staged, what\'s not tracked.',
            '`git status` is safe to run any time — it\'s read-only and shows information without changing anything.',
            'Run: `git status`',
          ],
          xp: 20,
        },
        {
          id: 's1-branch',
          type: 'branch',
          narration: 'There are modified files. The code has changes since the last commit. Two ways forward — check what changed, or trust the team and stage everything now.',
          branches: [
            {
              label: 'Review the diff — I want to know what changed before I touch it',
              flavor: 'No surprises in production. Check the diff.',
              steps: [
                {
                  id: 's1-b1-diff',
                  narration: 'Smart call. A diff shows the exact lines that changed — additions appear in green with a `+`, removals in red with a `-`. It\'s the difference between the last committed snapshot and what\'s on disk right now.\n\n  Reading the diff before staging means you know exactly what you\'re about to commit. No mystery files. No accidental debug code. No credentials that slipped in overnight. Every professional developer checks the diff before they ship.',
                  objective: 'Run `git diff` to see exactly what changed.',
                  verify: {
                    mode: 'shell',
                    custom: (r, input) => ({ ok: /git\s+diff/i.test(input) && r.exitCode === 0, reason: 'run git diff' }),
                  },
                  hints: [
                    '`git diff` shows the difference between your working tree and the last commit. Green lines with `+` were added. Red lines with `-` were removed.',
                    'Run it with no arguments to see all unstaged changes in the project.',
                    'Run: `git diff`',
                  ],
                  xp: 20,
                },
                {
                  id: 's1-b1-add',
                  narration: 'Diff reviewed. Nothing alarming. Time to stage.\n\n  Staging is Git\'s preparation step — you select which changes to include in the next snapshot before you commit (seal) it. Think of it like packing a shipping box: `git add` picks what goes in; `git commit` tapes it shut.\n\n  You can stage individual files or everything at once. Since you\'ve read the diff and you know what\'s here, stage everything.',
                  objective: 'Run `git add .` or `git add -A` to stage all changes.',
                  verify: {
                    mode: 'shell',
                    custom: (r, input) => ({ ok: /git\s+add/i.test(input) && r.exitCode === 0, reason: 'stage files with git add' }),
                  },
                  hints: [
                    'Staging tells Git which changes to include in the next commit. `git add` moves files from "changed" to "ready to commit."',
                    '`git add .` stages everything in the current directory (and all subdirectories). `git add -A` also catches deletions.',
                    'Run: `git add .` or `git add -A`',
                  ],
                  xp: 15,
                },
              ],
            },
            {
              label: 'Stage everything now — I trust the team, let\'s move',
              flavor: 'Fast mover. The game is done, ship it.',
              steps: [
                {
                  id: 's1-b2-add',
                  narration: 'Bold. Sometimes you trust the team and you just move.\n\n  Staging tells Git which changes to include in the next commit. You\'re selecting all of them — every modified file, every new asset — to be part of this snapshot. `git add` does the selecting. The `.` means "everything in this directory and below."',
                  objective: 'Run `git add .` or `git add -A` to stage all changes.',
                  verify: {
                    mode: 'shell',
                    custom: (r, input) => ({ ok: /git\s+add/i.test(input) && r.exitCode === 0, reason: 'stage files with git add' }),
                  },
                  hints: [
                    'Staging is how Git knows what to include in the next commit. Use `git add` to pick what goes in.',
                    '`git add .` stages everything changed in the current directory. `-A` also works.',
                    'Run: `git add .` or `git add -A`',
                  ],
                  xp: 20,
                },
              ],
            },
          ],
        },
        {
          id: 's1-commit',
          narration: 'Files staged. Now seal the snapshot.\n\n  A commit is a permanent record in Git\'s history. It saves your staged changes with a message that explains what changed and why. Every commit is a checkpoint — you can always go back to it, compare it to others, or revert to it if something breaks.\n\n  Good commit messages are a form of documentation. They live in the git log forever. Other developers — and future you — will read them. Write something honest.',
          objective: 'Run `git commit -m "..."` with a descriptive message.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /git\s+commit/i.test(input) && (/commit|file|changed|main/i.test(r.stdout + r.stderr) || r.exitCode === 0), reason: 'commit with git commit -m' }),
          },
          hints: [
            'A commit saves your staged changes permanently to Git\'s history. Every commit needs a message. Use `git commit -m` to include the message inline.',
            'Put your message in quotes after `-m`. Be specific about what the commit contains.',
            'Try: `git commit -m "feat: StreetRacer Unlimited v0.9.0 — ready to ship"`',
          ],
          xp: 25,
        },
        {
          id: 's1-gh-version',
          narration: 'Committed. Now get it onto GitHub.\n\n  GitHub is where code lives in the cloud: shareable, accessible from anywhere, backed up, and collaborative. The `gh` CLI is GitHub\'s command-line tool — it lets you create repos, open pull requests, manage issues, and more, without ever opening a browser.\n\n  Before relying on any CLI tool, confirm it\'s installed and check its version. This is basic hygiene — it tells you the tool is available, prevents "command not found" surprises, and shows whether you need to update.',
          objective: 'Run `gh --version` to confirm the GitHub CLI is installed.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+(--version|-v)/i.test(input) && (r.exitCode === 0 || /gh version/i.test(r.stdout)), reason: 'check gh version with gh --version' }),
          },
          hints: [
            '`gh` is the GitHub CLI — it puts the full GitHub workflow into your terminal. `--version` confirms it\'s installed and shows which version you\'re running.',
            'This is different from `git` — `git` is version control, `gh` is GitHub-specific.',
            'Run: `gh --version`',
          ],
          xp: 15,
        },
        {
          id: 's1-auth',
          narration: '`gh` is installed. But right now it\'s a tool with no identity — it doesn\'t know who you are or which GitHub account to act on behalf of.\n\n  Authentication is the link between `gh` and your GitHub account. Without it, `gh` can\'t create repositories, push code, or do anything that requires your identity. Think of it as logging in.\n\n  `gh auth status` shows your current authentication state: which account is active and whether your token is valid.',
          objective: 'Run `gh auth status` to confirm you\'re authenticated.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+auth/i.test(input) && (/github\.com|Logged in|not logged/i.test(r.stdout + r.stderr) || r.exitCode === 0), reason: 'check auth with gh auth status' }),
          },
          hints: [
            'Authentication links `gh` to your GitHub account. Without it, commands that touch GitHub (creating repos, pushing) will fail with permission errors.',
            '`gh auth status` is a read-only check — it shows your login state without changing anything.',
            'Run: `gh auth status`',
          ],
          xp: 20,
        },
        {
          id: 's1-repo-create',
          narration: '9:47am. Authenticated. Code committed. Time to create the remote home for it.\n\n  A GitHub repository is a cloud-hosted copy of your codebase — stored on GitHub\'s servers, accessible from any browser or terminal, shareable with anyone. Creating one used to mean opening github.com, clicking through a form, and then figuring out the push URL.\n\n  `gh repo create` does it all from your terminal. Pass the name, set it public, and use `--source=.` with `--push` to upload your commits immediately after creation. One command.',
          objective: 'Run `gh repo create street-racer-unlimited --public --source=. --push` to create the repo and push.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+repo\s+create/i.test(input) && (/Created|github\.com|repository|street-racer/i.test(r.stdout) || r.exitCode === 0), reason: 'create repo with gh repo create' }),
          },
          hints: [
            '`gh repo create` creates a GitHub repository under your account — no browser required. `--public` makes it visible to everyone. `--source=.` uses the current directory. `--push` uploads your commits immediately.',
            'The repo name goes right after `gh repo create`.',
            'Run: `gh repo create street-racer-unlimited --public --source=. --push`',
          ],
          xp: 30,
        },
        {
          id: 's1-shipped',
          narration: '9:52am. Eight minutes to spare.\n\n  47,000 lines of StreetRacer Unlimited, committed, pushed, and live on GitHub. The CEO has a URL. You have a job.\n\n  Confirm the landing: `gh repo view` shows the repository\'s details right in your terminal — name, visibility, URL, commit count. One command to verify the work is done.',
          objective: 'Run `gh repo view` to confirm the repository is live.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+repo\s+view/i.test(input) && (/street-racer|github\.com|Description|public/i.test(r.stdout) || r.exitCode === 0), reason: 'view the repo with gh repo view' }),
          },
          hints: [
            '`gh repo view` shows the remote repository\'s name, description, visibility, URL, and other metadata — without opening a browser.',
            'Run it from inside your project directory — it finds the linked GitHub repo automatically.',
            'Run: `gh repo view`',
          ],
          xp: 20,
        },
      ],
    },

    // ── STORY 2: The Midnight Deploy ─────────────────────────────────────────
    {
      id: 'midnight-deploy',
      title: 'The Midnight Deploy',
      setting: '2:47am. Game jam closes at 3:00am. Neon Heist exists only on your laptop.',
      art: GAMEJAM_ART,
      steps: [
        {
          id: 's2-where',
          narration: '2:47am. The game jam portal closes at 3:00am sharp. Neon Heist — your entry — is done. It\'s on your laptop. It\'s nowhere else.\n\n  You need it on GitHub in thirteen minutes.\n\n  First: get your bearings. When you open a terminal, you\'re always inside a directory — your current working location. Every command you run happens relative to that location. Before you can commit or push anything, you need to know where you are and what files are here.',
          objective: 'Run `pwd` to print your current directory, then `ls` to list its contents.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /^(ls|ll|la|pwd)\b/i.test(input.trim()) && (r.stdout.length > 0 || r.exitCode === 0), reason: 'list files with ls or print your location with pwd' }),
          },
          hints: [
            '`pwd` (print working directory) shows the full path of the folder you\'re currently in. `ls` shows what files are there. Use them together to orient yourself.',
            'You can chain them: run `pwd` first to confirm your location, then `ls` to see the files.',
            'Try: `pwd` then `ls`',
          ],
          xp: 10,
        },
        {
          id: 's2-status',
          narration: '11 minutes. You need to know Git\'s state before touching anything.\n\n  If Git isn\'t even initialised in this folder, `git status` will tell you — you\'d see an error about "not a git repository" and know to run `git init` first. If it is initialised, `git status` shows what\'s been changed, what\'s staged, and whether there are commits already. One command answers everything.',
          objective: 'Run `git status` to check the current repository state.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /git\s+status/i.test(input) && (/branch|modified|untracked|commit|Changes/i.test(r.stdout + r.stderr) || r.exitCode === 0), reason: 'run git status' }),
          },
          hints: [
            '`git status` is a read-only health check. It shows what\'s changed since the last commit, what\'s staged, and what\'s completely untracked.',
            'If git isn\'t initialized, you\'ll see a "not a git repository" error. Then run `git init` first.',
            'Run: `git status`',
          ],
          xp: 15,
        },
        {
          id: 's2-add',
          narration: '9 minutes. Git is running, nothing is staged. Time to select your files.\n\n  Staging is the selection step: you tell Git which changes to include in your next commit. You\'re selecting everything — all game files, art assets, scripts, sounds — to go into this snapshot. `git add .` stages the entire current directory at once.',
          objective: 'Run `git add .` to stage all project files.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /git\s+add/i.test(input) && r.exitCode === 0, reason: 'stage files with git add' }),
          },
          hints: [
            'Staging picks what goes into the next commit. `git add` stages files. The `.` means "everything in this directory and below."',
            '`git add .` stages all new and modified files. `-A` also catches deleted files.',
            'Run: `git add .`',
          ],
          xp: 15,
        },
        {
          id: 's2-commit',
          narration: '8 minutes. Files staged. Seal the snapshot.\n\n  A commit is a permanent checkpoint in Git\'s history — your changes, frozen in time, with a message that explains what they contain. The judges will see this message in the repo. The timestamp will be on record. It will live in the git log.\n\n  Make it honest.',
          objective: 'Run `git commit -m "..."` with a clear message.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /git\s+commit/i.test(input) && (/commit|file|changed/i.test(r.stdout) || r.exitCode === 0), reason: 'commit with git commit -m' }),
          },
          hints: [
            'A commit saves your staged changes to Git\'s history with a message. Use `git commit -m` to write the message inline.',
            'Judges will see this. Make it descriptive.',
            'Try: `git commit -m "feat: neon heist v1.0 — game jam submission"`',
          ],
          xp: 20,
        },
        {
          id: 's2-auth',
          narration: '7 minutes. The commit exists locally. GitHub doesn\'t know it yet.\n\n  Before you can create a repo on GitHub or push to it, `gh` needs to know who you are. It needs to be authenticated — connected to your GitHub account. Without authentication, it can\'t create anything on GitHub on your behalf.\n\n  Check now. Finding an expired auth token at 2:58am is not a situation you want to be in.',
          objective: 'Run `gh auth status` to confirm authentication before creating the repo.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+auth/i.test(input) && (/github\.com|Logged in|not logged/i.test(r.stdout + r.stderr) || r.exitCode === 0), reason: 'check auth with gh auth status' }),
          },
          hints: [
            '`gh auth status` verifies your login state. It\'s a one-second check that prevents a multi-minute auth debugging session at 2:58am.',
            'It shows which account is active and whether your token has the right permissions.',
            'Run: `gh auth status`',
          ],
          xp: 15,
        },
        {
          id: 's2-branch',
          type: 'branch',
          narration: '6 minutes. Authenticated. Two ways to get this live — create the repo first then push, or do both in one shot.',
          branches: [
            {
              label: 'Create the repo on GitHub first, then push',
              flavor: 'Explicit steps. Full control.',
              steps: [
                {
                  id: 's2-b1-create',
                  narration: 'Creating the repository first gives you a clear remote target before you push. A GitHub repository is a cloud-hosted home for your code — `gh repo create` creates one under your account, instantly, without opening a browser.',
                  objective: 'Run `gh repo create neon-heist --public` to create the GitHub repo.',
                  verify: {
                    mode: 'shell',
                    custom: (r, input) => ({ ok: /gh\s+repo\s+create/i.test(input) && (/Created|github\.com|neon-heist|repository/i.test(r.stdout) || r.exitCode === 0), reason: 'create repo with gh repo create' }),
                  },
                  hints: [
                    '`gh repo create` creates a GitHub repository under your account. The repo name goes right after the command.',
                    '`--public` makes the repo visible to the judges. Without it, they can\'t see it.',
                    'Run: `gh repo create neon-heist --public`',
                  ],
                  xp: 25,
                },
                {
                  id: 's2-b1-push',
                  narration: 'Repo created on GitHub. Now push your commits to it.\n\n  Pushing uploads your local commits to the remote repository. Without this step, your code exists only on your laptop. The `-u` flag sets the "upstream" — it links your local branch to the remote one so future pushes are simpler.',
                  objective: 'Run `git push -u origin main` to push your commits.',
                  verify: {
                    mode: 'shell',
                    custom: (r, input) => ({ ok: /git\s+push/i.test(input) && (/Writing|objects|done|->|branch|main/i.test(r.stdout + r.stderr) || r.exitCode === 0), reason: 'push with git push' }),
                  },
                  hints: [
                    '`git push` uploads your local commits to GitHub. Without it, your code only exists on your machine.',
                    '`-u origin main` sets the remote branch as the upstream for your local branch. It\'s needed the first time you push a new branch.',
                    'Run: `git push -u origin main`',
                  ],
                  xp: 20,
                },
              ],
            },
            {
              label: 'One command — create and push simultaneously',
              flavor: '5 minutes left. No time for two steps.',
              steps: [
                {
                  id: 's2-b2-create-push',
                  narration: '`gh repo create` can create the GitHub repository AND push your commits in a single command.\n\n  `--source=.` tells it to use the current directory as the source. `--push` uploads all existing commits immediately after the repo is created. Create and ship in one line.',
                  objective: 'Run `gh repo create neon-heist --public --source=. --push` to create and push simultaneously.',
                  verify: {
                    mode: 'shell',
                    custom: (r, input) => ({ ok: /gh\s+repo\s+create/i.test(input) && (/Created|github\.com|Writing|objects|neon-heist/i.test(r.stdout) || r.exitCode === 0), reason: 'create and push with gh repo create' }),
                  },
                  hints: [
                    '`gh repo create` can do the whole thing: create the repo on GitHub AND push your commits. `--source=.` uses the current directory. `--push` uploads immediately.',
                    'This is the fastest path — create and ship in one command.',
                    'Run: `gh repo create neon-heist --public --source=. --push`',
                  ],
                  xp: 30,
                },
              ],
            },
          ],
        },
        {
          id: 's2-view',
          narration: '2:58am. Two minutes to spare.\n\n  Neon Heist is on GitHub. You copy the URL into the jam portal. Submit. Confirmation email lands at 2:59:47am.\n\n  You did it. Verify the landing: `gh repo view` confirms the repo is live without opening a browser.',
          objective: 'Run `gh repo view` to confirm the repo is live on GitHub.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+repo\s+view/i.test(input) && (/neon-heist|github\.com|Description|star|fork/i.test(r.stdout) || r.exitCode === 0), reason: 'view repo with gh repo view' }),
          },
          hints: [
            '`gh repo view` shows the current project\'s remote repository: name, URL, visibility, description. All from the terminal.',
            'Run it from inside your project directory — it finds the linked GitHub repo automatically.',
            'Run: `gh repo view`',
          ],
          xp: 15,
        },
      ],
    },

    // ── STORY 3: Fork the World ──────────────────────────────────────────────
    {
      id: 'fork-the-world',
      title: 'Fork the World',
      setting: 'OpCity\'s physics is 40% faster. The maintainer is MIA. The only way to ship it is a fork.',
      art: FORK_ART,
      steps: [
        {
          id: 's3-recon',
          narration: 'OpCity is an open-source city builder with 12,000 GitHub stars. Beautiful game. Terrible physics performance. Someone on a forum posted a patch last week — 40% speedup in the broadphase collision system. The thread blew up.\n\n  The maintainer hasn\'t merged it. Hasn\'t responded. Last commit: six months ago.\n\n  You want the patch in your game. The only way to get it is to take ownership — fork the repo, apply the changes yourself, and ship your version. Before you fork anything, understand what you\'re forking.\n\n  `gh repo view` lets you inspect any public GitHub repository from your terminal — name, description, language, URL, everything — without opening a browser.',
          objective: 'Run `gh repo view opengame/opcity` to inspect the upstream repo.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+repo\s+view/i.test(input) && (/opcity|github\.com|Description|star|fork|language/i.test(r.stdout) || r.exitCode === 0), reason: 'view the upstream repo with gh repo view' }),
          },
          hints: [
            '`gh repo view` can inspect any public GitHub repo. Pass the full name as `owner/repo`.',
            'The owner is `opengame`, the repo is `opcity`.',
            'Run: `gh repo view opengame/opcity`',
          ],
          xp: 20,
        },
        {
          id: 's3-auth',
          narration: 'Repo inspected. Now: confirm your identity.\n\n  Forking creates a personal copy of someone else\'s repository under YOUR GitHub account. For `gh` to do this on your behalf, it needs to know who you are. If authentication isn\'t active — or the token has expired — the fork command will fail.\n\n  Check before you need it.',
          objective: 'Run `gh auth status` to confirm authentication.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+auth/i.test(input) && (/github\.com|Logged in|not logged/i.test(r.stdout + r.stderr) || r.exitCode === 0), reason: 'check auth with gh auth status' }),
          },
          hints: [
            'Forking requires your GitHub identity — the fork will appear under your account. `gh auth status` confirms you\'re logged in.',
            'It\'s a read-only check. It won\'t change anything.',
            'Run: `gh auth status`',
          ],
          xp: 15,
        },
        {
          id: 's3-fork',
          narration: 'Authenticated. Time to fork.\n\n  A fork is your personal copy of someone else\'s repository — hosted under your GitHub account, not theirs. Unlike cloning (which just copies locally), forking creates a new remote repo on GitHub. You own it. You can make changes, push commits, and the original maintainer never needs to give you write access.\n\n  Forks are the backbone of open-source contribution. This is how the community moves faster than maintainers.',
          objective: 'Run `gh repo fork opengame/opcity` to fork the repo to your account.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+repo\s+fork/i.test(input) && (/fork|Created|opcity|github\.com/i.test(r.stdout) || r.exitCode === 0), reason: 'fork the repo with gh repo fork' }),
          },
          hints: [
            '`gh repo fork` creates a copy of any public repo under your GitHub account. You own your fork — you can push to it freely.',
            'Pass the source repo as `owner/repo`. Your fork will appear at `your-username/opcity`.',
            'Run: `gh repo fork opengame/opcity`',
          ],
          xp: 30,
        },
        {
          id: 's3-clone',
          narration: 'Fork created on GitHub. But it only exists in the cloud — not on your machine yet. You need a local copy to actually edit the code.\n\n  Cloning downloads a repository from GitHub to your local machine. It creates a folder with all the files and a full copy of the git history.\n\n  Important: always clone YOUR fork, not the original. When you clone the original, your commits have nowhere to go — you don\'t have write access. Clone your fork and your commits push to your copy.',
          objective: 'Run `git clone` with your fork\'s URL to download it locally.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /git\s+clone/i.test(input) && (/Cloning|done|objects|opcity/i.test(r.stdout + r.stderr) || r.exitCode === 0), reason: 'clone with git clone' }),
          },
          hints: [
            '`git clone <url>` downloads a repository from GitHub to your local machine. You need a local copy to edit code.',
            'Clone YOUR fork, not the original. Your fork is at `https://github.com/<your-username>/opcity.git`.',
            'Run: `git clone https://github.com/<your-username>/opcity.git`',
          ],
          xp: 20,
        },
        {
          id: 's3-branch',
          type: 'branch',
          narration: 'Cloned. You\'re inside the repo. Before applying the physics patch, create a branch — an isolated workspace for your change that doesn\'t touch `main`.\n\n  Branch names show up in pull requests and git history. They\'re read by maintainers, collaborators, and future-you. What do you name yours?',
          branches: [
            {
              label: 'fix/physics-broadphase-optimization',
              flavor: 'Describes what was fixed. Conservative and clear.',
              steps: [
                {
                  id: 's3-b1-checkout',
                  narration: 'A branch is an isolated line of development. Creating one lets you make changes without touching `main` — the stable codebase everyone else is working from. If your change breaks something, `main` is untouched. If the maintainer wants to review your work, they get a clean branch with only your changes.\n\n  `git checkout -b` creates a new branch AND switches to it in one step.',
                  objective: 'Run `git checkout -b fix/physics-broadphase-optimization` to create and switch to your branch.',
                  verify: {
                    mode: 'shell',
                    custom: (r, input) => ({ ok: /git\s+(checkout\s+-b|switch\s+-c)/i.test(input) && r.exitCode === 0, reason: 'create a branch with git checkout -b' }),
                  },
                  hints: [
                    'Branches isolate your work from the stable main codebase. Other developers keep working on `main` — your changes are contained here until ready.',
                    '`git checkout -b` creates a new branch and switches to it in one step. The branch name should describe what you\'re changing.',
                    'Run: `git checkout -b fix/physics-broadphase-optimization`',
                  ],
                  xp: 20,
                },
              ],
            },
            {
              label: 'perf/40pct-physics-speedup',
              flavor: 'Quantifies the improvement. Makes the PR title write itself.',
              steps: [
                {
                  id: 's3-b2-checkout',
                  narration: 'A branch is an isolated workspace for your change — other developers work on their own branches simultaneously without interfering. The name you choose appears in pull requests and git history.\n\n  Quantifying the improvement — "40pct" — makes the value immediately legible to anyone who reads the PR. It sets expectations before anyone looks at a single line of code.',
                  objective: 'Run `git checkout -b perf/40pct-physics-speedup` to create and switch to your branch.',
                  verify: {
                    mode: 'shell',
                    custom: (r, input) => ({ ok: /git\s+(checkout\s+-b|switch\s+-c)/i.test(input) && r.exitCode === 0, reason: 'create a branch with git checkout -b' }),
                  },
                  hints: [
                    'A branch isolates your changes. `git checkout -b` creates and switches to a new branch in one command.',
                    'The name appears in your pull request — make it describe what the change achieves.',
                    'Run: `git checkout -b perf/40pct-physics-speedup`',
                  ],
                  xp: 20,
                },
              ],
            },
          ],
        },
        {
          id: 's3-push-branch',
          narration: 'Branch created. Physics patch applied, staged, and committed.\n\n  Now push the branch to your fork on GitHub. Pushing uploads your local branch to the remote repository so the maintainer can see it — and so you can open a pull request from it.\n\n  The `-u` flag sets the upstream link, connecting your local branch to its remote counterpart. This makes future `git push` commands simpler.',
          objective: 'Run `git push -u origin HEAD` to push your branch to your fork.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /git\s+push/i.test(input) && (/objects|done|branch|->|Writing/i.test(r.stdout + r.stderr) || r.exitCode === 0), reason: 'push the branch with git push' }),
          },
          hints: [
            '`git push` uploads your local branch to GitHub. Until you push, your branch exists only on your machine.',
            '`-u origin HEAD` pushes the current branch and sets the upstream. `HEAD` always refers to your current branch, whatever it\'s named.',
            'Run: `git push -u origin HEAD`',
          ],
          xp: 20,
        },
        {
          id: 's3-pr',
          narration: 'Branch pushed. One step left: open the pull request.\n\n  A pull request (PR) is a formal proposal to merge your branch into another repository. You\'re saying: "I made this improvement. Here it is. Would you like to include it?"\n\n  Even if the maintainer is slow to respond, opening the PR is the right move. The community can see it, link to it, and use your fork in the meantime. Open source moves at the speed of pull requests.',
          objective: 'Run `gh pr create --repo opengame/opcity` to open a pull request against the upstream.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+pr\s+create/i.test(input) && (/pull request|PR|Created|github\.com|request/i.test(r.stdout) || r.exitCode === 0), reason: 'open a PR with gh pr create' }),
          },
          hints: [
            '`gh pr create` opens a pull request from your current branch. `--repo` targets the upstream repo (not your fork) as the destination.',
            'Add `--title` and `--body` to describe what your change does.',
            'Try: `gh pr create --repo opengame/opcity --title "perf: 40% physics engine speedup" --body "Broadphase collision optimization reduces overhead by 40%"',
          ],
          xp: 35,
        },
      ],
    },
  ],
};
