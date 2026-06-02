import type { Pack } from '../types';

const pack: Pack = {
  id: 'terminal-basics-2',
  order: 2,
  title: 'Operation: Cover Burn',
  synopsis: 'Sequel to Nightfall. Process intel, cover your tracks, leave no trace.',
  tool: 'terminal',
  stories: [
    {
      id: 'cover-burn',
      title: 'Cover Burn',
      setting: 'The intel is in your hands. Now process it, document it, and vanish.',
      steps: [
        {
          id: 'create-log',
          narration:
            'You\'re back. The classified directory is still here from the last run. Good — it means you weren\'t caught.\n\n  Professional operators document everything. You need a mission log — a record of what you found and when.\n\n  `echo` prints text to the terminal. But there\'s a more powerful use: combine `echo` with `>` to write text directly into a file. The `>` operator is called "output redirection" — it takes whatever a command outputs and saves it to a file instead of printing it.\n\n  Create your log.',
          objective: 'Run `echo "MISSION LOG" > mission-log.txt` to create your mission log.',
          verify: {
            mode: 'shell',
            custom: ({ stdout, stderr, exitCode }, input) => {
              if (!/\becho\b/.test(input)) return { ok: false, reason: 'use echo to create the log entry' };
              if (!/>/.test(input)) return { ok: false, reason: 'use > to redirect output to a file' };
              if (!/mission-log/.test(input)) return { ok: false, reason: 'save to mission-log.txt' };
              if (exitCode !== 0) return { ok: false, reason: stderr || 'command failed' };
              return { ok: true };
            },
          },
          hints: [
            '`echo` prints text. `>` redirects that output into a file (creating it if it doesn\'t exist).',
            'Combine them: echo "your text" > filename.txt',
            'Run exactly: `echo "MISSION LOG" > mission-log.txt`',
          ],
          solution: 'echo "MISSION LOG" > mission-log.txt',
          xp: 30,
        },
        {
          id: 'rename-file',
          narration:
            'Log created. Now — intel files should never have obvious names. `intel.txt` is too readable.\n\n  `mv` moves files — but it also renames them. The format is:\n  `mv <source> <destination>`\n\n  If source and destination are in the same directory, it\'s a rename. If they\'re different directories, it\'s a move. Rename your intel file to something that won\'t raise flags.',
          objective: 'Run `mv classified/intel.txt classified/topology.dat` to rename the intel file.',
          verify: {
            mode: 'shell',
            custom: ({ stdout, stderr, exitCode }, input) => {
              if (!/\bmv\b/.test(input)) return { ok: false, reason: 'use mv to rename the file' };
              if (!/intel\.txt/.test(input)) return { ok: false, reason: 'rename classified/intel.txt' };
              if (exitCode !== 0) return { ok: false, reason: stderr || 'mv failed — does classified/intel.txt exist? Run the previous quest first.' };
              return { ok: true };
            },
          },
          hints: [
            '`mv` moves or renames files. Source first, destination second.',
            'Rename the intel file: mv classified/intel.txt classified/topology.dat',
            'Run exactly: `mv classified/intel.txt classified/topology.dat`',
          ],
          solution: 'mv classified/intel.txt classified/topology.dat',
          xp: 25,
        },
        {
          id: 'count-lines',
          narration:
            'Before you process the intel, you need to know how much data you\'re working with.\n\n  `wc` stands for "word count" — but it can count more than words. The `-l` flag counts lines. One line = one record. The number tells you the size of what you extracted.\n\n  Check the scope.',
          objective: 'Run `wc -l README.md` to count the lines in the intel file.',
          verify: {
            mode: 'shell',
            custom: ({ stdout, stderr, exitCode }, input) => {
              if (!/\bwc\b/.test(input)) return { ok: false, reason: 'use wc to count lines' };
              if (!/-l/.test(input)) return { ok: false, reason: 'use the -l flag to count lines' };
              if (exitCode !== 0) return { ok: false, reason: stderr || 'wc failed' };
              if (!stdout.trim()) return { ok: false, reason: 'no output — check the file path' };
              return { ok: true };
            },
          },
          hints: [
            '`wc -l` counts the number of lines in a file. Each line = one record.',
            'Count the lines in your intel: wc -l README.md',
            'Run exactly: `wc -l README.md`',
          ],
          solution: 'wc -l README.md',
          xp: 20,
        },
        {
          id: 'grep-pattern',
          narration:
            'Now filter.\n\n  Raw data is noise. You need to find specific intelligence within it.\n\n  `grep` searches text for a pattern and prints only the lines that match. The name comes from "global regular expression print" — but you don\'t need to know that. What you need to know is: `grep` finds things fast.\n\n  Search the README for the project name.',
          objective: 'Run `grep "StreetRacer" README.md` to find references to the project name.',
          verify: {
            mode: 'shell',
            stdoutContains: 'StreetRacer',
          },
          hints: [
            '`grep` searches a file for a pattern and prints matching lines.',
            'Search README.md for the project name: grep "StreetRacer" README.md',
            'Run exactly: `grep "StreetRacer" README.md`',
          ],
          xp: 25,
        },
        {
          id: 'grep-count',
          narration:
            'Useful. But sometimes you don\'t need to see the matches — you need to know how many there are.\n\n  The `-c` flag in `grep` counts matching lines instead of printing them. One number. How often does a term appear?\n\n  This is useful for intelligence analysis: if a keyword appears 40 times, it\'s central to the system.',
          objective: 'Run `grep -c "StreetRacer" README.md` to count the matching lines.',
          verify: {
            mode: 'shell',
            custom: ({ stdout, stderr, exitCode }, input) => {
              if (!/\bgrep\b/.test(input)) return { ok: false, reason: 'use grep to search the file' };
              if (!/-c/.test(input)) return { ok: false, reason: 'use the -c flag to count matches' };
              if (exitCode !== 0 && exitCode !== 1) return { ok: false, reason: stderr || 'grep failed' };
              return { ok: true };
            },
          },
          hints: [
            '`grep -c` counts the number of lines that match the pattern — no output, just a number.',
            'Count the matches: grep -c "StreetRacer" README.md',
            'Run exactly: `grep -c "StreetRacer" README.md`',
          ],
          xp: 20,
        },
        {
          id: 'find-files',
          narration:
            'You\'ve processed the intel. Now map the full scope of what\'s accessible.\n\n  `find` searches for files recursively through directories. It can filter by name, type, date, and more.\n\n  The format is:\n  `find <where> -name "<pattern>" -type f`\n\n  The `-name` flag takes a pattern. The `*` wildcard matches anything. So `*.js` means "any JavaScript file." Map the source.',
          objective: 'Run `find . -name "*.js" -type f` to locate all JavaScript files.',
          verify: {
            mode: 'shell',
            custom: ({ stdout, exitCode }, input) => {
              if (!/\bfind\b/.test(input)) return { ok: false, reason: 'use find to search for files' };
              if (!/-name/.test(input)) return { ok: false, reason: 'use -name to filter by filename' };
              if (exitCode !== 0) return { ok: false, reason: 'find failed' };
              if (!stdout.trim()) return { ok: false, reason: 'no output — try: find . -name "*.js" -type f' };
              return { ok: true };
            },
          },
          hints: [
            '`find` searches recursively for files matching a pattern. `*` is a wildcard meaning "any string".',
            'Find all JavaScript files: find . -name "*.js" -type f',
            'Run exactly: `find . -name "*.js" -type f`',
          ],
          xp: 25,
        },
        {
          id: 'append-log',
          narration:
            'Files mapped. Now update your mission log.\n\n  You already know `>` writes to a file — but it overwrites everything.\n\n  `>>` is different. It appends to a file — adds to the end without erasing what\'s already there. This is how you build a log over time.\n\n  Add a final entry.',
          objective: 'Run `echo "EXTRACTION COMPLETE" >> mission-log.txt` to append to your log.',
          verify: {
            mode: 'shell',
            custom: ({ stdout, stderr, exitCode }, input) => {
              if (!/\becho\b/.test(input)) return { ok: false, reason: 'use echo to add a log entry' };
              if (!/>/.test(input)) return { ok: false, reason: 'use >> to append to the file' };
              if (!/>>\s/.test(input) && !/>>/.test(input)) return { ok: false, reason: 'use >> (double arrow) to append, not > which overwrites' };
              if (!/mission-log/.test(input)) return { ok: false, reason: 'append to mission-log.txt' };
              if (exitCode !== 0) return { ok: false, reason: stderr || 'command failed' };
              return { ok: true };
            },
          },
          hints: [
            '`>>` appends to an existing file instead of overwriting it. `>` overwrites, `>>` adds to the end.',
            'Add to your log: echo "EXTRACTION COMPLETE" >> mission-log.txt',
            'Run exactly: `echo "EXTRACTION COMPLETE" >> mission-log.txt`',
          ],
          xp: 25,
        },
        {
          id: 'man-pages',
          narration:
            'Every command you\'ve used has a built-in manual. This is the most underused feature in the terminal.\n\n  `man <command>` opens the full documentation for any command — flags, options, examples, everything.\n\n  When you don\'t know a flag exists, `man` finds it. When you forget syntax, `man` has it. No googling, no Stack Overflow — just `man`.\n\n  What flag does `grep` use to search case-insensitively?',
          objective: 'What flag makes grep search case-insensitively? (run `man grep` if you need to check)',
          verify: {
            mode: 'prompt',
            choices: ['-i (ignore case)', '-c (count matches)', '-r (recursive)', '-n (line numbers)'],
            answer: '-i (ignore case)',
          },
          hints: [
            'Run `man grep` in your terminal to read the manual and find the answer.',
            'Look for the flag that affects case sensitivity — "ignore case".',
            'The answer is `-i` — it makes grep case-insensitive.',
          ],
          xp: 20,
        },
        {
          type: 'branch',
          id: 'cover-branch',
          narration: 'The intel is processed. The log is complete. Mission accomplished.\n\n  Now you have a choice. How do you want to close this operation?',
          branches: [
            {
              label: 'Destroy the evidence',
              flavor: 'Remove everything. Leave no trace of the operation.',
              steps: [
                {
                  id: 'destroy-evidence',
                  narration: 'The clean play.\n\n  `rm -r` removes a directory and everything inside it. The `-r` flag means "recursive" — it goes through every subdirectory and deletes each file before removing the container.\n\n  Once you run this, the operation never happened.\n\n  **OPERATION COVER BURN — STATUS: COMPLETE. EVIDENCE DESTROYED.**',
                  objective: 'Run `rm -r classified` to erase all extracted files.',
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
                    '`rm -r` removes a directory and everything inside it recursively.',
                    'Erase your staging area: rm -r classified',
                    'Run exactly: `rm -r classified`',
                  ],
                  xp: 30,
                },
              ],
            },
            {
              label: 'Consolidate and transmit',
              flavor: 'Archive everything into a single deliverable before you go.',
              steps: [
                {
                  id: 'consolidate',
                  narration: 'You\'re not leaving empty-handed.\n\n  `cat` can concatenate — join — multiple files. Pass it several filenames and it prints them all in sequence. Redirect that output to a new file and you\'ve got a single consolidated report.\n\n  Merge all your files into a final delivery package.',
                  objective: 'Run `cat classified/topology.dat mission-log.txt > full-report.txt` to consolidate.',
                  verify: {
                    mode: 'shell',
                    custom: ({ stdout, stderr, exitCode }, input) => {
                      if (!/\bcat\b/.test(input)) return { ok: false, reason: 'use cat to concatenate the files' };
                      if (!/>/.test(input)) return { ok: false, reason: 'use > to redirect into a new file' };
                      if (!/full-report/.test(input)) return { ok: false, reason: 'save to full-report.txt' };
                      if (exitCode !== 0) return { ok: false, reason: stderr || 'cat failed — check the file paths' };
                      return { ok: true };
                    },
                  },
                  hints: [
                    '`cat file1 file2` prints both files in sequence. Add `> output.txt` to save the result.',
                    'Concatenate both files: cat classified/topology.dat mission-log.txt > full-report.txt',
                    'Run exactly: `cat classified/topology.dat mission-log.txt > full-report.txt`',
                  ],
                  xp: 30,
                },
                {
                  id: 'final-count',
                  narration: 'Consolidated report created.\n\n  Before you transmit, verify the payload.\n\n  `wc -l` tells you the line count. One final check — know exactly what you\'re sending.\n\n  **OPERATION COVER BURN — STATUS: COMPLETE. INTEL TRANSMITTED.**',
                  objective: 'Run `wc -l full-report.txt` to verify the final report.',
                  verify: {
                    mode: 'shell',
                    custom: ({ stdout, exitCode }, input) => {
                      if (!/\bwc\b/.test(input)) return { ok: false, reason: 'use wc to count the lines' };
                      if (!/full-report/.test(input)) return { ok: false, reason: 'check full-report.txt' };
                      if (exitCode !== 0) return { ok: false, reason: 'wc failed — does full-report.txt exist?' };
                      return { ok: true };
                    },
                  },
                  hints: [
                    '`wc -l` counts lines. Point it at your consolidated report.',
                    'Check the report: wc -l full-report.txt',
                    'Run exactly: `wc -l full-report.txt`',
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
