// Ghost Protocol — Claude Code quest
// Theme: black-hat hacker mapping a target machine's capabilities using Claude Code
// Teaches: claude CLI, project setup, prompting Claude to write code, chmod, shell pipes
// Two endings: save the report vs. go deeper with grep

export default {
  order: 5,
  id: 'claude-code',
  title: 'Ghost Protocol',
  synopsis: 'You\'re in. Root shell on an unknown machine. You need to know what weapons are available before you make your next move. Your tool: Claude Code — an AI that writes software on command. Your mission: build a recon tool that maps every CLI available in this machine\'s PATH.',
  tool: 'claude',
  stories: [
    {
      id: 'zero-day',
      title: 'Zero Day',
      setting: 'Unknown machine. Shell access confirmed. Capabilities: unknown. Time to find out what you\'re working with.',
      steps: [
        {
          id: 'confirm-claude',
          narration: 'Shell access: confirmed. Now — what do you have to work with?\n\n  Your primary asset is Claude Code: an AI coding assistant that runs directly in your terminal. You give it a task in plain English and it writes the code, edits files, and runs commands. No IDE required. No Stack Overflow. Just describe what you need.\n\n  But first — is it even installed on this machine? The `which` command locates an executable in your PATH. If Claude Code is here, `which claude` will print its path. If it\'s not, you\'ll need to find another way in.',
          objective: 'Run `which claude` to confirm Claude Code is available on this machine.',
          verify: {
            mode: 'which',
            binary: 'claude',
          },
          hints: [
            '`which` searches your PATH for an executable and prints its location. If it finds nothing, the tool isn\'t installed.',
            'You\'re looking for the `claude` binary — the Claude Code CLI.',
            'Run exactly: `which claude`',
          ],
          xp: 20,
        },
        {
          id: 'check-version',
          narration: 'Asset confirmed. Claude Code is on this machine.\n\n  Before you deploy any tool, you want its version — version numbers tell you what capabilities are available, whether you\'re running a stable build, and whether the operator was careless enough to leave an outdated install running.\n\n  Check it. Know exactly what version of the weapon you\'re holding.',
          objective: 'Run `claude --version` to check which version of Claude Code is installed.',
          verify: {
            mode: 'shell',
            command: 'claude --version',
            custom: ({ stdout, stderr, exitCode }, input) => {
              if (!/\bclaude\b/.test(input)) return { ok: false, reason: 'use the `claude` command' };
              if (!/(--version|-v)\b/.test(input)) return { ok: false, reason: 'add the --version flag' };
              if (exitCode !== 0) return { ok: false, reason: stderr || 'claude --version failed' };
              if (!stdout.trim()) return { ok: false, reason: 'no version output — try claude --version' };
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
          narration: 'Good. You know your tool. Now set up your workspace.\n\n  Professional operators don\'t work in the root of their home directory — too visible, too messy. You create a project directory: a contained space where your tools and output live, separate from everything else.\n\n  Call it `recon`. That\'s what it is.',
          objective: 'Run `mkdir ~/recon` to create your operational workspace.',
          verify: {
            mode: 'shell',
            command: 'ls ~',
            custom: ({ stdout, exitCode }, input) => {
              if (!/\bmkdir\b/.test(input)) return { ok: false, reason: 'use mkdir to create the directory' };
              if (!/recon/.test(input)) return { ok: false, reason: 'name the directory `recon`' };
              if (exitCode !== 0) return { ok: false, reason: 'mkdir failed — the directory may already exist, try: rm -rf ~/recon && mkdir ~/recon' };
              return { ok: true };
            },
          },
          hints: [
            '`mkdir` creates a new directory. Give it a path and it builds the folder.',
            'Create your workspace in your home directory: mkdir ~/recon',
            'Run exactly: `mkdir ~/recon`',
          ],
          xp: 15,
        },
        {
          id: 'brief-claude',
          narration: 'Workspace ready. Time to deploy the asset.\n\n  Claude Code works like this: you run `claude` in a directory and describe what you want built. It reads the context, writes the code, and saves the file — all without you writing a single line.\n\n  Your task: ask Claude to build a shell script called `pathscan.sh` that lists every command available in your `$PATH`. The `$PATH` is the list of directories the shell searches when you type a command — mapping it reveals every weapon on this machine.\n\n  Navigate into your recon directory, start Claude, and brief it:\n\n  > "Write a shell script called pathscan.sh that finds and lists all executable commands available in my $PATH, sorted alphabetically."\n\n  Claude will write the script and save it. When it\'s done, type `/exit` or `Ctrl+C` to return to your normal shell.',
          objective: 'Use Claude Code to create `pathscan.sh` in ~/recon — then verify it exists by running `ls ~/recon`.',
          verify: {
            mode: 'shell',
            command: 'ls ~/recon',
            custom: ({ stdout, exitCode }, input) => {
              if (exitCode !== 0) return { ok: false, reason: 'ls ~/recon failed — did you create the directory?' };
              const files = stdout.trim().split('\n').map(f => f.trim()).filter(Boolean);
              const hasScript = files.some(f => f.includes('pathscan') || f.endsWith('.sh') || f.endsWith('.py') || f.endsWith('.js'));
              if (!hasScript) return { ok: false, reason: 'no script found in ~/recon yet — run `claude` in that directory and ask it to write pathscan.sh' };
              return { ok: true };
            },
          },
          hints: [
            'Navigate into your workspace first: `cd ~/recon`, then run `claude` to start a session.',
            'Inside Claude Code, describe your task clearly: "Write a shell script called pathscan.sh that lists all executable commands in my $PATH." Claude will write and save the file.',
            'After Claude creates the file, exit with `/exit` or Ctrl+C, then run `ls ~/recon` to confirm the script is there.',
          ],
          xp: 50,
        },
        {
          id: 'make-executable',
          narration: 'Script confirmed. But a file isn\'t a weapon until it\'s executable.\n\n  On Unix systems, every file has permissions — who can read it, write to it, or run it. A new script starts as a plain text file. To run it as a program, you have to flip the execute bit.\n\n  `chmod +x` adds execute permission to a file. Think of it as loading a weapon: the script exists, but this command makes it fire.',
          objective: 'Run `chmod +x ~/recon/pathscan.sh` to make the script executable.',
          verify: {
            mode: 'shell',
            command: 'ls -al ~/recon',
            custom: ({ stdout, exitCode }, input) => {
              if (!/\bchmod\b/.test(input)) return { ok: false, reason: 'use chmod to set permissions' };
              if (!/\+x/.test(input)) return { ok: false, reason: 'use +x to add execute permission' };
              if (exitCode !== 0) return { ok: false, reason: 'chmod failed' };
              const hasExecutable = stdout.split('\n').some(line => /^-[r-][w-]x/.test(line.trim()));
              if (!hasExecutable) return { ok: false, reason: 'file doesn\'t appear executable — check the path in your chmod command' };
              return { ok: true };
            },
          },
          hints: [
            '`chmod` changes file permissions. `+x` adds the execute permission for everyone.',
            'Point it at the script Claude just created: chmod +x ~/recon/pathscan.sh',
            'Run exactly: `chmod +x ~/recon/pathscan.sh`',
          ],
          xp: 25,
        },
        {
          id: 'run-scanner',
          narration: 'Permission granted. Weapon loaded. Fire it.\n\n  Run the scanner. You\'ll get a list — potentially hundreds of commands. Everything installed on this machine. Every tool, every interpreter, every utility the operator left exposed.\n\n  Pipe the output through `head -20` to see just the first twenty results — enough to confirm it\'s working and spot the most interesting entries at a glance.',
          objective: 'Run `bash ~/recon/pathscan.sh | head -20` to execute the scanner and preview results.',
          verify: {
            mode: 'shell',
            command: 'bash ~/recon/pathscan.sh | head -20',
            custom: ({ stdout, stderr, exitCode }, input) => {
              if (!/pathscan/.test(input) && !/(bash|sh|python|node)/.test(input)) return { ok: false, reason: 'run your pathscan.sh script' };
              if (exitCode !== 0) return { ok: false, reason: stderr || 'script failed — check if the file exists and is executable' };
              if (!stdout.trim()) return { ok: false, reason: 'no output — the script may need adjustments. Try opening claude again and asking it to fix the script.' };
              const hasPathEntry = stdout.split('\n').some(line => line.trim().length > 0);
              if (!hasPathEntry) return { ok: false, reason: 'output looks empty — the script may not be scanning correctly' };
              return { ok: true };
            },
          },
          hints: [
            'Run the script with bash, then pipe through head to limit output: bash ~/recon/pathscan.sh | head -20',
            'The `|` pipe passes the script\'s output to `head -20` which shows just the first 20 lines.',
            'Run exactly: `bash ~/recon/pathscan.sh | head -20`',
          ],
          xp: 40,
        },
        {
          type: 'branch',
          id: 'endgame',
          narration: 'There it is. Dozens — maybe hundreds — of available commands. The machine\'s full capability profile, mapped in seconds.\n\n  You built a recon tool from scratch using nothing but a natural language description. That\'s the Claude Code workflow: describe, generate, execute.\n\n  Now: what do you do with it?',
          branches: [
            {
              label: 'Save the full report',
              flavor: 'Exfiltrate the complete capability map. Document everything.',
              steps: [
                {
                  id: 'save-report',
                  narration: 'The smart play. Raw recon data is only useful if you can reference it later — or send it somewhere.\n\n  Output redirection with `>` writes a command\'s output to a file instead of the screen. Run the scanner and redirect everything into a file. You\'ll have a permanent record of this machine\'s capabilities.\n\n  The `>` operator overwrites. The `>>` operator appends. Use `>` to create a clean report.',
                  objective: 'Run `bash ~/recon/pathscan.sh > ~/recon/capability-report.txt` to save the full output.',
                  verify: {
                    mode: 'shell',
                    command: 'ls ~/recon',
                    custom: ({ stdout, exitCode }, input) => {
                      if (!/pathscan/.test(input)) return { ok: false, reason: 'run pathscan.sh and redirect its output' };
                      if (!/>/.test(input)) return { ok: false, reason: 'use `>` to redirect the output to a file' };
                      if (exitCode !== 0) return { ok: false, reason: 'command failed' };
                      if (!stdout.includes('capability-report') && !stdout.includes('.txt')) return { ok: false, reason: 'output file not found in ~/recon — check your redirection syntax' };
                      return { ok: true };
                    },
                  },
                  hints: [
                    '`>` redirects stdout to a file. Format: command > output-file.txt',
                    'Run pathscan.sh and save to ~/recon/capability-report.txt',
                    'Run exactly: `bash ~/recon/pathscan.sh > ~/recon/capability-report.txt`',
                  ],
                  xp: 35,
                },
                {
                  id: 'verify-report',
                  narration: 'Report saved. But a good operative verifies their data before declaring success.\n\n  How many tools did you find? Use `wc -l` — word count, line mode — to count the lines in your report. One line per command. The number tells you the attack surface.\n\n  **GHOST PROTOCOL — STATUS: COMPLETE. CAPABILITY MAP EXFILTRATED.**',
                  objective: 'Run `wc -l ~/recon/capability-report.txt` to count the tools discovered.',
                  verify: {
                    mode: 'shell',
                    command: 'wc -l ~/recon/capability-report.txt',
                    custom: ({ stdout, exitCode }, input) => {
                      if (!/\bwc\b/.test(input)) return { ok: false, reason: 'use wc to count lines in the report' };
                      if (exitCode !== 0) return { ok: false, reason: 'wc failed — does the report file exist?' };
                      if (!stdout.trim()) return { ok: false, reason: 'no output — check the file path' };
                      return { ok: true };
                    },
                  },
                  hints: [
                    '`wc -l` counts the number of lines in a file. Each line = one tool in your report.',
                    'Point it at your capability report.',
                    'Run exactly: `wc -l ~/recon/capability-report.txt`',
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
                  narration: 'Raw data is noise. A professional knows what they\'re hunting.\n\n  `grep` filters output by pattern — it shows only lines that match what you\'re looking for. Pipe your scanner output through `grep` and you can search hundreds of tools in milliseconds.\n\n  What are you looking for? Network tools. Scripting interpreters. Package managers. Anything that extends your reach on this machine.\n\n  Try filtering for Python, Node, Ruby, or any interpreter you want to exploit.',
                  objective: 'Run `bash ~/recon/pathscan.sh | grep -i "python\\|node\\|ruby\\|perl"` to filter for interpreters.',
                  verify: {
                    mode: 'shell',
                    command: 'bash ~/recon/pathscan.sh | grep -i "python"',
                    custom: ({ stdout, stderr, exitCode }, input) => {
                      if (!/pathscan/.test(input) && !/(bash|sh)/.test(input)) return { ok: false, reason: 'run pathscan.sh and pipe through grep' };
                      if (!/\bgrep\b/.test(input)) return { ok: false, reason: 'use grep to filter the output' };
                      if (exitCode !== 0 && exitCode !== 1) return { ok: false, reason: stderr || 'command failed' };
                      return { ok: true };
                    },
                  },
                  hints: [
                    '`grep -i` searches case-insensitively. Use `|` to pipe scanner output into grep.',
                    'Try filtering for common interpreters: python, node, ruby. The `\\|` inside grep means "or".',
                    'Run: `bash ~/recon/pathscan.sh | grep -i "python\\|node\\|ruby\\|perl"`',
                  ],
                  xp: 35,
                },
                {
                  id: 'deep-exit',
                  narration: 'There they are. Every interpreter, every language runtime, every tool the operator left installed and forgot about.\n\n  Each one is a vector. Each one is an option.\n\n  You close Claude Code. You save the command to your notes. You\'ll be back — and now you know exactly what you\'re walking into.\n\n  **GHOST PROTOCOL — STATUS: COMPLETE. DEEP RECON CONFIRMED.**',
                  objective: 'Run `bash ~/recon/pathscan.sh | wc -l` to count the total tools on this machine.',
                  verify: {
                    mode: 'shell',
                    command: 'bash ~/recon/pathscan.sh | wc -l',
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
                    'bash ~/recon/pathscan.sh | wc -l',
                    'Run exactly: `bash ~/recon/pathscan.sh | wc -l`',
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
