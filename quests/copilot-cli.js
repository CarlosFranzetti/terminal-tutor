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
  id: 'copilot-cli',
  title: 'Ghost in the Shell',
  synopsis: "Three stories about using `gh copilot` to explain errors and suggest commands when you're stuck.",
  tool: 'gh copilot',
  stories: [

    // ── STORY 1: Summon the Copilot ──────────────────────────────────────────
    {
      id: 'summon-the-copilot',
      title: 'Summon the Copilot',
      setting: 'Standup in 20 minutes. Your team is asking about "that AI thing in the terminal." Time to learn it.',
      art: GHOST_ART,
      steps: [
        {
          id: 'c1-which',
          narration: "GitHub Copilot CLI is an AI assistant that lives in your terminal. It can explain any shell command in plain English, and generate commands from natural language descriptions. Standup is in 20 minutes. Someone asked on Slack: 'Does anyone know that AI terminal thing?' You do not know that AI terminal thing. Yet. First question: is `gh` even on this machine? Copilot is a `gh` extension — `gh` must be installed first.",
          objective: 'Confirm the `gh` binary is on your PATH.',
          verify: { mode: 'which', binary: 'gh' },
          hints: [
            'Every installed command-line tool lives somewhere on your PATH — a list of directories your shell searches when you type a command. `which` finds where a binary lives.',
            '`which` followed by the name of a command tells you where it is installed. If it returns a path, the tool is available. If it returns nothing, it needs to be installed.',
            'Try: `which gh`'
          ],
          xp: 15
        },
        {
          id: 'c1-extension-list',
          narration: "`gh` is installed. Now: is the Copilot extension already set up? `gh` supports extensions — additional commands built by the community that plug into the `gh` tool. Copilot is one of them. List your installed extensions to check.",
          objective: 'List the installed `gh` extensions to check for copilot.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+extension\s+list/i.test(input) && r.exitCode === 0, reason: 'list extensions with gh extension list' })
          },
          hints: [
            'The `gh` CLI can be extended with community-built plugins. Extensions add extra commands to `gh`. `gh extension list` shows everything installed.',
            '`gh extension` is the subcommand for managing extensions. `list` shows what is installed.',
            'Try: `gh extension list`'
          ],
          xp: 20
        },
        {
          id: 'c1-concept',
          type: 'branch',
          narration: 'Copilot extension is listed. Two ways to start learning it: read the help text to understand what it does, or jump straight into using it.',
          branches: [
            {
              label: 'Ask gh copilot to explain what it does',
              flavor: 'Learn the theory first.',
              steps: [
                {
                  id: 'c1-b1-help',
                  narration: "Reading the help text before using a new tool is a good habit. It shows you what subcommands exist, what flags are available, and what the tool can do — in 10 seconds.",
                  objective: 'Print the gh copilot help output.',
                  verify: {
                    mode: 'shell',
                    custom: (r, input) => ({ ok: /gh\s+copilot/i.test(input) && /--help/.test(input) && (/copilot|explain|suggest|Usage|Available/i.test(r.stdout + r.stderr) || r.exitCode === 0), reason: 'print help with gh copilot --help' })
                  },
                  hints: [
                    'Most CLI tools have built-in help text that explains their features, subcommands, and flags. Reading it first saves you time guessing.',
                    '`--help` is the standard flag for showing help information on any CLI tool.',
                    'Try: `gh copilot --help`'
                  ],
                  xp: 20
                }
              ]
            },
            {
              label: 'Jump straight to asking it to suggest a command',
              flavor: 'Learn by doing.',
              steps: [
                {
                  id: 'c1-b2-suggest',
                  narration: "`gh copilot suggest` turns plain English into shell commands. You describe what you want to do, and it generates the command. No memorization required — this is the fastest way to learn what Copilot can do.",
                  objective: 'Use `gh copilot suggest` to ask how to list files sorted by date.',
                  verify: {
                    mode: 'shell',
                    custom: (r, input) => ({ ok: /gh\s+copilot\s+suggest/i.test(input) && (r.exitCode === 0 || r.stdout.length > 0), reason: 'use gh copilot suggest' })
                  },
                  hints: [
                    '`gh copilot suggest` takes a plain English description of what you want to do and generates the shell command for it. You describe the goal — Copilot writes the syntax.',
                    'Put your description in quotes after `gh copilot suggest`. Be specific about what you want.',
                    'Try: `gh copilot suggest "list files sorted by modification date"`'
                  ],
                  xp: 25
                }
              ]
            }
          ]
        },
        {
          id: 'c1-auth',
          narration: "Copilot is a paid GitHub feature tied to your account. `gh` needs to be authenticated — connected to your GitHub account — before Copilot can work. Check your authentication status now.",
          objective: 'Check GitHub CLI authentication status.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+auth/i.test(input) && (/github\.com|Logged in|not logged|status/i.test(r.stdout + r.stderr) || r.exitCode === 0), reason: 'check auth with gh auth status' })
          },
          hints: [
            'Copilot requires GitHub authentication to function — it is a paid feature tied to your GitHub account. `gh auth status` confirms whether you are logged in.',
            '`gh auth status` shows your current login state, which account is active, and what permissions your token has.',
            'Try: `gh auth status`'
          ],
          xp: 20
        },
        {
          id: 'c1-explain',
          narration: "`gh copilot explain` takes any shell command and explains it in plain English. This is how you learn what unfamiliar commands mean — no Stack Overflow required. Practice it on `ls -la`, a command every developer uses but beginners rarely understand fully.",
          objective: 'Use `gh copilot explain` to explain what `ls -la` does.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+copilot\s+explain/i.test(input) && (r.exitCode === 0 || r.stdout.length > 0), reason: 'use gh copilot explain' })
          },
          hints: [
            '`gh copilot explain` decodes any shell command into plain English. It breaks down each flag and argument so you understand exactly what the command does.',
            'Put the command in quotes after `gh copilot explain`. You can explain any command — simple or complex.',
            'Try: `gh copilot explain "ls -la"`'
          ],
          xp: 25
        }
      ]
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
          narration: "When you are on-call and something breaks at 3am, the first step is always: orient yourself. Where are you? What files are here? `ls -la` shows everything — including hidden files and their permissions. 3:17am. PagerDuty just woke you up. Physics engine crashed in production.",
          objective: 'List files in the current directory to orient yourself.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: r.stdout.length > 0 || r.exitCode === 0, reason: 'list directory contents' })
          },
          hints: [
            'When debugging, start by understanding your environment. List the directory to see what files are present — log files, config files, scripts — anything that might reveal the issue.',
            '`ls -la` shows all files including hidden ones (those starting with `.`), with permissions, owner, and sizes.',
            'Try: `ls -la`'
          ],
          xp: 10
        },
        {
          id: 'd1-gh-version',
          narration: "`gh copilot` is your debugging tool tonight. Before relying on any tool in a production incident, confirm it is installed and available. A version check takes one second and prevents a frustrating dead-end.",
          objective: 'Print the `gh` version to confirm it is installed.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+(--version|-v)/i.test(input) && (r.exitCode === 0 || /gh version/i.test(r.stdout)), reason: 'check gh version with gh --version' })
          },
          hints: [
            'Always confirm a tool is available before you need it in a critical moment. Checking the version takes one second.',
            'Most tools respond to `--version` with their version number. This confirms the tool is installed and shows which version you have.',
            'Try: `gh --version`'
          ],
          xp: 15
        },
        {
          id: 'd1-auth',
          narration: "Copilot requires a valid GitHub session. Checking auth before using it prevents a confusing authentication error in the middle of debugging a live production issue.",
          objective: 'Check your GitHub CLI authentication status.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+auth/i.test(input) && (/github\.com|Logged in|not logged/i.test(r.stdout + r.stderr) || r.exitCode === 0), reason: 'check auth with gh auth status' })
          },
          hints: [
            'Copilot requires GitHub authentication to work. Checking auth status takes 1 second — do it before you need it at 3:18am.',
            '`gh auth status` verifies your login state instantly.',
            'Try: `gh auth status`'
          ],
          xp: 15
        },
        {
          id: 'd1-branch',
          type: 'branch',
          narration: "Authenticated. The error is `Segmentation fault (core dumped)` from physics.js. Two things you could ask Copilot: explain the error, or explain the deploy script that triggered it.",
          branches: [
            {
              label: 'Explain the error message itself',
              flavor: 'Understand the crash before touching the code.',
              steps: [
                {
                  id: 'd1-b1-explain',
                  narration: "`gh copilot explain` can decode any error message into plain English. \"Segmentation fault (core dumped)\" is one of the most cryptic errors in programming — let Copilot translate it before you touch anything.",
                  objective: 'Use `gh copilot explain` to decode a segfault error message.',
                  verify: {
                    mode: 'shell',
                    custom: (r, input) => ({ ok: /gh\s+copilot\s+explain/i.test(input) && (r.exitCode === 0 || r.stdout.length > 0), reason: 'use gh copilot explain' })
                  },
                  hints: [
                    '`gh copilot explain` works on error messages too, not just commands. Paste in the error string and it will explain what it means in plain English.',
                    'Put the error message in quotes after `gh copilot explain`.',
                    'Try: `gh copilot explain "Segmentation fault (core dumped)"`'
                  ],
                  xp: 25
                }
              ]
            },
            {
              label: 'Explain the deploy script that triggered the crash',
              flavor: 'Find the cause at the deployment level.',
              steps: [
                {
                  id: 'd1-b2-deploy',
                  narration: "Sometimes the error is not the bug — it is the deploy command that exposed it. `gh copilot explain` works on deployment scripts just as well as error messages.",
                  objective: 'Use `gh copilot explain` to decode what the deploy script does.',
                  verify: {
                    mode: 'shell',
                    custom: (r, input) => ({ ok: /gh\s+copilot\s+explain/i.test(input) && (r.exitCode === 0 || r.stdout.length > 0), reason: 'use gh copilot explain' })
                  },
                  hints: [
                    '`gh copilot explain` can explain any shell command — including complex deployment scripts with many flags and arguments you may not recognize.',
                    'Put the command in quotes after `gh copilot explain`.',
                    'Try: `gh copilot explain "node --max-old-space-size=512 physics.js"`'
                  ],
                  xp: 25
                }
              ]
            }
          ]
        },
        {
          id: 'd1-suggest',
          narration: "You understand the crash now — it is a memory issue. `gh copilot suggest` can generate the right Node.js flag to fix it. Describe what you need in plain English and Copilot writes the command.",
          objective: 'Use `gh copilot suggest` to find the right Node.js memory flag.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+copilot\s+suggest/i.test(input) && (r.exitCode === 0 || r.stdout.length > 0), reason: 'use gh copilot suggest' })
          },
          hints: [
            '`gh copilot suggest` generates shell commands from natural language descriptions. You describe the goal — Copilot writes the exact syntax.',
            'Put your question in quotes after `gh copilot suggest`. Be specific about what you are trying to accomplish.',
            'Try: `gh copilot suggest "increase node.js memory limit when running a script"`'
          ],
          xp: 30
        },
        {
          id: 'd1-resolved',
          narration: "Copilot suggested `--max-old-space-size=4096`. You restart the service. Physics engine stabilizes. 4:03am. You solved a production incident at 3am without Stack Overflow — using `gh copilot explain` to understand the crash and `gh copilot suggest` to find the fix.",
          objective: 'Confirm your gh extension list one final time.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+extension\s+list/i.test(input) && r.exitCode === 0, reason: 'list extensions with gh extension list' })
          },
          hints: [
            'After resolving an incident, verify your tools are intact. A quick extension list confirms your setup is clean.',
            '`gh extension list` shows all installed gh extensions.',
            'Try: `gh extension list`'
          ],
          xp: 15
        }
      ]
    },

    // ── STORY 3: The New Hire's Secret Weapon ────────────────────────────────
    {
      id: 'new-hire-secret-weapon',
      title: "The New Hire's Secret Weapon",
      setting: "Week 1. Impossible ticket. Build a CLI pipeline in bash. You barely know bash.",
      art: HIRE_ART,
      steps: [
        {
          id: 'n1-orient',
          narration: "Week 1. Your tech lead drops Ticket #4471: 'Build a CLI pipeline: compress video assets, upload to S3, invalidate the CDN cache.' You have one day. You have never used the AWS CLI. You have never written a bash pipeline. But you have `gh copilot suggest` — and it knows every CLI tool.",
          objective: 'List the current directory to see what assets exist.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: r.stdout.length > 0 || r.exitCode === 0, reason: 'list directory contents' })
          },
          hints: [
            'Start every new task by understanding what you are working with. List the directory to see the files, assets, and scripts already present.',
            '`ls -la` shows all files including hidden ones, with sizes and permissions.',
            'Try: `ls -la`'
          ],
          xp: 10
        },
        {
          id: 'n1-check-gh',
          narration: "`gh copilot suggest` will write the bash commands for you — you just describe what you need in plain English. First confirm `gh` is installed and available.",
          objective: 'Print the `gh` CLI version.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+(--version|-v)/i.test(input) && (r.exitCode === 0 || /gh version/i.test(r.stdout)), reason: 'check gh version with gh --version' })
          },
          hints: [
            'Confirm a tool is installed before relying on it. This prevents a frustrating "command not found" error at a critical moment.',
            '`gh --version` prints the installed version and confirms `gh` is available.',
            'Try: `gh --version`'
          ],
          xp: 15
        },
        {
          id: 'n1-check-ext',
          narration: "Copilot is a `gh` extension — it is not built into `gh` by default. List your installed extensions to confirm it is ready.",
          objective: 'List installed `gh` extensions.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+extension\s+list/i.test(input) && r.exitCode === 0, reason: 'list extensions with gh extension list' })
          },
          hints: [
            '`gh` extensions are community-built plugins that add extra commands. Copilot is one of them. List your extensions to confirm it is installed.',
            '`gh extension list` shows all installed extensions.',
            'Try: `gh extension list`'
          ],
          xp: 15
        },
        {
          id: 'n1-help',
          narration: "Copilot has two key powers: `explain` for understanding commands you do not recognize, and `suggest` for generating commands from plain English. Read the help text to see the full interface before using it on the ticket.",
          objective: 'Print the gh copilot help text.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+copilot/i.test(input) && /--help/.test(input) && (/copilot|explain|suggest|Usage|Available/i.test(r.stdout + r.stderr) || r.exitCode === 0), reason: 'print help with gh copilot --help' })
          },
          hints: [
            'Reading help text before using a new tool takes 10 seconds and saves you 10 minutes of guessing. It shows you exactly what is available.',
            '`--help` prints the available subcommands and flags for any CLI tool.',
            'Try: `gh copilot --help`'
          ],
          xp: 15
        },
        {
          id: 'n1-auth',
          narration: "Copilot is a paid GitHub feature — it needs to know who you are. Confirm authentication is active before using it on the ticket.",
          objective: 'Confirm your GitHub CLI authentication status.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+auth/i.test(input) && (/github\.com|Logged in|not logged/i.test(r.stdout + r.stderr) || r.exitCode === 0), reason: 'check auth with gh auth status' })
          },
          hints: [
            'Copilot requires GitHub authentication to work. Check your status before starting — a missing auth token at a critical moment wastes time.',
            '`gh auth status` shows whether you are logged in and which account is active.',
            'Try: `gh auth status`'
          ],
          xp: 15
        },
        {
          id: 'n1-pipeline-branch',
          type: 'branch',
          narration: "The pipeline has two parts: compress the video assets, then upload to S3. Where do you start?",
          branches: [
            {
              label: 'Ask copilot to suggest a video compression command first',
              flavor: 'Compress before upload. Logical order.',
              steps: [
                {
                  id: 'n1-b1-compress',
                  narration: "You do not know the `ffmpeg` command for video compression. That is fine — describe what you need in plain English and `gh copilot suggest` will generate the command for you.",
                  objective: 'Use `gh copilot suggest` to generate a video compression command.',
                  verify: {
                    mode: 'shell',
                    custom: (r, input) => ({ ok: /gh\s+copilot\s+suggest/i.test(input) && (r.exitCode === 0 || r.stdout.length > 0), reason: 'use gh copilot suggest' })
                  },
                  hints: [
                    '`gh copilot suggest` generates shell commands from natural language. You describe what you want — Copilot writes the command. You do not need to know the syntax.',
                    'Put your description in quotes after `gh copilot suggest`. Be specific about the tool and output format.',
                    'Try: `gh copilot suggest "compress all mp4 files to 720p using ffmpeg"`'
                  ],
                  xp: 30
                }
              ]
            },
            {
              label: 'Ask copilot how to upload a directory to S3 first',
              flavor: 'Understand the destination before the pipeline.',
              steps: [
                {
                  id: 'n1-b2-s3',
                  narration: "You have never used the AWS CLI. `gh copilot suggest` knows it — describe what you need in plain English and it generates the exact command.",
                  objective: 'Use `gh copilot suggest` to generate an AWS S3 upload command.',
                  verify: {
                    mode: 'shell',
                    custom: (r, input) => ({ ok: /gh\s+copilot\s+suggest/i.test(input) && (r.exitCode === 0 || r.stdout.length > 0), reason: 'use gh copilot suggest' })
                  },
                  hints: [
                    '`gh copilot suggest` knows CLI tools like `aws`, `ffmpeg`, `kubectl`, and hundreds more. Describe your goal in plain English.',
                    'Put your question in quotes after `gh copilot suggest`.',
                    'Try: `gh copilot suggest "upload all files in a directory to S3 using aws cli"`'
                  ],
                  xp: 30
                }
              ]
            }
          ]
        },
        {
          id: 'n1-explain',
          narration: "Copilot gave you the command. Before shipping AI-generated code, make sure you understand what it does — you will need to explain it in code review. `gh copilot explain` breaks it down line by line.",
          objective: 'Use `gh copilot explain` to understand a command copilot suggested.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+copilot\s+explain/i.test(input) && (r.exitCode === 0 || r.stdout.length > 0), reason: 'use gh copilot explain' })
          },
          hints: [
            'Never ship code you do not understand — even if it was AI-generated. `gh copilot explain` breaks down any command into plain English so you can defend it in code review.',
            '`gh copilot explain` takes a command string in quotes and explains every flag and argument.',
            'Try: `gh copilot explain "aws s3 sync . s3://my-bucket"`'
          ],
          xp: 25
        },
        {
          id: 'n1-done',
          narration: "You shipped Ticket #4471 by end of day. Your tech lead asks: 'How did you do that so fast?' You say: 'I had help.' `gh copilot suggest` wrote the commands. `gh copilot explain` made sure you understood them.",
          objective: 'List your gh extensions one more time to confirm your setup.',
          verify: {
            mode: 'shell',
            custom: (r, input) => ({ ok: /gh\s+extension\s+list/i.test(input) && r.exitCode === 0, reason: 'list extensions with gh extension list' })
          },
          hints: [
            'Confirm your tools are in order. This is your setup now — `gh copilot` is your pair programmer.',
            '`gh extension list` shows all installed extensions.',
            'Try: `gh extension list`'
          ],
          xp: 20
        }
      ]
    }
  ]
};
