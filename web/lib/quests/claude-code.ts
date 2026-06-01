import type { Pack } from '../types';

const pack: Pack = {
  id: 'claude-code',
  order: 5,
  title: 'Ghost Protocol',
  synopsis: 'Shell access on an unknown machine. Use Claude Code to map its capabilities.',
  tool: 'claude',
  stories: [
    {
      id: 'zero-day',
      title: 'Zero Day',
      setting: 'Unknown machine. Shell access confirmed. Capabilities: unknown.',
      steps: [
        {
          id: 'confirm-claude',
          narration:
            'Shell access: confirmed. Now — what do you have to work with?\n\n  Your primary asset is Claude Code: an AI coding assistant that runs directly in your terminal. You give it a task in plain English and it writes the code, edits files, and runs commands. No IDE required. No Stack Overflow. Just describe what you need.\n\n  First confirm it\'s on this machine. The `which` command locates an executable in your PATH. If Claude Code is here, `which claude` will print its path.',
          objective: 'Run `which claude` to confirm Claude Code is available.',
          verify: { mode: 'which', binary: 'claude' },
          hints: [
            '`which` searches your PATH for an executable and prints its location.',
            'You\'re looking for the `claude` binary — the Claude Code CLI.',
            'Run exactly: `which claude`',
          ],
          xp: 20,
        },
        {
          id: 'check-version',
          narration:
            'Asset confirmed. Before you deploy any tool, you want its version — version numbers tell you what capabilities are available and whether you\'re running a stable build.\n\n  Most CLI tools accept a `--version` flag that prints their version number. Check it.',
          objective: 'Run `claude --version` to check which version is installed.',
          verify: {
            mode: 'shell',
            custom: ({ stdout, stderr, exitCode }, input) => {
              if (!/\bclaude\b/.test(input)) return { ok: false, reason: 'use the `claude` command' };
              if (!/(--version|-v)\b/.test(input)) return { ok: false, reason: 'add the --version flag' };
              if (exitCode !== 0) return { ok: false, reason: stderr || 'claude --version failed' };
              if (!stdout.trim()) return { ok: false, reason: 'no version output — try: claude --version' };
              return { ok: true };
            },
          },
          hints: [
            'Most CLI tools accept a `--version` flag that prints their version number.',
            'You already confirmed `claude` is installed. Now ask it for its version.',
            'Run exactly: `claude --version`',
          ],
          xp: 15,
        },
        {
          id: 'create-recon-dir',
          narration:
            'Good. You know your tool. Now set up your workspace.\n\n  Professional operators don\'t work in the root directory — too visible, too messy. Create a project directory: a contained space where your tools and output live, separate from everything else.\n\n  Call it `recon`. That\'s what it is.',
          objective: 'Run `mkdir recon` to create your operational workspace.',
          verify: {
            mode: 'shell',
            custom: ({ stdout, stderr, exitCode }, input) => {
              if (!/\bmkdir\b/.test(input)) return { ok: false, reason: 'use mkdir to create the directory' };
              if (!/recon/.test(input)) return { ok: false, reason: 'name the directory `recon`' };
              if (exitCode !== 0) return { ok: false, reason: stderr || 'mkdir failed' };
              return { ok: true };
            },
          },
          hints: [
            '`mkdir` creates a new directory. Give it a path and it builds the folder.',
            'Create your workspace: mkdir recon',
            'Run exactly: `mkdir recon`',
          ],
          xp: 15,
        },
        {
          id: 'brief-claude',
          narration:
            'Workspace ready.\n\n  In the real terminal, this is where you\'d run `claude` inside the recon directory and describe your task in plain English:\n\n  > "Write a shell script called pathscan.sh that finds and lists all executable commands available in my $PATH, sorted alphabetically."\n\n  Claude Code reads the context, writes the script, and saves it — all from that description. No code required from you.\n\n  For this simulation, create the script manually using output redirection.',
          objective: 'Run `echo "#!/bin/bash" > recon/pathscan.sh` to create the scanner script.',
          verify: {
            mode: 'shell',
            custom: ({ stdout, stderr, exitCode }, input) => {
              if (!/>/.test(input)) return { ok: false, reason: 'use > to write to a file' };
              if (!/pathscan/.test(input)) return { ok: false, reason: 'name the file pathscan.sh' };
              if (!/recon/.test(input)) return { ok: false, reason: 'save it inside the recon directory' };
              if (exitCode !== 0) return { ok: false, reason: stderr || 'command failed — did you create the recon directory first?' };
              return { ok: true };
            },
          },
          hints: [
            '`echo "text" > file` writes text into a file using output redirection.',
            'Create the script in your recon directory: echo "#!/bin/bash" > recon/pathscan.sh',
            'Run exactly: `echo "#!/bin/bash" > recon/pathscan.sh`',
          ],
          xp: 40,
        },
        {
          id: 'make-executable',
          narration:
            'Script created. But a file isn\'t executable until you say so.\n\n  On Unix systems, every file has permissions — who can read it, write to it, or run it. A new script starts as plain text. To run it as a program, you have to flip the execute bit.\n\n  `chmod +x` adds execute permission to a file. Think of it as loading a weapon: the script exists, but this command makes it fire.',
          objective: 'Run `chmod +x recon/pathscan.sh` to make the script executable.',
          verify: {
            mode: 'shell',
            custom: ({ stdout, stderr, exitCode }, input) => {
              if (!/\bchmod\b/.test(input)) return { ok: false, reason: 'use chmod to set permissions' };
              if (!/\+x/.test(input)) return { ok: false, reason: 'use +x to add execute permission' };
              if (!/pathscan/.test(input)) return { ok: false, reason: 'point chmod at recon/pathscan.sh' };
              if (exitCode !== 0) return { ok: false, reason: stderr || 'chmod failed' };
              return { ok: true };
            },
          },
          hints: [
            '`chmod` changes file permissions. `+x` adds the execute permission for everyone.',
            'Make the script runnable: chmod +x recon/pathscan.sh',
            'Run exactly: `chmod +x recon/pathscan.sh`',
          ],
          xp: 25,
        },
        {
          id: 'run-scanner',
          narration:
            'Permission granted. Fire it.\n\n  `bash` runs a shell script. Pipe the output through `head -20` to see just the first twenty results — enough to confirm it\'s working and see the most interesting entries.\n\n  The `|` pipe passes one command\'s output as input to the next command. It\'s how Unix commands chain together.',
          objective: 'Run `bash recon/pathscan.sh | head -20` to execute the scanner and preview results.',
          verify: {
            mode: 'shell',
            custom: ({ stdout, stderr, exitCode }, input) => {
              if (!/pathscan/.test(input)) return { ok: false, reason: 'run your pathscan.sh script' };
              if (!/bash|sh/.test(input)) return { ok: false, reason: 'use bash to run the script' };
              if (exitCode !== 0) return { ok: false, reason: stderr || 'script failed — check if the file exists' };
              if (!stdout.trim()) return { ok: false, reason: 'no output — the script may need adjustments' };
              return { ok: true };
            },
          },
          hints: [
            'Run the script with bash, then pipe through head: bash recon/pathscan.sh | head -20',
            'The `|` pipe passes the script\'s output to `head -20` which shows just the first 20 lines.',
            'Run exactly: `bash recon/pathscan.sh | head -20`',
          ],
          xp: 40,
        },
        {
          type: 'branch',
          id: 'endgame',
          narration: 'There it is. Every tool available on this machine, mapped in seconds.\n\n  You built a recon tool from scratch using nothing but a natural language description. That\'s the Claude Code workflow: describe, generate, execute.\n\n  Now: what do you do with it?',
          branches: [
            {
              label: 'Save the full report',
              flavor: 'Exfiltrate the complete capability map. Document everything.',
              steps: [
                {
                  id: 'save-report',
                  narration: 'The smart play. Raw recon data is only useful if you can reference it later — or send it somewhere.\n\n  Output redirection with `>` writes a command\'s output to a file instead of the screen. Run the scanner and redirect everything into a file. You\'ll have a permanent record of this machine\'s capabilities.',
                  objective: 'Run `bash recon/pathscan.sh > recon/capability-report.txt` to save the full output.',
                  verify: {
                    mode: 'shell',
                    custom: ({ stdout, stderr, exitCode }, input) => {
                      if (!/pathscan/.test(input)) return { ok: false, reason: 'run pathscan.sh and redirect its output' };
                      if (!/>/.test(input)) return { ok: false, reason: 'use `>` to redirect the output to a file' };
                      if (exitCode !== 0) return { ok: false, reason: stderr || 'command failed' };
                      return { ok: true };
                    },
                  },
                  hints: [
                    '`>` redirects stdout to a file. Format: command > output-file.txt',
                    'Run pathscan.sh and save to recon/capability-report.txt',
                    'Run exactly: `bash recon/pathscan.sh > recon/capability-report.txt`',
                  ],
                  xp: 35,
                },
                {
                  id: 'verify-report',
                  narration: 'Report saved. Verify the data before declaring success.\n\n  `wc -l` — word count, line mode — counts the lines in your report. One line per command. The number tells you the attack surface.\n\n  **GHOST PROTOCOL — STATUS: COMPLETE. CAPABILITY MAP EXFILTRATED.**',
                  objective: 'Run `wc -l recon/capability-report.txt` to count the tools discovered.',
                  verify: {
                    mode: 'shell',
                    custom: ({ stdout, exitCode }, input) => {
                      if (!/\bwc\b/.test(input)) return { ok: false, reason: 'use wc to count lines in the report' };
                      if (exitCode !== 0) return { ok: false, reason: 'wc failed — does the report file exist?' };
                      if (!stdout.trim()) return { ok: false, reason: 'no output — check the file path' };
                      return { ok: true };
                    },
                  },
                  hints: [
                    '`wc -l` counts the number of lines in a file. Each line = one tool in your report.',
                    'Point it at your capability report: wc -l recon/capability-report.txt',
                    'Run exactly: `wc -l recon/capability-report.txt`',
                  ],
                  xp: 30,
                },
              ],
            },
            {
              label: 'Go deeper — hunt specific tools',
              flavor: 'You know what you\'re looking for. Filter the noise.',
              steps: [
                {
                  id: 'grep-scan',
                  narration: 'Raw data is noise. A professional knows what they\'re hunting.\n\n  `grep` filters output by pattern — it shows only lines that match what you\'re looking for. Pipe your scanner output through `grep` and you can search hundreds of tools in milliseconds.\n\n  Filter for interpreters — the tools that let you run code in any language.',
                  objective: 'Run `bash recon/pathscan.sh | grep "node\\|python\\|ruby"` to filter for interpreters.',
                  verify: {
                    mode: 'shell',
                    custom: ({ stdout, stderr, exitCode }, input) => {
                      if (!/pathscan/.test(input)) return { ok: false, reason: 'run pathscan.sh and pipe through grep' };
                      if (!/\bgrep\b/.test(input)) return { ok: false, reason: 'use grep to filter the output' };
                      if (exitCode !== 0 && exitCode !== 1) return { ok: false, reason: stderr || 'command failed' };
                      return { ok: true };
                    },
                  },
                  hints: [
                    '`grep` filters output to matching lines. Pipe the scanner into grep.',
                    'Filter for interpreters: bash recon/pathscan.sh | grep "node"',
                    'Run: `bash recon/pathscan.sh | grep "node\\|python\\|ruby"`',
                  ],
                  xp: 35,
                },
                {
                  id: 'deep-exit',
                  narration: 'There they are. Every interpreter, every language runtime, every tool left installed and forgotten.\n\n  Each one is a vector. Each one is an option.\n\n  You close the session. You save the command to your notes. You\'ll be back — and now you know exactly what you\'re walking into.\n\n  **GHOST PROTOCOL — STATUS: COMPLETE. DEEP RECON CONFIRMED.**',
                  objective: 'Run `bash recon/pathscan.sh | wc -l` to count the total tools on this machine.',
                  verify: {
                    mode: 'shell',
                    custom: ({ stdout, exitCode }, input) => {
                      if (!/pathscan/.test(input)) return { ok: false, reason: 'run pathscan.sh to get the count' };
                      if (!/\bwc\b/.test(input)) return { ok: false, reason: 'pipe through wc -l to count the results' };
                      if (exitCode !== 0) return { ok: false, reason: 'command failed' };
                      if (!stdout.trim()) return { ok: false, reason: 'no output — check the command' };
                      return { ok: true };
                    },
                  },
                  hints: [
                    '`wc -l` counts lines. Pipe the scanner output into it to get a total.',
                    'Count all available tools: bash recon/pathscan.sh | wc -l',
                    'Run exactly: `bash recon/pathscan.sh | wc -l`',
                  ],
                  xp: 30,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default pack;
