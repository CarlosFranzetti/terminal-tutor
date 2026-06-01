import type { Pack } from '../types';

const pack: Pack = {
  id: 'terminal-basics',
  order: 1,
  title: 'Operation: Nightfall',
  synopsis: 'A secret agent with terminal access. Extract intel, vanish clean.',
  tool: 'terminal',
  stories: [
    {
      id: 'the-extraction',
      title: 'The Extraction',
      setting: 'You\'re in. Shell access confirmed. Time to find out what\'s here.',
      steps: [
        {
          id: 'survey',
          narration:
            'Shell access: confirmed. You\'re inside a game studio\'s development machine.\n\n  The terminal is a text interface to your computer — no icons, no menus, just commands and results. Every file, every folder, every secret lives somewhere in this system.\n\n  `ls` lists the contents of a directory. It\'s the most fundamental command in the terminal — a quick scan of your surroundings. Run it to see what\'s here.',
          objective: 'Run `ls` to list the files in the current directory.',
          verify: {
            mode: 'shell',
            custom: ({ stdout, exitCode }, input) => {
              if (!/\bls\b/.test(input)) return { ok: false, reason: 'use ls to list the directory' };
              if (exitCode !== 0) return { ok: false, reason: 'ls failed' };
              if (!stdout.trim()) return { ok: false, reason: 'no output — try just: ls' };
              return { ok: true };
            },
          },
          hints: [
            '`ls` lists files and directories in the current location.',
            'Type the command and press Enter: ls',
            'Run exactly: `ls`',
          ],
          xp: 20,
        },
        {
          id: 'deep-scan',
          narration:
            'Good. You can see the project layout. But a surface scan isn\'t enough.\n\n  Unix systems have hidden files — files whose names start with a dot (`.bashrc`, `.ssh`, `.gitignore`). A plain `ls` skips them entirely. That\'s where developers leave secrets.\n\n  Two flags reveal everything:\n  `-a` shows all files, including hidden ones.\n  `-l` shows the long format: permissions, owner, size, last modified.\n\n  Together, `ls -al` is a full intelligence sweep. Nothing stays hidden.',
          objective: 'Run `ls -al` to reveal all files including hidden ones.',
          verify: {
            mode: 'shell',
            custom: ({ stdout, exitCode }, input) => {
              if (!/\bls\b/.test(input)) return { ok: false, reason: 'use ls to list files' };
              if (!/-[a-z]*a/.test(input)) return { ok: false, reason: 'add the -a flag to show hidden files' };
              if (exitCode !== 0) return { ok: false, reason: 'ls failed' };
              if (!stdout.includes('.')) return { ok: false, reason: 'hidden files not showing — try ls -al' };
              return { ok: true };
            },
          },
          hints: [
            'Flags modify a command\'s behavior. `ls -a` shows hidden files (those starting with a dot). `ls -l` adds detailed info. You can combine flags.',
            'Combine both flags: `ls -al` or `ls -la` — both work.',
            'Run exactly: `ls -al`',
          ],
          xp: 25,
        },
        {
          id: 'stage-area',
          narration:
            'There they are — the hidden files. Config, credentials, history.\n\n  Now you need a staging area. A container for everything you extract before you disappear.\n\n  `mkdir` creates a new directory. You\'ll name it `classified`. That\'s what it is.',
          objective: 'Run `mkdir classified` to create your staging directory.',
          verify: {
            mode: 'shell',
            custom: ({ stdout, stderr, exitCode }, input) => {
              if (!/\bmkdir\b/.test(input)) return { ok: false, reason: 'use mkdir to create a directory' };
              if (!/classified/.test(input)) return { ok: false, reason: 'name the directory `classified`' };
              if (exitCode !== 0) return { ok: false, reason: stderr || 'mkdir failed' };
              return { ok: true };
            },
          },
          hints: [
            '`mkdir` creates a new directory. Give it a name and it builds the folder.',
            'Create your staging directory with: mkdir classified',
            'Run exactly: `mkdir classified`',
          ],
          xp: 20,
        },
        {
          id: 'extract',
          narration:
            'Staging area ready. Now extract the intel.\n\n  `cp` copies a file from one location to another. The format is:\n  `cp <source> <destination>`\n\n  The README.md contains the full project architecture — tech stack, file structure, build process. Everything you need to understand this machine\'s capabilities. Copy it to your staging area under a neutral filename.',
          objective: 'Run `cp README.md classified/intel.txt` to extract the project documentation.',
          verify: {
            mode: 'shell',
            custom: ({ stdout, stderr, exitCode }, input) => {
              if (!/\bcp\b/.test(input)) return { ok: false, reason: 'use cp to copy the file' };
              if (!/README/.test(input)) return { ok: false, reason: 'copy README.md as your intel source' };
              if (exitCode !== 0) return { ok: false, reason: stderr || 'cp failed' };
              return { ok: true };
            },
          },
          hints: [
            '`cp` copies files. Format: `cp source destination`. You can rename the file at the destination.',
            'Copy README.md into classified/ with a new name: cp README.md classified/intel.txt',
            'Run exactly: `cp README.md classified/intel.txt`',
          ],
          xp: 25,
        },
        {
          id: 'read-intel',
          narration:
            'File secured in staging. Now read it.\n\n  `cat` prints a file\'s contents to the terminal. Short for "concatenate" — it was designed to join files, but its most common use is just reading one file at a time.\n\n  Read your extracted intel. Know what you\'re working with.',
          objective: 'Run `cat classified/intel.txt` to read the extracted file.',
          verify: {
            mode: 'shell',
            stdoutContains: 'StreetRacer',
          },
          hints: [
            '`cat` prints the contents of a file to the terminal.',
            'Point it at the file you extracted: cat classified/intel.txt',
            'Run exactly: `cat classified/intel.txt`',
          ],
          xp: 20,
        },
        {
          id: 'nav-up-arrow',
          narration:
            'Good. You\'ve read the intel. Now — efficient operators don\'t retype commands.\n\n  Most terminals remember every command you\'ve typed. There\'s a key that scrolls back through your command history, letting you re-run anything from this session without retyping it.',
          objective: 'What key scrolls back through your command history?',
          verify: {
            mode: 'prompt',
            choices: ['↑ (up arrow)', 'Tab', 'Ctrl+R', 'Escape'],
            answer: '↑ (up arrow)',
          },
          hints: [
            'Think about the arrow keys on your keyboard.',
            'You scroll through history by going "up" through it.',
            'The up arrow key (↑) recalls previous commands one at a time.',
          ],
          xp: 15,
        },
        {
          id: 'nav-tab',
          narration:
            'Another essential: you should never type a full filename if the shell can finish it for you.\n\n  Start typing a command or filename — then press this key. If there\'s only one match, the shell completes it instantly. If there are multiple matches, press it twice to see all options.\n\n  Professionals use this constantly. It\'s faster and eliminates typos.',
          objective: 'What key auto-completes a partial command or filename?',
          verify: {
            mode: 'prompt',
            choices: ['Tab', '↑ (up arrow)', 'Ctrl+Space', 'Enter'],
            answer: 'Tab',
          },
          hints: [
            'This key is on the left side of your keyboard, above Caps Lock.',
            'It\'s called "Tab" — it completes things for you.',
            'The Tab key auto-completes filenames and commands.',
          ],
          xp: 15,
        },
        {
          type: 'branch',
          id: 'endgame',
          narration: 'Intel secured. Capabilities mapped. You have everything you need.\n\n  The clock is ticking. Every second you stay increases the risk of detection. What\'s your play?',
          branches: [
            {
              label: 'Ghost exit — vanish clean',
              flavor: 'Remove all traces. Leave no evidence.',
              steps: [
                {
                  id: 'erase-tracks',
                  narration: 'The professional move. You extract the intel you need and leave no footprint.\n\n  `rm` removes files. With the `-r` flag (recursive), it removes a directory and everything inside it.\n\n  Erase the staging area. When you\'re done, it never existed.\n\n  **OPERATION NIGHTFALL — STATUS: COMPLETE. CLEAN EXIT.**',
                  objective: 'Run `rm -r classified` to erase all traces.',
                  verify: {
                    mode: 'shell',
                    custom: ({ stdout, stderr, exitCode }, input) => {
                      if (!/\brm\b/.test(input)) return { ok: false, reason: 'use rm to remove the directory' };
                      if (!/classified/.test(input)) return { ok: false, reason: 'remove the classified directory' };
                      if (exitCode !== 0) return { ok: false, reason: stderr || 'rm failed' };
                      return { ok: true };
                    },
                  },
                  hints: [
                    '`rm -r` removes a directory and all its contents. The -r flag means "recursive".',
                    'Remove your staging area: rm -r classified',
                    'Run exactly: `rm -r classified`',
                  ],
                  xp: 30,
                },
              ],
            },
            {
              label: 'Go deeper — read the source',
              flavor: 'You have access. Might as well understand the whole system.',
              steps: [
                {
                  id: 'read-source',
                  narration: 'You\'re already in. The game source is right there.\n\n  The physics engine is at `src/physics.js`. Every physics calculation this game runs. Every vulnerability, every performance bottleneck.\n\n  Read it.',
                  objective: 'Run `cat src/physics.js` to read the physics engine source code.',
                  verify: {
                    mode: 'shell',
                    stdoutContains: 'PhysicsEngine',
                  },
                  hints: [
                    '`cat` reads a file. Point it at the physics source.',
                    'The file is at src/physics.js',
                    'Run exactly: `cat src/physics.js`',
                  ],
                  xp: 25,
                },
                {
                  id: 'deep-exit',
                  narration: 'There it is. The physics engine. Every corner it cuts, every system it leans on.\n\n  You close the session. You save the path to your notes. You\'ll be back — and now you understand exactly what you\'re walking into.\n\n  **OPERATION NIGHTFALL — STATUS: COMPLETE. DEEP RECON CONFIRMED.**',
                  objective: 'Run `ls src` to map the full source directory before you leave.',
                  verify: {
                    mode: 'shell',
                    custom: ({ stdout, exitCode }, input) => {
                      if (!/\bls\b/.test(input)) return { ok: false, reason: 'use ls to list the source directory' };
                      if (!/src/.test(input)) return { ok: false, reason: 'list the src directory' };
                      if (exitCode !== 0) return { ok: false, reason: 'ls failed' };
                      return { ok: true };
                    },
                  },
                  hints: [
                    '`ls` can take a path as an argument to list a specific directory.',
                    'List the src directory: ls src',
                    'Run exactly: `ls src`',
                  ],
                  xp: 25,
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
