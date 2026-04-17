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
            "Someone on your team dropped a note in Slack: \"everyone pls install gh copilot before standup, it's going to save us hours every week.\" It's 9:55am. Standup is at 10. You open the terminal.",
          objective: 'Confirm `gh` is installed — Copilot is a `gh` extension.',
          verify: { mode: 'which', binary: 'gh' },
          hints: ['Copilot is a `gh` extension, so `gh` needs to be installed first.', 'Your shell can tell you where a binary lives.', 'Try: `which gh`'],
          xp: 15,
        },
        {
          id: 'c1-extensions',
          narration:
            "Good — `gh` is there. Now check if Copilot is already installed as an extension. Someone might have added it to the provisioning script.",
          objective: 'List installed `gh` extensions.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: (r: ShellResult) => ({ ok: r.exitCode === 0, reason: 'expected extension list output' }),
          },
          hints: ['`gh extension list` shows installed extensions.', 'Run it to see if Copilot is already there.', 'Try: `gh extension list`'],
          xp: 15,
        },
        {
          id: 'c1-concept',
          narration:
            "Not installed yet. Before you install anything, your team lead pops up: \"Quick — what IS this thing? Like in one sentence.\"",
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
          hints: ['Copilot is an AI.', 'It lives in your terminal, not a browser or IDE.', 'Its main job is shell commands — explaining and suggesting them.'],
          xp: 15,
        },
        {
          id: 'c1-help',
          narration:
            "Right answer. Your team lead nods. \"Read the help page before you ask me anything,\" they say, already walking away. Fair enough.",
          objective: 'Show the help page for `gh copilot`.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: (r: ShellResult) => ({ ok: /copilot|Usage|Available|explain|suggest/i.test(r.stdout + r.stderr), reason: 'expected copilot help text' }),
          },
          hints: ['Every `gh` subcommand responds to `--help`.', 'The subcommand is `gh copilot`.', 'Try: `gh copilot --help`'],
          xp: 20,
        },
        {
          id: 'c1-auth',
          narration:
            "explain, suggest, run — three superpowers. Before you unlock them, Copilot needs to know who you are. Confirm your auth status.",
          objective: 'Check your `gh` auth status.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: /github\.com|Logged in|carlosfranzetti|status/i.test(r.stdout + r.stderr), reason: 'expected auth output' }),
          },
          hints: ['`gh auth` is the subcommand family for authentication.', 'Check your status before trying to use any extensions.', 'Try: `gh auth status`'],
          xp: 15,
        },
        {
          id: 'c1-branch',
          type: 'branch',
          narration:
            "Authenticated. Now — which Copilot power do you want to explore first? Explain lets you understand a scary command. Suggest turns English into shell commands. Both are useful. Pick your path.",
          branches: [
            {
              label: 'Explain — I want to understand commands I don\'t recognize',
              flavor: 'Learning mode. Understand before you run.',
              steps: [
                {
                  id: 'c1-b1-explain',
                  narration: "Smart choice. Copilot Explain is your decoder ring for cryptic shell one-liners. Practice by echoing a command you'd want explained.",
                  objective: 'Echo a command string you\'d want Copilot to explain.',
                  verify: { mode: 'shell', exitCode: 0, stdoutMatches: '.+' },
                  hints: ['Pretend you\'re about to run `gh copilot explain "..."`.', 'Echo the command you would paste in.', 'Try: `echo "find . -name *.log -mtime +7 -delete"`'],
                  xp: 25,
                },
                {
                  id: 'c1-b1-suggest',
                  narration: "Now try Suggest — turn a plain English request into a shell command by echoing what you'd ask Copilot.",
                  objective: 'Echo a natural-language request containing the word "how".',
                  verify: { mode: 'shell', exitCode: 0, stdoutContains: 'how' },
                  hints: ['Write what you\'d type after `gh copilot suggest`.', 'Include "how do I..." or similar.', 'Try: `echo "how do I find all files larger than 100MB"`'],
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
                  narration: "Copilot Suggest turns plain English into runnable shell commands. Practice by echoing a request you'd actually have.",
                  objective: 'Echo a natural-language request containing "how".',
                  verify: { mode: 'shell', exitCode: 0, stdoutContains: 'how' },
                  hints: ['Echo what you\'d type after `gh copilot suggest`.', 'Frame it as a question: "how do I..."', 'Try: `echo "how do I compress a folder without node_modules"`'],
                  xp: 25,
                },
                {
                  id: 'c1-b2-explain',
                  narration: "Now the flip side — Explain. What if Copilot gives you a command and you don't fully trust it? Echo a command you'd want explained first.",
                  objective: 'Echo a scary-looking command you\'d want explained.',
                  verify: { mode: 'shell', exitCode: 0, stdoutMatches: '.+' },
                  hints: ['Echo a shell command that looks complex.', 'Pipe-heavy commands are great candidates.', 'Try: `echo "curl -sSL url | bash"`'],
                  xp: 25,
                },
              ],
            },
          ],
        } as any,
        {
          id: 'c1-run',
          narration:
            "Explain and Suggest covered. The third power is Run — Copilot executes commands with your consent. Practice by echoing a safe, read-only command you'd let it run.",
          objective: 'Echo a safe command involving `ls`.',
          verify: { mode: 'shell', exitCode: 0, stdoutContains: 'ls' },
          hints: ['Keep it read-only — nothing destructive.', 'Something with `ls` is perfect.', 'Try: `echo "ls -la ~/projects"`'],
          xp: 20,
        },
        {
          id: 'c1-victory',
          narration:
            "10:04am. Standup is four minutes in and you walk in knowing explain, suggest, and run. Your team lead raises an eyebrow: \"You actually did it.\" Seal the summoning.",
          art: COPILOT_ART,
          objective: 'Print a line containing "copilot summoned".',
          verify: { mode: 'shell', exitCode: 0, stdoutContains: 'copilot summoned' },
          hints: ['Use `echo`.', 'Include the exact phrase "copilot summoned".', 'Try: `echo "copilot summoned — ready to ship"`'],
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
            "3:14am. PagerDuty fires. You're on call. The error: `SIGABRT at physics.cpp:247 — assertion failed: collision_count > 0`. No Stack Overflow thread. No documentation. The game is down for 40,000 players. You have Copilot CLI. You have coffee #5. Let's go.",
          objective: 'Check what you\'re working with — list files in the current directory.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: (r: ShellResult) => ({ ok: r.stdout.length > 1 || r.exitCode === 0, reason: 'expected a listing' }),
          },
          hints: ['`ls` shows you what\'s in the current directory.', 'Start by orienting yourself.', 'Try: `ls` or `ls -la`'],
          xp: 10,
        },
        {
          id: 'c2-gh-check',
          narration:
            "3:15am. Files are here. Is `gh` installed? You're going to need Copilot to decode this error.",
          objective: 'Confirm `gh` is installed and check its version.',
          verify: { mode: 'shell', exitCode: 0, stdoutMatches: 'gh version' },
          hints: ['`gh --version` prints the installed version.', 'You need gh to use Copilot.', 'Try: `gh --version`'],
          xp: 10,
        },
        {
          id: 'c2-auth',
          narration:
            "3:16am. Installed. But are you authenticated? Copilot won't work for an anonymous user.",
          objective: 'Verify your GitHub auth status.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: /github\.com|Logged in|carlosfranzetti/i.test(r.stdout + r.stderr), reason: 'expected auth output' }),
          },
          hints: ['`gh auth status` shows your login state.', 'If you\'re not logged in, Copilot won\'t activate.', 'Try: `gh auth status`'],
          xp: 10,
        },
        {
          id: 'c2-copilot-help',
          narration:
            "3:17am. Authenticated. Pull up Copilot\'s help page — you need to remember exactly how the `explain` subcommand works before you throw the error at it.",
          objective: 'Show the `gh copilot` help page.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: (r: ShellResult) => ({ ok: /copilot|explain|suggest|Usage|Available/i.test(r.stdout + r.stderr), reason: 'expected help text' }),
          },
          hints: ['Use `--help` to see available commands.', 'The command is `gh copilot`.', 'Try: `gh copilot --help`'],
          xp: 15,
        },
        {
          id: 'c2-branch',
          type: 'branch',
          narration:
            "3:18am. You have two pieces of the puzzle: the error message, and a suspicious shell command in the deploy script. Copilot Explain can demystify either one. Which first?",
          branches: [
            {
              label: 'Explain the error message — start with the crash',
              flavor: 'Go to the source. Fix the root cause.',
              steps: [
                {
                  id: 'c2-b1-explain-error',
                  narration: "Echo the error as if feeding it to `gh copilot explain`. This is how you'd ask Copilot to decode a crash.",
                  objective: 'Echo the error message you\'d explain to Copilot.',
                  verify: { mode: 'shell', exitCode: 0, stdoutMatches: '.+' },
                  hints: ['Echo the error string as if passing it to Copilot explain.', 'Include the assertion failure text.', 'Try: `echo "SIGABRT at physics.cpp:247 — assertion failed: collision_count > 0"`'],
                  xp: 20,
                },
                {
                  id: 'c2-b1-explain-cmd',
                  narration: "Good. Now explain the deploy script command — there's something suspicious in there.",
                  objective: 'Echo a shell command you\'d want Copilot to explain.',
                  verify: { mode: 'shell', exitCode: 0, stdoutMatches: '.+' },
                  hints: ['Echo a complex command that could have caused the issue.', 'Something with pipes or flags you\'re not 100% sure about.', 'Try: `echo "find /var/log -type f -name \'*.core\' -exec rm {} \\;"`'],
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
                  narration: "Echo the suspicious deploy command. This is what `gh copilot explain` was built for.",
                  objective: 'Echo a shell command from the deploy script.',
                  verify: { mode: 'shell', exitCode: 0, stdoutMatches: '.+' },
                  hints: ['Echo a complex command that appeared in the deploy.', 'Something with multiple flags or pipes.', 'Try: `echo "rsync -avz --exclude=node_modules ./dist/ user@prod:/var/www/game/"`'],
                  xp: 20,
                },
                {
                  id: 'c2-b2-explain-error',
                  narration: "Then the error itself — once you understand the deploy, you need to decode the crash.",
                  objective: 'Echo the error message to feed to Copilot explain.',
                  verify: { mode: 'shell', exitCode: 0, stdoutMatches: '.+' },
                  hints: ['Echo the crash output as a string.', 'Include the key error terms.', 'Try: `echo "SIGABRT assertion failed: collision_count > 0 at physics.cpp:247"`'],
                  xp: 20,
                },
              ],
            },
          ],
        } as any,
        {
          id: 'c2-suggest',
          narration:
            "3:24am. You have the decoded error — it's the same static collision bug from the issue tracker. Copilot can suggest the grep command to find every place in the codebase that triggers the assertion. Echo what you'd ask.",
          objective: 'Echo a "how do I..." question for Copilot to answer.',
          verify: { mode: 'shell', exitCode: 0, stdoutContains: 'how' },
          hints: ['Write the English question you\'d give `gh copilot suggest`.', 'Frame it as "how do I..."', 'Try: `echo "how do I grep for all function calls matching a pattern in a C++ project"`'],
          xp: 25,
        },
        {
          id: 'c2-victory',
          narration:
            "3:31am. You find the bad call site, hot-patch the binary on prod, restart the server. Game is back online. 4:05am: PagerDuty resolves. You write the postmortem in your notes: \"Root cause: static collision not skipped. Fix: 3 lines. Discovered with: gh copilot explain.\" Mark it solved.",
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
          hints: ['Use `echo`.', 'Include "resolved".', 'Try: `echo "incident resolved — 17 minutes of downtime"`'],
          xp: 35,
        },
      ],
    },

    // ──────────────────────────────────────────────────────────────────────
    // STORY 3: The New Hire's Secret Weapon
    // ──────────────────────────────────────────────────────────────────────
    {
      id: 'secret-weapon',
      title: 'The New Hire\'s Secret Weapon',
      setting: 'Senior dev gives you an impossible ticket. Two-day deadline. You discover `gh copilot suggest` and everything changes.',
      art: ROBOT_ART,
      steps: [
        {
          id: 'c3-impossible-ticket',
          narration:
            "Monday morning. Your tech lead drops a ticket in your queue: \"Automate the game asset pipeline — compress, rename, upload to S3, generate a manifest JSON. Two days. Good luck.\" You've never used the AWS CLI. You've never written a bash pipeline. You've never automated anything more complex than an alias. Then you remember: someone installed `gh copilot` last week. You open the terminal.",
          objective: 'Check the directory and see what tooling is already set up.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: (r: ShellResult) => ({ ok: r.stdout.length > 1 || r.exitCode === 0, reason: 'expected directory listing' }),
          },
          hints: ['Start by seeing what\'s in the project.', '`ls` or `ls -la` shows you what you\'re working with.', 'Try: `ls`'],
          xp: 10,
        },
        {
          id: 'c3-gh-version',
          narration:
            "Files are there. First things first — confirm `gh` is available and up to date. Copilot needs a recent version.",
          objective: 'Check the `gh` version.',
          verify: { mode: 'shell', exitCode: 0, stdoutMatches: 'gh version' },
          hints: ['`gh --version` shows the installed version.', 'You want a recent build for Copilot to work.', 'Try: `gh --version`'],
          xp: 10,
        },
        {
          id: 'c3-extensions',
          narration:
            "Good version. See if Copilot is installed — or if you need to install it first.",
          objective: 'List installed `gh` extensions.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: (r: ShellResult) => ({ ok: r.exitCode === 0, reason: 'expected extension list' }),
          },
          hints: ['`gh extension list` shows what\'s installed.', 'Run it to see if copilot is already available.', 'Try: `gh extension list`'],
          xp: 10,
        },
        {
          id: 'c3-copilot-help',
          narration:
            "Time to actually read Copilot\'s interface. You\'re about to lean on this thing heavily for the next two days. Know what it can do.",
          objective: 'Show the full `gh copilot` help.',
          verify: {
            mode: 'shell', exitCode: 0,
            custom: (r: ShellResult) => ({ ok: /copilot|explain|suggest|Available/i.test(r.stdout + r.stderr), reason: 'expected help text' }),
          },
          hints: ['Every subcommand responds to `--help`.', 'Run it on `gh copilot`.', 'Try: `gh copilot --help`'],
          xp: 15,
        },
        {
          id: 'c3-auth',
          narration:
            "explain, suggest, run. Those three commands are your entire toolkit for the next two days. Confirm you\'re authenticated so none of this breaks at a critical moment.",
          objective: 'Confirm `gh` auth status.',
          verify: {
            mode: 'shell',
            custom: (r: ShellResult) => ({ ok: /github\.com|carlosfranzetti|Logged in/i.test(r.stdout + r.stderr), reason: 'expected auth status' }),
          },
          hints: ['`gh auth status` confirms your identity.', 'Do this before starting any real work.', 'Try: `gh auth status`'],
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
                  narration: "You know assets need to be compressed. You don't know the commands. Time to ask Copilot. Echo what you'd type into `suggest`.",
                  objective: 'Echo a "how do I compress..." question for Copilot.',
                  verify: { mode: 'shell', exitCode: 0, stdoutContains: 'how' },
                  hints: ['Frame your question as "how do I..." for Copilot suggest.', 'Ask about compressing game assets specifically.', 'Try: `echo "how do I batch compress png files to webp with quality 80"`'],
                  xp: 25,
                },
                {
                  id: 'c3-b1-upload',
                  narration: "Compression figured out. Now the S3 upload. Echo the question you'd give Copilot for this part.",
                  objective: 'Echo an "ls" command that shows asset output files.',
                  verify: { mode: 'shell', exitCode: 0, stdoutContains: 'ls' },
                  hints: ['Before uploading, verify your compressed files are there.', 'Use `ls` on the output directory.', 'Try: `echo "ls -la dist/assets/"` or just `ls`'],
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
                  narration: "You've never used AWS CLI. This is where Copilot earns its keep. Echo the question you'd ask `suggest`.",
                  objective: 'Echo a "how do I..." question about S3 upload.',
                  verify: { mode: 'shell', exitCode: 0, stdoutContains: 'how' },
                  hints: ['Ask Copilot how to upload files to S3.', 'Be specific — bucket name, file path, public access.', 'Try: `echo "how do I sync a local folder to an S3 bucket with public-read acl"`'],
                  xp: 25,
                },
                {
                  id: 'c3-b2-compress',
                  narration: "S3 approach understood. Now the compression pipeline. Echo the question you'd feed Copilot for batch image conversion.",
                  objective: 'Echo a "how do I compress..." question.',
                  verify: { mode: 'shell', exitCode: 0, stdoutContains: 'how' },
                  hints: ['Ask Copilot about batch image compression.', 'Frame it as "how do I..."', 'Try: `echo "how do I convert all png files in a directory to webp"`'],
                  xp: 20,
                },
              ],
            },
          ],
        } as any,
        {
          id: 'c3-run',
          narration:
            "Both halves figured out. The third Copilot power — Run — lets it execute commands it suggests, with your confirmation. Practice: echo a safe command you'd let it run autonomously.",
          objective: 'Echo a safe command involving `ls` that Copilot could run.',
          verify: { mode: 'shell', exitCode: 0, stdoutContains: 'ls' },
          hints: ['Keep it read-only — something safe to run automatically.', 'Copilot asks for your OK before running anything.', 'Try: `echo "ls -la dist/"`'],
          xp: 20,
        },
        {
          id: 'c3-victory',
          narration:
            "Wednesday 4pm. Two hours before the deadline. The pipeline is done: compress → rename → upload → manifest. 847 assets processed. Your tech lead reviews the PR and writes: \"This is a lot of bash for someone who's never written bash.\" You smile. Seal it.",
          art: `
    ┌──────────────────────────┐
    │  PIPELINE COMPLETE  ✓   │
    │  847 assets processed   │
    │  powered by: copilot    │
    └──────────────────────────┘
`,
          objective: 'Echo "pipeline complete" to wrap up.',
          verify: { mode: 'shell', exitCode: 0, stdoutContains: 'pipeline' },
          hints: ['Use `echo`.', 'Include "pipeline".', 'Try: `echo "asset pipeline complete — 847 files shipped"`'],
          xp: 35,
        },
      ],
    },
  ],
};

export default pack;
