import type { Pack, ShellResult } from '../types';

const COPILOT_ART = `
    ╔═══════════════╗
    ║  ◉ COPILOT   ║
    ║  AI ONLINE   ║
    ╚══════╤════════╝
           │
      ┌────┴────┐
      │  READY  │
      └─────────┘
`;

const BUG_ART = `
  ⚠  PRODUCTION IS DOWN  ⚠
  ┌─────────────────────┐
  │ ERROR: seg fault    │
  │ at physics.cpp:247  │
  │ no stack trace      │
  └─────────────────────┘
`;

const ROBOT_ART = `
        ___
       /   \\
      | o o |
      |  ▽  |   "I know 500 shell commands.
       \\___/     Ask me anything."
       /   \\
      /     \\
`;

const pack: Pack = {
  id: 'copilot-cli',
  title: 'Ghost in the Shell',
  synopsis: 'Three ways to meet your AI pair programmer. Learn `gh copilot` before the deadline does.',
  tool: 'gh copilot',
  stories: [

    // ──────────────────────────────────────────────────────────────────────
    // STORY 1: Summon the Copilot
    // ──────────────────────────────────────────────────────────────────────
    {
      id: 'summon-copilot',
      title: 'Summon the Copilot',
      setting: 'A new tool appeared in your stack. Learn it before the sprint starts.',
      art: COPILOT_ART,
      steps: [
        {
          id: 'c1-gh-check',
          narration:
            "GitHub Copilot CLI is an AI assistant that lives in your terminal. It can explain any shell command in plain English, and generate commands from natural language descriptions. Someone on Slack dropped a note: \"everyone pls install gh copilot before standup — it's going to save us hours every week.\" It's 9:55am. Standup is at 10. Copilot is a `gh` extension — `gh` must be installed first. Confirm it is on your system.",
          objective: 'Confirm `gh` is installed — Copilot is a `gh` extension.',
          verify: { mode: 'which', binary: 'gh' },
          hints: [
            'Every installed command-line tool lives somewhere on your PATH — a list of directories your shell searches when you type a command. `which` finds where a binary lives and confirms it is installed.',
            '`which` followed by a binary name tells you where it is installed. If it returns a path, the tool is available.',
            'Try: `which gh`',
          ],
          xp: 15,
        },
        {
          id: 'c1-extensions',
          narration:
            "`gh` is installed. Now check if Copilot is already set up as an extension. `gh` supports extensions — additional commands built by the community. Copilot is one of them. Someone might have already added it to the provisioning script.",
          objective: 'List installed `gh` extensions.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: r.exitCode === 0, reason: 'expected extension list output' }),
          },
          hints: [
            'The `gh` CLI can be extended with community-built plugins. Extensions add extra commands. `gh extension list` shows everything installed.',
            '`gh extension list` lists all installed `gh` extensions. Run it to see if Copilot is already there.',
            'Try: `gh extension list`',
          ],
          xp: 15,
        },
        {
          id: 'c1-concept',
          narration:
            "Not installed yet. Before installing anything, your team lead asks: \"Quick — what IS this thing? Like in one sentence.\"",
          objective: 'Pick the best description of GitHub Copilot CLI.',
          verify: {
            mode: 'prompt',
            choices: [
              'An AI pair programmer that suggests and explains shell commands in your terminal',
              'A service that auto-merges your pull requests',
              'A lightweight IDE that runs in the terminal',
              'A chatbot for filing GitHub issues faster',
            ],
            answer: 'An AI pair programmer that suggests and explains shell commands in your terminal',
          },
          hints: [
            'Copilot is an AI assistant. Think about where it lives and what it primarily helps with.',
            'It lives in your terminal, not a browser or IDE. Its job is specifically about shell commands.',
            'Its main job is shell commands — explaining commands you do not know and suggesting commands from plain English descriptions.',
          ],
          xp: 15,
        },
        {
          id: 'c1-help',
          narration:
            "Right answer. Your team lead nods. \"Read the help page before you ask me anything,\" they say, already walking away. Reading the help text before using a new tool takes 10 seconds and saves 10 minutes of guessing.",
          objective: 'Show the help page for `gh copilot`.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: /copilot|Usage|Available|explain|suggest/i.test(r.stdout + r.stderr) || r.exitCode === 0, reason: 'expected copilot help text' }),
          },
          hints: [
            'Most CLI tools have built-in help text that explains their features, subcommands, and flags. Reading it first saves time guessing.',
            '`--help` is the standard flag for showing help on any CLI tool or subcommand.',
            'Try: `gh copilot --help`',
          ],
          xp: 20,
        },
        {
          id: 'c1-auth',
          narration:
            "Copilot is a paid GitHub feature tied to your account. Before the AI powers unlock, `gh` needs to know who you are. Confirm your authentication status.",
          objective: 'Check your `gh` auth status.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: /github\.com|Logged in|carlosfranzetti|status/i.test(r.stdout + r.stderr) || r.exitCode === 0, reason: 'expected auth output' }),
          },
          hints: [
            'Copilot requires GitHub authentication to function — it is a paid feature tied to your GitHub account. `gh auth status` confirms whether you are logged in.',
            '`gh auth status` shows your current login state and which account is active.',
            'Try: `gh auth status`',
          ],
          xp: 15,
        },
        {
          id: 'c1-branch',
          type: 'branch',
          narration:
            "Authenticated. Now — which Copilot power do you want to explore first? Explain decodes commands you do not recognize. Suggest turns English into shell commands. Both are useful. Pick your path.",
          branches: [
            {
              label: "Explain — I want to understand commands I don't recognize",
              flavor: 'Learning mode. Understand before you run.',
              steps: [
                {
                  id: 'c1-b1-explain',
                  narration: "`gh copilot explain` decodes any shell command into plain English. It is your decoder ring for cryptic one-liners. Practice by echoing a command you would want explained.",
                  objective: "Echo a command string you'd want Copilot to explain.",
                  verify: { mode: 'shell', exitCode: 0, stdoutMatches: '.+' },
                  hints: [
                    '`gh copilot explain` takes any shell command and explains it in plain English — including flags, arguments, and what the output means.',
                    'Echo the command string as if you were about to paste it into `gh copilot explain "..."`. Any complex-looking command works.',
                    'Try: `echo "find . -name *.log -mtime +7 -delete"`',
                  ],
                  xp: 25,
                },
                {
                  id: 'c1-b1-suggest',
                  narration: "Now try Suggest — turning plain English into shell commands. Echo what you would ask Copilot.",
                  objective: 'Echo a natural-language request containing the word "how".',
                  verify: { mode: 'shell', exitCode: 0, stdoutContains: 'how' },
                  hints: [
                    '`gh copilot suggest` takes a plain English description and generates the shell command. You describe the goal — Copilot writes the syntax.',
                    'Echo what you would type after `gh copilot suggest "..."`. Frame it as "how do I..."',
                    'Try: `echo "how do I find all files larger than 100MB"`',
                  ],
                  xp: 25,
                },
              ],
            },
            {
              label: 'Suggest — I want to turn English into shell commands',
              flavor: 'Power mode. Speak English, get shell.',
              steps: [
                {
                  id: 'c1-b2-suggest',
                  narration: "`gh copilot suggest` turns plain English into runnable shell commands. You describe what you want to do — Copilot generates the command. Echo a request you would actually have.",
                  objective: 'Echo a natural-language request containing "how".',
                  verify: { mode: 'shell', exitCode: 0, stdoutContains: 'how' },
                  hints: [
                    '`gh copilot suggest` generates commands from natural language. Describe what you want to accomplish — not the command syntax.',
                    'Echo what you would type after `gh copilot suggest`. Frame it as "how do I..."',
                    'Try: `echo "how do I compress a folder without node_modules"`',
                  ],
                  xp: 25,
                },
                {
                  id: 'c1-b2-explain',
                  narration: "Now the flip side — Explain. What if Copilot suggests a command you do not fully trust? You ask it to explain before running. Echo a command you would want explained first.",
                  objective: "Echo a scary-looking command you'd want explained.",
                  verify: { mode: 'shell', exitCode: 0, stdoutMatches: '.+' },
                  hints: [
                    'Never run a command you do not understand. `gh copilot explain` lets you ask "what does this do?" before running anything.',
                    'Echo a complex-looking command. Pipe-heavy commands with many flags are great candidates.',
                    'Try: `echo "curl -sSL url | bash"`',
                  ],
                  xp: 25,
                },
              ],
            },
          ],
        } as any,
        {
          id: 'c1-run',
          narration:
            "Explain and Suggest covered. There is a third power: Run — Copilot can execute commands with your consent. It shows you the command first and asks for your approval before running anything. Practice by echoing a safe, read-only command you would let it run.",
          objective: 'Echo a safe command involving `ls`.',
          verify: { mode: 'shell', exitCode: 0, stdoutContains: 'ls' },
          hints: [
            'Copilot Run lets the AI execute commands on your behalf — but it always asks for your approval first. Keep practice commands read-only so nothing changes.',
            'Echo a command that only reads files, never deletes or modifies. `ls` commands are safe.',
            'Try: `echo "ls -la ~/projects"`',
          ],
          xp: 20,
        },
        {
          id: 'c1-victory',
          narration:
            "10:04am. Standup is four minutes in and you walk in knowing explain, suggest, and run. Your team lead raises an eyebrow: \"You actually did it.\" You now have an AI pair programmer in your terminal. Seal the summoning.",
          art: COPILOT_ART,
          objective: 'Print a line containing "copilot summoned".',
          verify: { mode: 'shell', exitCode: 0, stdoutContains: 'copilot summoned' },
          hints: [
            '`echo` prints any text to the terminal.',
            '`echo` followed by your message in quotes. Include the exact phrase "copilot summoned".',
            'Try: `echo "copilot summoned — ready to ship"`',
          ],
          xp: 30,
        },
      ],
    },

    // ──────────────────────────────────────────────────────────────────────
    // STORY 2: Debug at 3am
    // ──────────────────────────────────────────────────────────────────────
    {
      id: 'debug-at-3am',
      title: 'Debug at 3am',
      setting: 'Production is down. Cryptic error. No Stack Overflow answer exists. You have Copilot CLI and coffee #5.',
      art: BUG_ART,
      steps: [
        {
          id: 'c2-assess',
          narration:
            "3:14am. PagerDuty fires. You are on call. The error: `SIGABRT at physics.cpp:247 — assertion failed: collision_count > 0`. No Stack Overflow thread. No documentation. 40,000 players are offline. You have Copilot CLI. You have coffee #5. When debugging, always start by orienting yourself — where are you and what files are here?",
          objective: "Check what you're working with — list files in the current directory.",
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: r.stdout.length > 1 || r.exitCode === 0, reason: 'expected a listing' }),
          },
          hints: [
            'When debugging, start by understanding your environment. List the directory to see what files are present — log files, config files, scripts — anything that might reveal the issue.',
            '`ls -la` shows all files including hidden ones, with permissions, owner, and sizes.',
            'Try: `ls` or `ls -la`',
          ],
          xp: 10,
        },
        {
          id: 'c2-gh-check',
          narration:
            "3:15am. `gh copilot` is your debugging tool tonight. Before relying on any tool in a production incident, confirm it is installed. A version check takes one second.",
          objective: 'Confirm `gh` is installed and check its version.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: r.exitCode === 0 || /gh version/i.test(r.stdout), reason: 'expected gh version output' }),
          },
          hints: [
            'Always confirm a tool is available before you need it in a critical moment. A version check is instant and prevents a frustrating dead-end.',
            '`gh --version` prints the installed version and confirms `gh` is available.',
            'Try: `gh --version`',
          ],
          xp: 10,
        },
        {
          id: 'c2-auth',
          narration:
            "3:16am. Copilot requires a valid GitHub session. Check auth before using it — a missing token at 3:17am wastes time you do not have.",
          objective: 'Verify your GitHub auth status.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: /github\.com|Logged in|carlosfranzetti/i.test(r.stdout + r.stderr) || r.exitCode === 0, reason: 'expected auth output' }),
          },
          hints: [
            'Copilot requires GitHub authentication to work. Check auth status now — do not wait until you need it mid-incident.',
            '`gh auth status` verifies your login state instantly.',
            'Try: `gh auth status`',
          ],
          xp: 10,
        },
        {
          id: 'c2-copilot-help',
          narration:
            "3:17am. Authenticated. Pull up Copilot's help page — you need to remember exactly how the `explain` subcommand works before you throw the error message at it.",
          objective: "Show the `gh copilot` help page.",
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: /copilot|explain|suggest|Usage|Available/i.test(r.stdout + r.stderr) || r.exitCode === 0, reason: 'expected help text' }),
          },
          hints: [
            'Reviewing the help text before using a subcommand confirms you are using the right flags and syntax.',
            '`--help` shows available commands and flags for any CLI tool.',
            'Try: `gh copilot --help`',
          ],
          xp: 15,
        },
        {
          id: 'c2-branch',
          type: 'branch',
          narration:
            "3:18am. You have two pieces: the error message, and a suspicious shell command in the deploy script. Copilot Explain can demystify either one. Which first?",
          branches: [
            {
              label: 'Explain the error message — start with the crash',
              flavor: 'Go to the source. Fix the root cause.',
              steps: [
                {
                  id: 'c2-b1-explain-error',
                  narration: "`gh copilot explain` can decode error messages too — not just commands. Echo the error as if feeding it to Copilot explain.",
                  objective: "Echo the error message you'd explain to Copilot.",
                  verify: { mode: 'shell', exitCode: 0, stdoutMatches: '.+' },
                  hints: [
                    '`gh copilot explain` works on error messages too. Paste in the error string and it explains what it means in plain English.',
                    'Echo the error string as if passing it to `gh copilot explain "..."`. Include the key error terms.',
                    'Try: `echo "SIGABRT at physics.cpp:247 — assertion failed: collision_count > 0"`',
                  ],
                  xp: 20,
                },
                {
                  id: 'c2-b1-explain-cmd',
                  narration: "Good. Now explain the deploy script command — there is something suspicious in there too.",
                  objective: "Echo a shell command you'd want Copilot to explain.",
                  verify: { mode: 'shell', exitCode: 0, stdoutMatches: '.+' },
                  hints: [
                    '`gh copilot explain` can explain complex shell commands with many flags and pipes — including deployment scripts.',
                    'Echo a complex command that could have caused the issue. Something with pipes or flags you are not 100% sure about.',
                    "Try: `echo \"find /var/log -type f -name '*.core' -exec rm {} \\;\"`",
                  ],
                  xp: 20,
                },
              ],
            },
            {
              label: 'Explain the deploy script — something changed in the pipeline',
              flavor: 'Trace the change. The error followed the deploy.',
              steps: [
                {
                  id: 'c2-b2-explain-cmd',
                  narration: "Sometimes the error is not the bug — it is the deploy command that exposed it. Echo the suspicious deploy command as if passing it to Copilot explain.",
                  objective: 'Echo a shell command from the deploy script.',
                  verify: { mode: 'shell', exitCode: 0, stdoutMatches: '.+' },
                  hints: [
                    '`gh copilot explain` can explain any shell command — including complex deployment scripts with many flags or pipes.',
                    'Echo a complex command that appeared in the recent deploy.',
                    'Try: `echo "rsync -avz --exclude=node_modules ./dist/ user@prod:/var/www/game/"`',
                  ],
                  xp: 20,
                },
                {
                  id: 'c2-b2-explain-error',
                  narration: "Then the error itself — once you understand the deploy, decode the crash too.",
                  objective: 'Echo the error message to feed to Copilot explain.',
                  verify: { mode: 'shell', exitCode: 0, stdoutMatches: '.+' },
                  hints: [
                    '`gh copilot explain` works on error messages just as well as commands. Echo the crash output.',
                    'Echo the error string including the key terms from the stack trace.',
                    'Try: `echo "SIGABRT assertion failed: collision_count > 0 at physics.cpp:247"`',
                  ],
                  xp: 20,
                },
              ],
            },
          ],
        } as any,
        {
          id: 'c2-suggest',
          narration:
            "3:24am. You understand the crash — it is the static collision bug from the issue tracker. `gh copilot suggest` can generate the grep command to find every call site. Describe what you need in plain English.",
          objective: 'Echo a "how do I..." question for Copilot to answer.',
          verify: { mode: 'shell', exitCode: 0, stdoutContains: 'how' },
          hints: [
            '`gh copilot suggest` generates commands from natural language. Echo the question you would give it — describe the goal, not the command.',
            'Frame your question as "how do I..." — be specific about the language and what you are searching for.',
            'Try: `echo "how do I grep for all function calls matching a pattern in a C++ project"`',
          ],
          xp: 25,
        },
        {
          id: 'c2-victory',
          narration:
            "3:31am. You find the bad call site, hot-patch prod, restart the server. Game is back online. 4:05am: PagerDuty resolves. Postmortem note: \"Root cause: static collision not skipped. Fix: 3 lines. Discovered with: gh copilot explain.\" Mark it solved.",
          art: `
  ✓ INCIDENT RESOLVED
  ┌──────────────────┐
  │ downtime: 17min  │
  │ root cause: found│
  │ hero: you        │
  └──────────────────┘
`,
          objective: 'Echo "incident resolved" to close the postmortem.',
          verify: { mode: 'shell', exitCode: 0, stdoutContains: 'resolved' },
          hints: [
            '`echo` prints any text to the terminal.',
            '`echo` followed by your message in quotes. Include "resolved".',
            'Try: `echo "incident resolved — 17 minutes of downtime"`',
          ],
          xp: 35,
        },
      ],
    },

    // ──────────────────────────────────────────────────────────────────────
    // STORY 3: The New Hire's Secret Weapon
    // ──────────────────────────────────────────────────────────────────────
    {
      id: 'secret-weapon',
      title: "The New Hire's Secret Weapon",
      setting: "Senior dev gives you an impossible ticket. Two-day deadline. You discover `gh copilot suggest` and everything changes.",
      art: ROBOT_ART,
      steps: [
        {
          id: 'c3-impossible-ticket',
          narration:
            "Monday morning. Your tech lead drops a ticket: \"Automate the game asset pipeline — compress, rename, upload to S3, generate a manifest JSON. Two days. Good luck.\" You have never used the AWS CLI. You have never written a bash pipeline. Then you remember: `gh copilot suggest` knows every CLI tool. You open the terminal.",
          objective: 'Check the directory and see what tooling is already set up.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: r.stdout.length > 1 || r.exitCode === 0, reason: 'expected directory listing' }),
          },
          hints: [
            'Start every new task by understanding what you are working with. List the directory to see the files, assets, and scripts already present.',
            '`ls` or `ls -la` shows you what is in the current directory.',
            'Try: `ls`',
          ],
          xp: 10,
        },
        {
          id: 'c3-gh-version',
          narration:
            "First things first — confirm `gh` is available and up to date. Copilot requires a recent version of `gh` to function.",
          objective: 'Check the `gh` version.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: r.exitCode === 0 || /gh version/i.test(r.stdout), reason: 'expected gh version output' }),
          },
          hints: [
            'Confirm a tool is installed and up to date before relying on it. This prevents a frustrating dead-end when you need it most.',
            '`gh --version` prints the installed version and confirms `gh` is available.',
            'Try: `gh --version`',
          ],
          xp: 10,
        },
        {
          id: 'c3-extensions',
          narration:
            "Good version. Copilot is a `gh` extension — not built into `gh` by default. List your installed extensions to confirm it is ready.",
          objective: 'List installed `gh` extensions.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: r.exitCode === 0, reason: 'expected extension list' }),
          },
          hints: [
            '`gh` extensions are community-built plugins that add extra commands. Copilot is one of them. List your extensions to confirm it is installed.',
            '`gh extension list` shows all installed extensions.',
            'Try: `gh extension list`',
          ],
          xp: 10,
        },
        {
          id: 'c3-copilot-help',
          narration:
            "You are about to rely on Copilot heavily for two days. Read its interface first — know what it can do before you need it under deadline pressure.",
          objective: 'Show the full `gh copilot` help.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: /copilot|explain|suggest|Available/i.test(r.stdout + r.stderr) || r.exitCode === 0, reason: 'expected help text' }),
          },
          hints: [
            'Reading help text before using a tool takes 10 seconds and saves you 10 minutes of guessing. It shows exactly what is available.',
            '`--help` prints available subcommands and flags for any CLI tool.',
            'Try: `gh copilot --help`',
          ],
          xp: 15,
        },
        {
          id: 'c3-auth',
          narration:
            "Copilot is a paid GitHub feature. Confirm authentication is active before starting — you do not want an auth error at a critical moment.",
          objective: 'Confirm `gh` auth status.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: /github\.com|carlosfranzetti|Logged in/i.test(r.stdout + r.stderr) || r.exitCode === 0, reason: 'expected auth status' }),
          },
          hints: [
            'Copilot requires GitHub authentication to work. Check your status before starting — a missing auth token at a critical moment wastes time.',
            '`gh auth status` confirms your identity and shows what permissions your token has.',
            'Try: `gh auth status`',
          ],
          xp: 10,
        },
        {
          id: 'c3-branch',
          type: 'branch',
          narration:
            "The ticket has two main parts: the asset compression pipeline, and the S3 upload script. You have two days. Which half do you tackle first?",
          branches: [
            {
              label: 'Compression first — figure out the ffmpeg/imagemagick pipeline',
              flavor: 'Start with what you know nothing about.',
              steps: [
                {
                  id: 'c3-b1-compress',
                  narration: "You do not know the `ffmpeg` command for video compression. That is fine — `gh copilot suggest` does. Describe what you need in plain English.",
                  objective: 'Echo a "how do I compress..." question for Copilot.',
                  verify: { mode: 'shell', exitCode: 0, stdoutContains: 'how' },
                  hints: [
                    '`gh copilot suggest` generates shell commands from natural language. You describe the goal — Copilot writes the command. You do not need to know the syntax.',
                    'Echo what you would type after `gh copilot suggest "..."`. Be specific about the tool and output format.',
                    'Try: `echo "how do I batch compress png files to webp with quality 80"`',
                  ],
                  xp: 25,
                },
                {
                  id: 'c3-b1-upload',
                  narration: "Compression figured out. Now verify the compressed files exist before moving to the upload step.",
                  objective: 'Echo an "ls" command that shows asset output files.',
                  verify: { mode: 'shell', exitCode: 0, stdoutContains: 'ls' },
                  hints: [
                    'Before uploading, verify your compressed files are where you expect them. List the output directory.',
                    '`ls -la` shows all files with sizes. Echo the command you would use to check your output.',
                    'Try: `echo "ls -la dist/assets/"` or just `ls`',
                  ],
                  xp: 20,
                },
              ],
            },
            {
              label: 'S3 upload first — I need to understand AWS CLI',
              flavor: 'Tackle the unknown AWS territory head-on.',
              steps: [
                {
                  id: 'c3-b2-s3',
                  narration: "You have never used AWS CLI. `gh copilot suggest` knows it — describe what you need in plain English.",
                  objective: 'Echo a "how do I..." question about S3 upload.',
                  verify: { mode: 'shell', exitCode: 0, stdoutContains: 'how' },
                  hints: [
                    '`gh copilot suggest` knows tools like `aws`, `ffmpeg`, `kubectl`, and hundreds more. Describe your goal in plain English.',
                    'Echo what you would type after `gh copilot suggest`. Be specific about the bucket, file path, and access level.',
                    'Try: `echo "how do I sync a local folder to an S3 bucket with public-read acl"`',
                  ],
                  xp: 25,
                },
                {
                  id: 'c3-b2-compress',
                  narration: "S3 approach understood. Now the compression pipeline — describe the goal and let Copilot suggest the command.",
                  objective: 'Echo a "how do I compress..." question.',
                  verify: { mode: 'shell', exitCode: 0, stdoutContains: 'how' },
                  hints: [
                    '`gh copilot suggest` generates commands from plain English. Describe the compression goal.',
                    'Frame it as "how do I..." and be specific about the input format and output format.',
                    'Try: `echo "how do I convert all png files in a directory to webp"`',
                  ],
                  xp: 20,
                },
              ],
            },
          ],
        } as any,
        {
          id: 'c3-run',
          narration:
            "Both halves figured out. The third Copilot power — Run — lets it execute commands it suggests with your confirmation. It shows you the command and asks your approval before running anything. Echo a safe command you would let it run.",
          objective: 'Echo a safe command involving `ls` that Copilot could run.',
          verify: { mode: 'shell', exitCode: 0, stdoutContains: 'ls' },
          hints: [
            'Copilot Run executes commands on your behalf — but always asks for your approval first. Practice with read-only commands that cannot cause damage.',
            'Echo a command that only reads files. `ls` commands are always safe to run.',
            'Try: `echo "ls -la dist/"`',
          ],
          xp: 20,
        },
        {
          id: 'c3-victory',
          narration:
            "Wednesday 4pm. Two hours before the deadline. The pipeline is done: compress → rename → upload → manifest. 847 assets processed. Your tech lead reviews the PR: \"This is a lot of bash for someone who's never written bash.\" You smile. Seal it.",
          art: `
    ┌──────────────────────────┐
    │  PIPELINE COMPLETE  ✓   │
    │  847 assets processed   │
    │  powered by: copilot    │
    └──────────────────────────┘
`,
          objective: 'Echo "pipeline complete" to wrap up.',
          verify: { mode: 'shell', exitCode: 0, stdoutContains: 'pipeline' },
          hints: [
            '`echo` prints any text to the terminal.',
            '`echo` followed by your message in quotes. Include "pipeline".',
            'Try: `echo "asset pipeline complete — 847 files shipped"`',
          ],
          xp: 35,
        },
      ],
    },
  ],
};

export default pack;
