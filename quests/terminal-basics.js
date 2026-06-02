// Operation: Nightfall — Terminal Basics quest
// Teaches: ls, ls -al, mkdir, cp, cat, up-arrow, tab completion
// Three branching endings via nested binary branches.

export default {
  order: 1,
  id: 'terminal-basics',
  title: 'Operation: Nightfall',
  synopsis: 'You\'re Agent Zero — ghost operative, zero digital footprint. You have shell access to a target workstation and four minutes to find the intel, extract it, and vanish. The terminal is your only weapon.',
  tool: 'terminal',
  stories: [
    {
      id: 'the-extraction',
      title: 'The Extraction',
      setting: 'A live workstation. Cursor blinking. Clock running. You\'ve got the shell — now work it.',
      steps: [
        {
          id: 'survey',
          narration: 'The screen flickers as your connection stabilises. You\'re in. Shell access confirmed.\n\n  The terminal is a text interface to your computer — no icons, no menus, just commands and results. Every file, every folder, every secret lives somewhere in this system. Your first move: figure out where you are and what\'s around you.\n\n  `ls` lists the contents of a directory. It\'s the most fundamental command in the terminal — a quick scan of your surroundings. Run it on your home directory to see what you\'re working with.',
          objective: 'Run `ls ~` to list the contents of your home directory.',
          verify: {
            mode: 'shell',
            command: 'ls ~',
            custom: ({ stdout, stderr, exitCode }, input) => {
              if (!/\bls\b/.test(input)) return { ok: false, reason: 'use the `ls` command' };
              if (exitCode !== 0) return { ok: false, reason: stderr || 'ls returned an error' };
              if (!stdout.trim()) return { ok: false, reason: 'directory appears empty — try ls ~' };
              return { ok: true };
            },
          },
          hints: [
            '`ls` stands for "list" — it shows you the files and folders in a directory.',
            'Your home directory is represented by `~`. Try combining them: `ls ~`',
            'Run exactly: `ls ~`',
          ],
          solution: 'ls ~',
          xp: 20,
        },
        {
          id: 'deep-scan',
          narration: 'A list of folders. Ordinary. Too ordinary. Your contact said the intel would be hidden — something the user wouldn\'t want visible on a normal scan.\n\n  Every Unix system has hidden files: files whose names start with a dot (`.bashrc`, `.ssh`, `.config`). A plain `ls` skips them entirely. To see everything — including what someone tried to hide — you need two flags:\n\n  `-a` reveals all files, including hidden ones.\n  `-l` shows the long format: permissions, owner, size, last modified.\n\n  Together, `ls -al` is a full intelligence sweep. Nothing stays hidden.',
          objective: 'Run `ls -al ~` to reveal all files — including hidden ones — with full details.',
          verify: {
            mode: 'shell',
            command: 'ls -al ~',
            custom: ({ stdout, stderr, exitCode }, input) => {
              if (!/\bls\b/.test(input)) return { ok: false, reason: 'use the `ls` command' };
              if (!/-a/.test(input) && !/-la/.test(input) && !/-al/.test(input)) return { ok: false, reason: 'add the -a flag to show hidden files' };
              if (!/-l/.test(input) && !/-la/.test(input) && !/-al/.test(input)) return { ok: false, reason: 'add the -l flag for long format' };
              if (exitCode !== 0) return { ok: false, reason: stderr || 'command failed' };
              const hasDotFiles = stdout.split('\n').some(line => /\s\.\w/.test(line));
              if (!hasDotFiles) return { ok: false, reason: 'try ls -al ~ to include hidden files' };
              return { ok: true };
            },
          },
          hints: [
            'Flags modify how a command behaves. `ls -a` shows hidden files (names starting with `.`). `ls -l` shows a detailed list with permissions and sizes.',
            'You can combine flags: `ls -al` is the same as `ls -a -l`. Point it at your home directory.',
            'Run exactly: `ls -al ~`',
          ],
          solution: 'ls -al ~',
          xp: 25,
        },
        {
          id: 'stage-area',
          narration: 'There — buried in the listing: `.ssh` keys, config files, things no one was meant to find. But you can\'t carry it all in your head. You need a staging area.\n\n  `mkdir` — short for "make directory" — creates a new folder. Think of it as setting up a dead-drop: a private location where you\'ll collect the files before extraction.\n\n  You\'ll create a folder called `classified` in your home directory. It\'ll look innocent. Folders always do.',
          objective: 'Create a staging directory: run `mkdir ~/classified`',
          verify: {
            mode: 'shell',
            command: 'ls ~',
            custom: ({ stdout, stderr, exitCode }, input) => {
              if (!/\bmkdir\b/.test(input)) return { ok: false, reason: 'use `mkdir` to create the directory' };
              if (!/classified/.test(input)) return { ok: false, reason: 'name the directory `classified`' };
              if (exitCode !== 0) return { ok: false, reason: stderr || 'mkdir failed — the directory may already exist' };
              return { ok: true };
            },
          },
          hints: [
            '`mkdir` creates a new folder. Give it a path and it builds the directory for you.',
            'Your staging area should go in your home directory: `mkdir ~/classified`',
            'Run exactly: `mkdir ~/classified`',
          ],
          solution: 'mkdir ~/classified',
          xp: 20,
        },
        {
          id: 'extract',
          narration: 'Staging area confirmed. Time to pull the first file.\n\n  Every networked machine keeps a file called `/etc/hosts` — a local map of hostnames to IP addresses. To an operative, it\'s a blueprint of the network: which machines have aliases, which addresses are being masked, what the target is hiding behind friendly names.\n\n  `cp` copies a file from one location to another without disturbing the original. No trace, no alert. Syntax: `cp <source> <destination>`.\n\n  Copy the network map into your staging area. Rename it so it looks like nothing.',
          objective: 'Run `cp /etc/hosts ~/classified/network-map.txt` to extract the network intel.',
          verify: {
            mode: 'shell',
            command: 'ls ~/classified',
            custom: ({ stdout, stderr, exitCode }, input) => {
              if (!/\bcp\b/.test(input)) return { ok: false, reason: 'use the `cp` command to copy the file' };
              if (!/\/etc\/hosts/.test(input)) return { ok: false, reason: 'copy from /etc/hosts — that\'s the network map' };
              if (!/classified/.test(input)) return { ok: false, reason: 'copy it into ~/classified/' };
              if (exitCode !== 0) return { ok: false, reason: stderr || 'cp failed' };
              return { ok: true };
            },
          },
          hints: [
            '`cp` copies files. Format: `cp <source> <destination>`. The original stays untouched.',
            'The network map lives at `/etc/hosts`. Your staging area is `~/classified/`. Name the copy `network-map.txt`.',
            'Run exactly: `cp /etc/hosts ~/classified/network-map.txt`',
          ],
          solution: 'cp /etc/hosts ~/classified/network-map.txt',
          xp: 30,
        },
        {
          id: 'read-intel',
          narration: 'File acquired. But intelligence is worthless unread. You need to know what you have.\n\n  `cat` — short for "concatenate" — reads a file and prints its contents directly to the terminal. No editor required, no GUI needed. Point it at a file and the contents stream to your screen.\n\n  Read the network map. Confirm the intel. Know what you\'ve taken before you run.',
          objective: 'Run `cat ~/classified/network-map.txt` to read the extracted file.',
          verify: {
            mode: 'shell',
            command: 'cat ~/classified/network-map.txt',
            custom: ({ stdout, stderr, exitCode }, input) => {
              if (!/\bcat\b/.test(input)) return { ok: false, reason: 'use `cat` to read the file' };
              if (!/network-map/.test(input) && !/classified/.test(input)) return { ok: false, reason: 'read the file from ~/classified/network-map.txt' };
              if (exitCode !== 0) return { ok: false, reason: stderr || 'cat failed — does the file exist?' };
              if (!stdout.includes('localhost')) return { ok: false, reason: 'file doesn\'t look like /etc/hosts — recheck the copy step' };
              return { ok: true };
            },
          },
          hints: [
            '`cat` prints a file\'s contents to the terminal. Give it a file path and it reads it out loud.',
            'The file is at `~/classified/network-map.txt`',
            'Run exactly: `cat ~/classified/network-map.txt`',
          ],
          xp: 20,
        },
        {
          id: 'nav-up-arrow',
          narration: 'Intel confirmed. You\'ve got the map. But retyping long commands is sloppy — and in this game, speed is survival.\n\n  Every shell keeps a history of your commands. Press the **up arrow key** (↑) and the terminal recalls your last command. Press it again for the one before that. Keep pressing to scroll back through everything you\'ve typed this session.\n\n  Operatives don\'t type the same thing twice. They use history.',
          objective: 'What keyboard key scrolls back through your command history?',
          verify: {
            mode: 'prompt',
            choices: ['↑ (up arrow)', '← (left arrow)', 'Ctrl+R', 'Escape'],
            answers: ['↑ (up arrow)'],
          },
          hints: [
            'Try pressing different arrow keys in your terminal and see what happens.',
            'Look at the arrow keys on your keyboard. Which direction means "go back"?',
            'It\'s the up arrow — ↑. Press it in your terminal right now to see your last command come back.',
          ],
          xp: 15,
        },
        {
          id: 'nav-tab',
          narration: 'One more weapon before you make your move. The one that separates amateurs from professionals.\n\n  **Tab completion.** Start typing a command or file path, then hit the Tab key (⇥). The shell auto-completes the rest — as far as it can. If there\'s only one match, it fills in the whole thing. If there are multiple matches, press Tab twice to see all the options.\n\n  Type `cat ~/clas` and hit Tab. Watch it become `cat ~/classified/`. You never have to type the full path again.',
          objective: 'What key triggers auto-completion in the terminal?',
          verify: {
            mode: 'prompt',
            choices: ['Tab (⇥)', 'Enter', 'Ctrl+C', 'Spacebar'],
            answers: ['Tab (⇥)'],
          },
          hints: [
            'Look at the left side of your keyboard, above Caps Lock.',
            'It\'s not Enter — that runs the command. You need a key that completes it.',
            'It\'s the Tab key (⇥). Try it: type `cat ~/clas` and press Tab.',
          ],
          xp: 15,
        },
        {
          type: 'branch',
          id: 'exit-decision',
          narration: 'File extracted. Intel read. Navigation mastered. You have everything you came for.\n\n  Two minutes on the clock. Security sweep due in four. You could leave right now — clean, quiet, no trail.\n\n  Or you could push deeper.',
          branches: [
            {
              label: 'Ghost exit — cut and run',
              flavor: 'Operational security first. The intel is enough. Get out clean.',
              steps: [
                {
                  id: 'ghost-verify',
                  narration: 'Smart call. Confirm your extraction — one last look at what you\'ve taken before you close the connection. A good operative always verifies the package before going dark.',
                  objective: 'Run `ls -al ~/classified` to confirm your extracted files are intact.',
                  verify: {
                    mode: 'shell',
                    command: 'ls -al ~/classified',
                    custom: ({ stdout, exitCode }, input) => {
                      if (!/\bls\b/.test(input)) return { ok: false, reason: 'use ls to verify your files' };
                      if (exitCode !== 0) return { ok: false, reason: 'ls failed' };
                      if (!stdout.includes('network-map')) return { ok: false, reason: 'can\'t see your extracted file — point ls at ~/classified' };
                      return { ok: true };
                    },
                  },
                  hints: [
                    'Use ls with the long format to see file sizes and dates.',
                    'Point it at your staging directory: ls -al ~/classified',
                    'Run exactly: `ls -al ~/classified`',
                  ],
                  xp: 20,
                },
                {
                  id: 'ghost-exit',
                  narration: 'Package confirmed. One file. Clean copy. No tracks.\n\n  You close the connection. The cursor stops blinking. From the outside, nothing happened — just a terminal session that ended normally.\n\n  Mission complete. Intel delivered. You\'re already three cities away.\n\n  **OPERATION: NIGHTFALL — STATUS: COMPLETE**',
                  objective: 'Run `echo "NIGHTFALL: COMPLETE"` to mark mission success.',
                  verify: {
                    mode: 'shell',
                    command: 'echo "NIGHTFALL: COMPLETE"',
                    custom: ({ stdout, exitCode }, input) => {
                      if (!/\becho\b/.test(input)) return { ok: false, reason: 'use echo to send the signal' };
                      if (exitCode !== 0) return { ok: false, reason: 'echo failed' };
                      return { ok: true };
                    },
                  },
                  hints: [
                    '`echo` prints text to the terminal. Use it to send a message.',
                    'Try: echo followed by your message in quotes.',
                    'Run exactly: `echo "NIGHTFALL: COMPLETE"`',
                  ],
                  xp: 25,
                },
              ],
            },
            {
              label: 'One more sweep',
              flavor: 'There\'s more in there. You can feel it.',
              steps: [
                {
                  id: 'deeper-scan',
                  narration: 'Your instincts are right. The `/etc` directory is the system\'s nervous centre — configurations, network settings, user databases. You\'ve only scratched the surface.\n\n  Before you decide how deep to go, get a count. How many files are actually in there?',
                  objective: 'Run `ls /etc | head -20` to scan the system config directory.',
                  verify: {
                    mode: 'shell',
                    command: 'ls /etc | head -20',
                    custom: ({ stdout, exitCode }, input) => {
                      if (!/\bls\b/.test(input)) return { ok: false, reason: 'use ls to scan the directory' };
                      if (!/\/etc/.test(input)) return { ok: false, reason: 'scan /etc — the system config directory' };
                      if (exitCode !== 0) return { ok: false, reason: 'ls /etc failed' };
                      if (!stdout.trim()) return { ok: false, reason: 'no output — try ls /etc | head -20' };
                      return { ok: true };
                    },
                  },
                  hints: [
                    '`ls /etc` lists the system configuration directory. Pipe it through `head -20` to see just the first 20 files.',
                    'The pipe character `|` passes output from one command to the next. Try: ls /etc | head -20',
                    'Run exactly: `ls /etc | head -20`',
                  ],
                  xp: 25,
                },
                {
                  type: 'branch',
                  id: 'extraction-choice',
                  narration: 'Dozens of files. Some interesting. But your clock is down to ninety seconds.\n\n  You can\'t take it all. Two options — which is the better play?',
                  branches: [
                    {
                      label: 'Plant a decoy and vanish',
                      flavor: 'Leave something behind. Confuse the trail.',
                      steps: [
                        {
                          id: 'plant-decoy',
                          narration: 'Classic misdirection. You copy a harmless file into a location where it looks suspicious — a digital ghost to keep investigators busy while you\'re already gone.\n\n  Copy the shells list — a completely innocuous file — somewhere it\'ll cause confusion. Then walk.',
                          objective: 'Run `cp /etc/shells ~/classified/agent-list.txt` to plant the decoy.',
                          verify: {
                            mode: 'shell',
                            command: 'ls ~/classified',
                            custom: ({ stdout, exitCode }, input) => {
                              if (!/\bcp\b/.test(input)) return { ok: false, reason: 'use cp to plant the file' };
                              if (!/\/etc\/shells/.test(input)) return { ok: false, reason: 'use /etc/shells as the source file' };
                              if (exitCode !== 0) return { ok: false, reason: 'cp failed' };
                              return { ok: true };
                            },
                          },
                          hints: [
                            'You\'re copying a file and renaming it to something misleading.',
                            'Source: /etc/shells  — Destination: ~/classified/agent-list.txt',
                            'Run exactly: `cp /etc/shells ~/classified/agent-list.txt`',
                          ],
                          xp: 30,
                        },
                        {
                          id: 'decoy-exit',
                          narration: 'Decoy planted. The investigators will waste hours on that file.\n\n  You verify your staging area one last time, then close the connection — two seconds before the scheduled sweep.\n\n  They\'ll find the decoy. They\'ll chase it. And you\'ll be untraceable.\n\n  **OPERATION: NIGHTFALL — STATUS: COMPLETE. COVER INTACT.**',
                          objective: 'Run `cat ~/classified/agent-list.txt` to confirm the decoy is live.',
                          verify: {
                            mode: 'shell',
                            command: 'cat ~/classified/agent-list.txt',
                            custom: ({ stdout, exitCode }, input) => {
                              if (!/\bcat\b/.test(input)) return { ok: false, reason: 'use cat to verify the file' };
                              if (exitCode !== 0) return { ok: false, reason: 'cat failed — did the cp step complete?' };
                              if (!stdout.trim()) return { ok: false, reason: 'file is empty — recheck the copy step' };
                              return { ok: true };
                            },
                          },
                          hints: [
                            'Verify what you planted before you go dark.',
                            'Use cat to read the file content.',
                            'Run exactly: `cat ~/classified/agent-list.txt`',
                          ],
                          xp: 30,
                        },
                      ],
                    },
                    {
                      label: 'Full extraction — take everything',
                      flavor: 'Maximum intel. Calculated risk.',
                      steps: [
                        {
                          id: 'full-extract-1',
                          narration: 'Maximum value extraction. You\'re going to pull two more files: the shells list (which tells you what interpreters are available) and the hostname file (the machine\'s identity on the network).\n\n  First: the shells.',
                          objective: 'Run `cp /etc/shells ~/classified/available-shells.txt` to copy the shells list.',
                          verify: {
                            mode: 'shell',
                            command: 'ls ~/classified',
                            custom: ({ stdout, exitCode }, input) => {
                              if (!/\bcp\b/.test(input)) return { ok: false, reason: 'use cp to copy the file' };
                              if (!/\/etc\/shells/.test(input)) return { ok: false, reason: 'copy from /etc/shells' };
                              if (exitCode !== 0) return { ok: false, reason: 'cp failed' };
                              return { ok: true };
                            },
                          },
                          hints: [
                            '`/etc/shells` lists every shell interpreter installed on the machine.',
                            'Copy it to your staging area with a clear name.',
                            'Run exactly: `cp /etc/shells ~/classified/available-shells.txt`',
                          ],
                          xp: 25,
                        },
                        {
                          id: 'full-extract-2',
                          narration: 'Good. Now the hostname — the machine\'s name on the network. Cross-reference it with the network map you already have and you\'ll be able to identify exactly which node this was.',
                          objective: 'Run `cat /etc/hostname` (or `hostname` on macOS) to read the machine identity.',
                          verify: {
                            mode: 'shell',
                            command: 'hostname',
                            custom: ({ stdout, exitCode }, input) => {
                              if (!/\bhostname\b/.test(input) && !/\/etc\/hostname/.test(input)) return { ok: false, reason: 'use `hostname` or `cat /etc/hostname` to get the machine name' };
                              if (exitCode !== 0) return { ok: false, reason: 'command failed' };
                              if (!stdout.trim()) return { ok: false, reason: 'no output — try the `hostname` command' };
                              return { ok: true };
                            },
                          },
                          hints: [
                            'Every machine has a hostname — its name on the network. There are two ways to get it.',
                            'Try running `hostname` — it\'s a standalone command that prints the machine name directly.',
                            'Run: `hostname`  (or on some systems: `cat /etc/hostname`)',
                          ],
                          xp: 25,
                        },
                        {
                          id: 'full-exit',
                          narration: 'Network map. Shell list. Machine identity. You\'ve pulled everything that matters.\n\n  You run one final `ls -al` on your staging area — a professional\'s last check before going dark. Three files. All confirmed. Clean copies, original timestamps untouched.\n\n  The sweep alarm triggers thirty seconds after you close the connection. They\'ll never know what was taken.\n\n  **OPERATION: NIGHTFALL — STATUS: COMPLETE. MAXIMUM EXTRACTION.**',
                          objective: 'Run `ls -al ~/classified` to confirm the full extraction package.',
                          verify: {
                            mode: 'shell',
                            command: 'ls -al ~/classified',
                            custom: ({ stdout, exitCode }, input) => {
                              if (!/\bls\b/.test(input)) return { ok: false, reason: 'use ls to verify the package' };
                              if (exitCode !== 0) return { ok: false, reason: 'ls failed' };
                              const fileCount = stdout.split('\n').filter(l => /^[-drwx]/.test(l.trim())).length;
                              if (fileCount < 2) return { ok: false, reason: 'expecting at least 2 extracted files in ~/classified' };
                              return { ok: true };
                            },
                          },
                          hints: [
                            'Use ls with the long format flag to see all your files with details.',
                            'Check ~/classified — you should have multiple files there now.',
                            'Run exactly: `ls -al ~/classified`',
                          ],
                          xp: 35,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
