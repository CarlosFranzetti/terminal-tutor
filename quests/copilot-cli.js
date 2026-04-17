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
          narration: "Standup in 20 minutes. Someone on Slack just asked: 'Does anyone know that AI terminal thing?' You do not know that AI terminal thing. Yet. First question: is `gh` even on this machine?",
          objective: 'Confirm the `gh` binary is on your PATH.',
          verify: { mode: 'which', binary: 'gh' },
          hints: ['You need to know if `gh` is installed.', 'Your shell can tell you where a binary lives.', 'Try: `which gh`'],
          xp: 15
        },
        {
          id: 'c1-extension-list',
          narration: '`gh` is installed. Now check if the copilot extension is already set up.',
          objective: 'List the installed `gh` extensions to check for copilot.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: r => ({ ok: r.exitCode === 0, reason: 'expected extension list output' })
          },
          hints: ['`gh extension` manages extensions.', 'The subcommand to see what is installed is `list`.', 'Try: `gh extension list`'],
          xp: 20
        },
        {
          id: 'c1-concept',
          type: 'branch',
          narration: 'Copilot extension is listed. Two ways to find out what it does: ask it to explain itself, or just try a suggestion.',
          branches: [
            {
              label: 'Ask gh copilot to explain what it does',
              flavor: 'Learn the theory first.',
              steps: [
                {
                  id: 'c1-b1-help',
                  narration: "Good instinct. Check the help text before diving in.",
                  objective: 'Print the gh copilot help output.',
                  verify: {
                    mode: 'shell',
                    custom: r => ({ ok: /copilot|explain|suggest|Usage|Available/i.test(r.stdout + r.stderr), reason: 'expected copilot help text' })
                  },
                  hints: ['`gh copilot` has a help flag.', 'Most CLIs respond to `--help`.', 'Try: `gh copilot --help`'],
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
                  narration: "Learn by firing. Use `gh copilot suggest` on a real-world need.",
                  objective: 'Use `gh copilot suggest` to ask how to list files sorted by date.',
                  verify: {
                    mode: 'shell',
                    custom: r => ({ ok: r.exitCode === 0 || r.stdout.length > 0, reason: 'expected copilot suggest output' })
                  },
                  hints: ['`gh copilot suggest` takes a natural language question.', 'Put the question in quotes.', 'Try: `gh copilot suggest "list files sorted by modification date"`'],
                  xp: 25
                }
              ]
            }
          ]
        },
        {
          id: 'c1-auth',
          narration: "Now check your auth status. Copilot requires GitHub authentication.",
          objective: 'Check GitHub CLI authentication status.',
          verify: {
            mode: 'shell',
            custom: r => ({ ok: /github\.com|Logged in|not logged|status/i.test(r.stdout + r.stderr), reason: 'expected auth output' })
          },
          hints: ['`gh auth` manages authentication.', 'Try: `gh auth status`'],
          xp: 20
        },
        {
          id: 'c1-explain',
          narration: "Auth good. Use `gh copilot explain` on something people always Google.",
          objective: 'Use `gh copilot explain` to explain what `ls -la` does.',
          verify: {
            mode: 'shell',
            custom: r => ({ ok: r.exitCode === 0 || r.stdout.length > 0, reason: 'expected explanation output' })
          },
          hints: ['`gh copilot explain` takes a command and explains it.', 'Put the command in quotes.', 'Try: `gh copilot explain "ls -la"`'],
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
          narration: "3:17am. PagerDuty just woke you up. The physics engine crashed in production. The error: `Segmentation fault (core dumped)` — which tells you everything and nothing.",
          objective: 'List files in the current directory to orient yourself.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: r => ({ ok: r.stdout.length > 0 || r.exitCode === 0, reason: 'expected directory listing' })
          },
          hints: ['See what files are in the current directory.', 'Try: `ls -la`'],
          xp: 10
        },
        {
          id: 'd1-gh-version',
          narration: "`gh` is your lifeline right now. Confirm it is installed.",
          objective: 'Print the `gh` version to confirm it is installed.',
          verify: { mode: 'shell', exitCode: 0, stdoutMatches: 'gh version' },
          hints: ['Most CLIs support a version flag.', 'Try: `gh --version`'],
          xp: 15
        },
        {
          id: 'd1-auth',
          narration: "Version checks out. Confirm you are authenticated before using copilot.",
          objective: 'Check your GitHub CLI authentication status.',
          verify: {
            mode: 'shell',
            custom: r => ({ ok: /github\.com|Logged in|not logged/i.test(r.stdout + r.stderr), reason: 'expected auth output' })
          },
          hints: ['Try: `gh auth status`'],
          xp: 15
        },
        {
          id: 'd1-branch',
          type: 'branch',
          narration: "Authenticated. The error is `Segmentation fault (core dumped)` from physics.js. Two things you could ask copilot: explain the error, or explain the deploy script that triggered it.",
          branches: [
            {
              label: 'Explain the error message itself',
              flavor: 'Understand the crash before touching the code.',
              steps: [
                {
                  id: 'd1-b1-explain',
                  narration: "Understand what you are dealing with before you touch anything.",
                  objective: 'Use `gh copilot explain` to decode a segfault error message.',
                  verify: {
                    mode: 'shell',
                    custom: r => ({ ok: r.exitCode === 0 || r.stdout.length > 0, reason: 'expected explanation' })
                  },
                  hints: ['`gh copilot explain` decodes commands and errors.', 'Try: `gh copilot explain "Segmentation fault (core dumped)"`'],
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
                  narration: "Sometimes the error is not the bug — it is the deploy command that exposed it.",
                  objective: 'Use `gh copilot explain` to decode what the deploy script does.',
                  verify: {
                    mode: 'shell',
                    custom: r => ({ ok: r.exitCode === 0 || r.stdout.length > 0, reason: 'expected explanation' })
                  },
                  hints: ['`gh copilot explain` works on any command.', 'Try: `gh copilot explain "node --max-old-space-size=512 physics.js"`'],
                  xp: 25
                }
              ]
            }
          ]
        },
        {
          id: 'd1-suggest',
          narration: "You understand the crash now — it is a memory issue. Ask copilot to suggest the right Node.js flag to increase the memory limit.",
          objective: 'Use `gh copilot suggest` to find the right Node.js memory flag.',
          verify: {
            mode: 'shell',
            custom: r => ({ ok: r.exitCode === 0 || r.stdout.length > 0, reason: 'expected suggestion output' })
          },
          hints: ['`gh copilot suggest` takes a natural-language question.', 'Try: `gh copilot suggest "increase node.js memory limit when running a script"`'],
          xp: 30
        },
        {
          id: 'd1-resolved',
          narration: "Copilot suggested `--max-old-space-size=4096`. You restart the service. Physics engine stabilizes. 4:03am. You did it without Stack Overflow.",
          objective: 'Confirm your gh extension list one final time.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: r => ({ ok: r.exitCode === 0, reason: 'expected extension list' })
          },
          hints: ['Try: `gh extension list`'],
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
          narration: "Week 1. Your tech lead drops Ticket #4471: 'Build a CLI pipeline: compress video assets, upload to S3, invalidate the CDN cache.' You have one day. Your secret weapon: `gh copilot suggest`.",
          objective: 'List the current directory to see what assets exist.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: r => ({ ok: r.stdout.length > 0 || r.exitCode === 0, reason: 'expected directory listing' })
          },
          hints: ['Start by seeing what you are working with.', 'Try: `ls -la`'],
          xp: 10
        },
        {
          id: 'n1-check-gh',
          narration: "Your secret weapon: `gh copilot suggest` can write bash commands for you. First — confirm `gh` is installed.",
          objective: 'Print the `gh` CLI version.',
          verify: { mode: 'shell', exitCode: 0, stdoutMatches: 'gh version' },
          hints: ['Try: `gh --version`'],
          xp: 15
        },
        {
          id: 'n1-check-ext',
          narration: "Good. Confirm the copilot extension is installed.",
          objective: 'List installed `gh` extensions.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: r => ({ ok: r.exitCode === 0, reason: 'expected extension list' })
          },
          hints: ['Try: `gh extension list`'],
          xp: 15
        },
        {
          id: 'n1-help',
          narration: "Copilot is there. Know what you are asking: `explain` for understanding, `suggest` for command generation.",
          objective: 'Print the gh copilot help text.',
          verify: {
            mode: 'shell',
            custom: r => ({ ok: /copilot|explain|suggest|Usage|Available/i.test(r.stdout + r.stderr), reason: 'expected help text' })
          },
          hints: ['Try: `gh copilot --help`'],
          xp: 15
        },
        {
          id: 'n1-auth',
          narration: "Read the manual. Now: are you authenticated?",
          objective: 'Confirm your GitHub CLI authentication status.',
          verify: {
            mode: 'shell',
            custom: r => ({ ok: /github\.com|Logged in|not logged/i.test(r.stdout + r.stderr), reason: 'expected auth status' })
          },
          hints: ['Try: `gh auth status`'],
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
                  narration: "Compress first, upload second. Ask copilot for the ffmpeg command.",
                  objective: 'Use `gh copilot suggest` to generate a video compression command.',
                  verify: {
                    mode: 'shell',
                    custom: r => ({ ok: r.exitCode === 0 || r.stdout.length > 0, reason: 'expected suggestion output' })
                  },
                  hints: ['`gh copilot suggest` takes a natural language question.', 'Try: `gh copilot suggest "compress all mp4 files to 720p using ffmpeg"`'],
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
                  narration: "Start with the destination. Once you know how to upload, the compression step becomes clear.",
                  objective: 'Use `gh copilot suggest` to generate an AWS S3 upload command.',
                  verify: {
                    mode: 'shell',
                    custom: r => ({ ok: r.exitCode === 0 || r.stdout.length > 0, reason: 'expected suggestion output' })
                  },
                  hints: ['`gh copilot suggest` takes a natural language question.', 'Try: `gh copilot suggest "upload all files in a directory to S3 using aws cli"`'],
                  xp: 30
                }
              ]
            }
          ]
        },
        {
          id: 'n1-explain',
          narration: "Copilot gave you the command. Before shipping AI-generated code, make sure you can explain it in code review.",
          objective: 'Use `gh copilot explain` to understand a command copilot suggested.',
          verify: {
            mode: 'shell',
            custom: r => ({ ok: r.exitCode === 0 || r.stdout.length > 0, reason: 'expected explanation output' })
          },
          hints: ['`gh copilot explain` breaks down any command.', 'Try: `gh copilot explain "aws s3 sync . s3://my-bucket"`'],
          xp: 25
        },
        {
          id: 'n1-done',
          narration: "You shipped Ticket #4471 by end of day. Your tech lead asks: 'How did you do that so fast?' You say: 'I had help.'",
          objective: 'List your gh extensions one more time to confirm your setup.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: r => ({ ok: r.exitCode === 0, reason: 'expected extension list' })
          },
          hints: ['Try: `gh extension list`'],
          xp: 20
        }
      ]
    }
  ]
};
