// Quest pack: Ghost in the Shell — 3 stories, branching paths.
// Teaches: gh copilot explain, gh copilot suggest.

const GHOST_ART = `
  ╔══════════════════╗
  ║  ◉  COPILOT  ◉  ║
  ║   [  ONLINE  ]   ║
  ╚══════════════════╝
    |            |
   / \\          / \\
`;

const DEBUG_ART = `
  ⚠  PRODUCTION DOWN  ⚠
  ─────────────────────
  ERROR: segfault @ 0x4f
  STACK: physics.js:412
  TIME:  03:17:44 UTC
  ─────────────────────
`;

const HIRE_ART = `
  ┌─────────────────────┐
  │  NEW TICKET #4471   │
  │  Priority: P0       │
  │  Assignee: You      │
  │  Due: TODAY         │
  └─────────────────────┘
`;

export default {
  order: 4,
  id: 'copilot-cli',
  title: 'Ghost in the Shell',
  synopsis: "Three stories about using `gh copilot` to explain errors and suggest commands when you're stuck.",
  tool: 'gh copilot',
  stories: [

    // ── STORY 1: Summon the Copilot ──────────────────────────────────────────
    {
      id: 'summon-the-copilot',
      title: 'Summon the Copilot',
      setting: 'Standup in 20 minutes. Your team is asking about "that AI thing in the terminal." Time to learn it before the meeting starts.',
      art: GHOST_ART,
      steps: [
        {
          id: 'c1-which',
          narration: 'It\'s 9:40am. Standup is at 10. Someone dropped a message in Slack last night: "who knows that AI terminal assistant? demo it tomorrow?" Everyone hit the thumbs-up. Including you.\n\n  You do not know that AI terminal assistant. Yet.\n\n  `gh copilot` is a GitHub Copilot extension that lives directly in your terminal — no browser, no chat window. It can explain any shell command in plain English and generate new commands from a plain English description. Think of it as a pair programmer that never gets tired and knows every CLI tool ever made.\n\n  Before you can use it, you need to confirm the foundation is here. Copilot is a plugin for `gh` — the GitHub CLI — so `gh` must be installed first. The `which` command searches your PATH (the list of directories your shell looks in when you type a command) and prints the location of any installed binary.',
          objective: 'Run `which gh` to confirm the `gh` binary is on your PATH.',
          verify: { mode: 'which', binary: 'gh' },
          hints: [
            '`which` tells you where a command lives on your system. If it returns a file path, the tool is installed. If it returns nothing, it needs to be installed first.',
            'You\'re checking for the `gh` binary — the GitHub CLI that Copilot plugs into.',
            'Run: `which gh`',
          ],
          xp: 15,
        },
        {
          id: 'c1-extension-list',
          narration: '`gh` is on the machine. Good start.\n\n  But `gh copilot` isn\'t built into `gh` — it\'s an extension. The `gh` CLI supports community-built plugins that add extra subcommands. Copilot is the most powerful of them.\n\n  Extensions are like apps for `gh`: once installed, they appear as new commands under the `gh` namespace. `gh extension list` shows every extension currently installed on this machine. This is your check: is Copilot already here, or does it need to be added?',
          objective: 'Run `gh extension list` to see which extensions are installed.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+extension\s+list/i.test(input) && r.exitCode === 0, reason: 'list extensions with gh extension list' }),
          },
          hints: [
            '`gh` can be extended with community plugins. `gh extension list` shows everything currently installed — including whether Copilot is ready to use.',
            'The subcommand for managing extensions is `gh extension`. Pair it with `list` to see what\'s installed.',
            'Run: `gh extension list`',
          ],
          xp: 20,
        },
        {
          id: 'c1-concept',
          type: 'branch',
          narration: 'Copilot is installed. Eight minutes until standup.\n\n  Two ways to get up to speed before the demo. Which one matches how you learn?',
          branches: [
            {
              label: 'Read the help text — understand what it can do first',
              flavor: 'Theory before practice. No surprises.',
              steps: [
                {
                  id: 'c1-b1-help',
                  narration: 'Smart move. Reading a tool\'s help text takes thirty seconds and gives you the full map before you start navigating.\n\n  Every well-built CLI tool has a `--help` flag that prints its available subcommands and what each one does. For `gh copilot`, this will show you the two main powers: `explain` and `suggest`. Knowing the difference upfront means you\'ll reach for the right one instinctively during the demo.',
                  objective: 'Run `gh copilot --help` to see the available subcommands and flags.',
                  verify: {
                    mode: 'shell',
                    custom: (r, input) => ({ ok: /gh\s+copilot/i.test(input) && /--help/.test(input) && (/copilot|explain|suggest|Usage|Available/i.test(r.stdout + r.stderr) || r.exitCode === 0), reason: 'print help with gh copilot --help' }),
                  },
                  hints: [
                    'The `--help` flag is a universal convention across CLI tools. It prints the command\'s available subcommands, flags, and a short description of each.',
                    'You want help specifically for the `gh copilot` subcommand — not `gh` itself.',
                    'Run: `gh copilot --help`',
                  ],
                  xp: 20,
                },
              ],
            },
            {
              label: 'Jump straight in — ask it to suggest a command',
              flavor: 'Learn by doing. Theory follows experience.',
              steps: [
                {
                  id: 'c1-b2-suggest',
                  narration: 'Bold. Here\'s the tool: `gh copilot suggest`.\n\n  You type a plain English description of what you want to accomplish. Copilot generates the exact shell command — with the right flags, the right syntax, everything. No memorisation required. No man-page spelunking.\n\n  It knows `git`, `docker`, `kubectl`, `aws`, `ffmpeg`, and hundreds more. You describe the goal. Copilot writes the command. Try it on something simple — like listing files sorted by date.',
                  objective: 'Run `gh copilot suggest` with a natural language description to generate a shell command.',
                  verify: {
                    mode: 'shell',
                    custom: (r, input) => ({ ok: /gh\s+copilot\s+suggest/i.test(input) && (r.exitCode === 0 || r.stdout.length > 0), reason: 'use gh copilot suggest' }),
                  },
                  hints: [
                    '`gh copilot suggest` translates plain English into a shell command. You describe what you want — Copilot handles the syntax.',
                    'Wrap your description in quotes after `suggest`. Be specific about the tool or outcome you want.',
                    'Try: `gh copilot suggest "list files sorted by modification date"`',
                  ],
                  xp: 25,
                },
              ],
            },
          ],
        },
        {
          id: 'c1-auth',
          narration: 'Three minutes to standup. Almost ready.\n\n  One critical check: authentication. `gh copilot` is a paid GitHub feature tied to your GitHub account. Before it will respond to any command, `gh` needs to verify who you are — it must be linked to an account that has Copilot access.\n\n  `gh auth status` shows your current authentication state: whether you\'re logged in, which account is active, and what permissions your token has. If you\'re not authenticated, Copilot will refuse to run — and you\'ll find that out at the worst possible moment.',
          objective: 'Run `gh auth status` to confirm your GitHub CLI authentication is active.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+auth/i.test(input) && (/github\.com|Logged in|not logged|status/i.test(r.stdout + r.stderr) || r.exitCode === 0), reason: 'check auth with gh auth status' }),
          },
          hints: [
            '`gh` must be authenticated to your GitHub account before Copilot will work. Authentication is essentially logging in — it gives `gh` permission to act on your behalf.',
            '`gh auth status` is a read-only check. It shows your current login state without changing anything.',
            'Run: `gh auth status`',
          ],
          xp: 20,
        },
        {
          id: 'c1-explain',
          narration: 'Authenticated. One minute to standup. Time for the actual demo move.\n\n  `gh copilot explain` takes any shell command — simple or bizarre — and translates it into plain English. This is how you learn what unfamiliar commands mean without memorising man pages or searching Stack Overflow.\n\n  Try it on `ls -la`. It\'s one of the most common commands in any developer\'s toolkit, but if you\'ve never had it explained properly, you\'ve probably just been copying it on faith. Ask Copilot to break it down.',
          objective: 'Run `gh copilot explain "ls -la"` to see a plain English breakdown of the command.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+copilot\s+explain/i.test(input) && (r.exitCode === 0 || r.stdout.length > 0), reason: 'use gh copilot explain' }),
          },
          hints: [
            '`gh copilot explain` decodes any shell command into plain English. It breaks down each part — the base command, every flag, every argument — so you understand exactly what\'s happening.',
            'Wrap the command you want explained in quotes after `explain`.',
            'Run: `gh copilot explain "ls -la"`',
          ],
          xp: 25,
        },
      ],
    },

    // ── STORY 2: Debug at 3am ────────────────────────────────────────────────
    {
      id: 'debug-at-3am',
      title: 'Debug at 3am',
      setting: 'Production down. Cryptic error. Stack Overflow has nothing. You have gh copilot.',
      art: DEBUG_ART,
      steps: [
        {
          id: 'd1-survey',
          narration: 'Your phone screams at 3:17am. PagerDuty. The physics engine in production just crashed — segfault in physics.js. Players are getting infinite loading screens. Your on-call shift. Your problem.\n\n  You open your laptop. Terminal appears. You\'re in. But where exactly? What files are here? You need to orient yourself before you touch anything.\n\n  The first rule of debugging: understand your environment before you change it. `ls -la` lists every file in the current directory — including hidden files (the ones starting with `.`) — with their permissions, owner, and modification time. Start here. Know your terrain.',
          objective: 'Run `ls -la` to survey all files in the current directory.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: r.stdout.length > 0 || r.exitCode === 0, reason: 'list directory contents' }),
          },
          hints: [
            '`ls` lists files in the current directory. The `-l` flag shows long format (permissions, size, date). The `-a` flag shows hidden files — those starting with `.` that a plain `ls` skips.',
            'Combining flags: `ls -la` is the same as `ls -l -a`. It shows everything, with full details.',
            'Run: `ls -la`',
          ],
          xp: 10,
        },
        {
          id: 'd1-gh-version',
          narration: '3:19am. You\'re going to use `gh copilot` to work through this — it can explain the error and suggest the fix. But before you lean on any tool during a live incident, confirm it\'s actually here and working.\n\n  A version check takes one second. It confirms the tool is installed, tells you the version you\'re running, and prevents a frustrating "command not found" error at 3:20am when you\'re already stressed.\n\n  Never assume a tool is available in a production environment. Verify.',
          objective: 'Run `gh --version` to confirm the GitHub CLI is installed.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+(--version|-v)/i.test(input) && (r.exitCode === 0 || /gh version/i.test(r.stdout)), reason: 'check gh version with gh --version' }),
          },
          hints: [
            'The `--version` flag is universally accepted by CLI tools. It prints the installed version and confirms the binary is on the PATH.',
            'You\'re checking the `gh` CLI — not `git`. Both are installed separately.',
            'Run: `gh --version`',
          ],
          xp: 15,
        },
        {
          id: 'd1-auth',
          narration: '3:20am. Tool confirmed. Now: is it authenticated?\n\n  `gh copilot` requires a valid GitHub session to respond. If your token expired — which happens, especially if you haven\'t used it in a while — every Copilot command will fail with an authentication error.\n\n  Checking auth status now takes one second. Discovering an expired token mid-diagnosis takes five minutes of frustration. Check it before you need it.',
          objective: 'Run `gh auth status` to verify your GitHub CLI authentication is active.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+auth/i.test(input) && (/github\.com|Logged in|not logged/i.test(r.stdout + r.stderr) || r.exitCode === 0), reason: 'check auth with gh auth status' }),
          },
          hints: [
            '`gh auth status` shows your current login state — which account is active, whether your token is valid, and what permissions it has.',
            'Run it before using any Copilot command during an incident. Expired auth at 3am is a nightmare.',
            'Run: `gh auth status`',
          ],
          xp: 15,
        },
        {
          id: 'd1-branch',
          type: 'branch',
          narration: 'Authenticated. The error is `Segmentation fault (core dumped)` thrown from inside physics.js. You have two angles of attack: decode the error message itself, or decode the deploy command that exposed it.',
          branches: [
            {
              label: 'Explain the error message — understand the crash first',
              flavor: 'Know what you\'re dealing with before touching the code.',
              steps: [
                {
                  id: 'd1-b1-explain',
                  narration: '"Segmentation fault (core dumped)" is one of the most cryptic errors in programming. It sounds like hardware broke. It doesn\'t tell you what went wrong or where. Most developers Googled it once, got a vague answer about memory, and moved on.\n\n  `gh copilot explain` can decode it right now. You paste in the error string and Copilot gives you a plain English explanation — what a segfault actually means, what typically causes it, and what to look for in the stack trace. This is understanding the weapon before you pick it up.',
                  objective: 'Run `gh copilot explain "Segmentation fault (core dumped)"` to decode the error.',
                  verify: {
                    mode: 'shell',
                    custom: (r, input) => ({ ok: /gh\s+copilot\s+explain/i.test(input) && (r.exitCode === 0 || r.stdout.length > 0), reason: 'use gh copilot explain' }),
                  },
                  hints: [
                    '`gh copilot explain` works on error messages, not just commands. Paste the error string in quotes and Copilot will tell you what it means and what typically causes it.',
                    'Wrap the full error message in quotes after `explain`. The more precise the string, the better the explanation.',
                    'Run: `gh copilot explain "Segmentation fault (core dumped)"`',
                  ],
                  xp: 25,
                },
              ],
            },
            {
              label: 'Explain the deploy script — find what triggered the crash',
              flavor: 'The root cause might be the deployment itself.',
              steps: [
                {
                  id: 'd1-b2-deploy',
                  narration: 'Sometimes the error isn\'t the bug — it\'s the command that revealed the bug. The deploy script might be passing a flag that changes Node\'s memory allocation, or running a worker thread configuration that physics.js can\'t handle.\n\n  `gh copilot explain` works on any shell command — including long, flag-heavy deployment scripts that look like line noise. Paste the command and Copilot breaks down every flag and argument in plain English.',
                  objective: 'Run `gh copilot explain` on the deploy command to understand what it does.',
                  verify: {
                    mode: 'shell',
                    custom: (r, input) => ({ ok: /gh\s+copilot\s+explain/i.test(input) && (r.exitCode === 0 || r.stdout.length > 0), reason: 'use gh copilot explain' }),
                  },
                  hints: [
                    '`gh copilot explain` can decode any shell command — not just simple ones. Complex deployment scripts with multiple flags are exactly where it shines.',
                    'Put the full deploy command in quotes after `explain`.',
                    'Run: `gh copilot explain "node --max-old-space-size=512 physics.js"`',
                  ],
                  xp: 25,
                },
              ],
            },
          ],
        },
        {
          id: 'd1-suggest',
          narration: '3:31am. You\'ve understood the crash: the Node.js process is running out of heap memory under the physics load. The fix is a memory flag — but you\'ve never set Node memory limits before. You don\'t know the exact flag or the right value.\n\n  This is exactly what `gh copilot suggest` is for. Describe what you want to accomplish in plain English. Copilot generates the exact command — right flag, right syntax, right value. No Googling. No Stack Overflow. No guessing at 3:31am.',
          objective: 'Run `gh copilot suggest` to find the right Node.js memory flag.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+copilot\s+suggest/i.test(input) && (r.exitCode === 0 || r.stdout.length > 0), reason: 'use gh copilot suggest' }),
          },
          hints: [
            '`gh copilot suggest` generates a shell command from a plain English description. You describe the goal — Copilot writes the syntax.',
            'Be specific in your description: what are you trying to do, with which tool, and what outcome do you want?',
            'Try: `gh copilot suggest "increase node.js heap memory limit when running a script"`',
          ],
          xp: 30,
        },
        {
          id: 'd1-resolved',
          narration: 'Copilot suggested `node --max-old-space-size=4096 physics.js`. You restart the service with the new flag. The segfaults stop. Physics engine stabilises. 4:03am.\n\n  You fixed a production incident in 46 minutes — without a single Stack Overflow tab. `gh copilot explain` told you what the crash meant. `gh copilot suggest` told you how to fix it.\n\n  Run one final extension check. Confirm your tools are intact. Then go back to sleep.',
          objective: 'Run `gh extension list` to confirm your tools are still in order.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+extension\s+list/i.test(input) && r.exitCode === 0, reason: 'list extensions with gh extension list' }),
          },
          hints: [
            'After resolving an incident, do a quick tools check before closing your laptop. Confirms nothing broke during the process.',
            '`gh extension list` shows all installed `gh` extensions.',
            'Run: `gh extension list`',
          ],
          xp: 15,
        },
      ],
    },

    // ── STORY 3: The New Hire's Secret Weapon ────────────────────────────────
    {
      id: 'new-hire-secret-weapon',
      title: "The New Hire's Secret Weapon",
      setting: 'Week 1. Impossible ticket. Build a CLI pipeline in bash. You barely know bash.',
      art: HIRE_ART,
      steps: [
        {
          id: 'n1-orient',
          narration: 'Monday. Week 1. You\'re still finding the bathroom.\n\n  Your tech lead walks over and drops Ticket #4471 in your lap: "Build a CLI pipeline — compress all video assets with ffmpeg, upload them to S3, invalidate the CDN cache." Due today. P0. No documentation. No examples. You have never written a bash pipeline. You have never used the AWS CLI. You have never touched a CDN invalidation command.\n\n  But you have `gh copilot suggest` — and it knows every CLI tool ever made. Start the same way you start every task: orient yourself. What files are here? What are you working with?',
          objective: 'Run `ls -la` to see what files are in the current directory.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: r.stdout.length > 0 || r.exitCode === 0, reason: 'list directory contents' }),
          },
          hints: [
            'Before writing anything, understand what you\'re working with. List the directory to see what files, scripts, and assets already exist.',
            '`ls -la` shows all files including hidden ones, with file sizes and modification times.',
            'Run: `ls -la`',
          ],
          xp: 10,
        },
        {
          id: 'n1-check-gh',
          narration: 'Files surveyed. Now confirm your tool.\n\n  `gh copilot suggest` is going to write the bash commands you don\'t know how to write yet. But first, confirm `gh` is installed on this machine. You\'re on a company laptop — not every tool you need is pre-installed. A version check confirms the binary is here and ready.',
          objective: 'Run `gh --version` to confirm the GitHub CLI is installed.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+(--version|-v)/i.test(input) && (r.exitCode === 0 || /gh version/i.test(r.stdout)), reason: 'check gh version with gh --version' }),
          },
          hints: [
            'Always confirm a tool is available before you build your workflow around it. A version check takes one second.',
            '`gh --version` prints the installed version and confirms the binary is on the PATH.',
            'Run: `gh --version`',
          ],
          xp: 15,
        },
        {
          id: 'n1-check-ext',
          narration: 'The `gh` CLI is installed — but Copilot is a plugin, not a built-in feature. It\'s added as an extension. If it isn\'t installed, `gh copilot suggest` won\'t work and you\'ll get a confusing "unknown subcommand" error.\n\n  Check your installed extensions now. One command, instant answer.',
          objective: 'Run `gh extension list` to confirm the Copilot extension is installed.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+extension\s+list/i.test(input) && r.exitCode === 0, reason: 'list extensions with gh extension list' }),
          },
          hints: [
            '`gh` supports community-built extensions that add extra commands. Copilot is one of them — it must be explicitly installed before it works.',
            '`gh extension list` shows every extension currently installed. You\'re looking for `github/gh-copilot` in the output.',
            'Run: `gh extension list`',
          ],
          xp: 15,
        },
        {
          id: 'n1-help',
          narration: 'Copilot is installed. Before you start using it on a real ticket, spend thirty seconds reading the help text.\n\n  `gh copilot` has two modes and knowing the difference matters:\n\n  `explain` — you give it a command you don\'t understand, it tells you what it does.\n  `suggest` — you describe what you want to accomplish, it generates the command.\n\n  For this ticket, you\'ll use `suggest` — you know what you want (compress video, upload to S3, invalidate cache), you just don\'t know the commands. Understanding which mode to use before you start saves you time.',
          objective: 'Run `gh copilot --help` to read the available subcommands.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+copilot/i.test(input) && /--help/.test(input) && (/copilot|explain|suggest|Usage|Available/i.test(r.stdout + r.stderr) || r.exitCode === 0), reason: 'print help with gh copilot --help' }),
          },
          hints: [
            'The `--help` flag prints a tool\'s available subcommands and a brief description of each. Reading it takes thirty seconds and prevents wrong-tool confusion.',
            'You want help for `gh copilot` specifically.',
            'Run: `gh copilot --help`',
          ],
          xp: 15,
        },
        {
          id: 'n1-auth',
          narration: 'One last check before you start on the ticket: authentication.\n\n  `gh copilot` is a paid GitHub feature — it needs to know who you are and confirm your account has Copilot access before it responds to anything. If you\'re not authenticated, every command returns an error and you lose five minutes figuring out why.',
          objective: 'Run `gh auth status` to confirm your GitHub authentication is active.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+auth/i.test(input) && (/github\.com|Logged in|not logged/i.test(r.stdout + r.stderr) || r.exitCode === 0), reason: 'check auth with gh auth status' }),
          },
          hints: [
            'Copilot requires GitHub authentication. Without it, every command fails silently or with a confusing error.',
            '`gh auth status` confirms your login state — account name, token validity, and permissions — in one second.',
            'Run: `gh auth status`',
          ],
          xp: 15,
        },
        {
          id: 'n1-pipeline-branch',
          type: 'branch',
          narration: 'Authenticated. Tools ready. Ticket #4471 has two parts: compress the videos with ffmpeg, then upload them to S3. You need commands for both. Where do you start?',
          branches: [
            {
              label: 'Ask Copilot to suggest a video compression command first',
              flavor: 'Handle compression before upload. Logical order.',
              steps: [
                {
                  id: 'n1-b1-compress',
                  narration: 'You\'ve never used `ffmpeg` before. It\'s a video processing command-line tool with hundreds of flags — the kind of thing that has a 200-page manual and a dedicated subreddit.\n\n  You don\'t need the manual. Describe what you want to `gh copilot suggest` in plain English: compress all mp4 files to 720p. Copilot will generate the exact ffmpeg command — the right codec flag, the right resolution flag, the right output syntax. You\'ll understand a new tool on your first day without memorising anything.',
                  objective: 'Use `gh copilot suggest` to generate a video compression command.',
                  verify: {
                    mode: 'shell',
                    custom: (r, input) => ({ ok: /gh\s+copilot\s+suggest/i.test(input) && (r.exitCode === 0 || r.stdout.length > 0), reason: 'use gh copilot suggest' }),
                  },
                  hints: [
                    '`gh copilot suggest` turns plain English into a working shell command. Describe the outcome you want — Copilot handles the flag syntax.',
                    'Be specific: which tool, what input, what output, what format.',
                    'Try: `gh copilot suggest "compress all mp4 files to 720p using ffmpeg"`',
                  ],
                  xp: 30,
                },
              ],
            },
            {
              label: 'Ask Copilot how to upload to S3 first — understand the destination',
              flavor: 'Know where it\'s going before you build the pipeline.',
              steps: [
                {
                  id: 'n1-b2-s3',
                  narration: 'Smart. Before building a pipeline, understand the destination. You\'ve never used the AWS CLI — it\'s another tool with a massive surface area and arcane flags.\n\n  `gh copilot suggest` knows it cold. Describe what you want: upload a directory to S3 with the AWS CLI. Copilot will generate the exact `aws s3` command with the right subcommand, the right flags for sync vs. copy, and the right bucket path format.',
                  objective: 'Use `gh copilot suggest` to generate an AWS S3 upload command.',
                  verify: {
                    mode: 'shell',
                    custom: (r, input) => ({ ok: /gh\s+copilot\s+suggest/i.test(input) && (r.exitCode === 0 || r.stdout.length > 0), reason: 'use gh copilot suggest' }),
                  },
                  hints: [
                    '`gh copilot suggest` knows the AWS CLI, `aws s3`, `aws cloudfront`, and every major cloud tool. Describe your goal — Copilot generates the command.',
                    'Be specific about what you want: upload, sync, or copy? Directory or file? To which service?',
                    'Try: `gh copilot suggest "upload all files in a directory to an S3 bucket using the aws cli"`',
                  ],
                  xp: 30,
                },
              ],
            },
          ],
        },
        {
          id: 'n1-explain',
          narration: 'Copilot gave you the command. Before you run AI-generated code on a production pipeline, do one thing: understand what it does.\n\n  `gh copilot explain` will break it down for you: what each flag does, what the output will look like, and what happens if something goes wrong. This takes thirty seconds — and it means you can explain your own code in the PR review when your tech lead asks "what does that flag mean?"',
          objective: 'Use `gh copilot explain` to understand the command Copilot just suggested.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+copilot\s+explain/i.test(input) && (r.exitCode === 0 || r.stdout.length > 0), reason: 'use gh copilot explain' }),
          },
          hints: [
            'Never ship code you don\'t understand — even if it was AI-generated. `gh copilot explain` gives you the breakdown so you can own it.',
            'Put the command you want explained in quotes after `explain`.',
            'Try: `gh copilot explain "aws s3 sync . s3://my-bucket --delete"`',
          ],
          xp: 25,
        },
        {
          id: 'n1-done',
          narration: 'Ticket #4471: closed. End of day one.\n\n  Your tech lead messages: "Nicely done — how\'d you get up to speed on ffmpeg and the AWS CLI so fast?"\n\n  You say: "I had help."\n\n  `gh copilot suggest` wrote the commands you didn\'t know. `gh copilot explain` made sure you understood them before shipping. That\'s the workflow: describe, generate, understand, ship.\n\n  Run one last extension check. Know your setup. This is your toolkit now.',
          objective: 'Run `gh extension list` to confirm your tools are in order.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+extension\s+list/i.test(input) && r.exitCode === 0, reason: 'list extensions with gh extension list' }),
          },
          hints: [
            'This is your setup now. Know what\'s installed, know what\'s available.',
            '`gh extension list` shows all installed `gh` extensions.',
            'Run: `gh extension list`',
          ],
          xp: 20,
        },
      ],
    },
  ],
};
