// Operation: Cover Burn — Terminal Basics Part 2
// Sequel to terminal-basics.js. Ordered by increasing difficulty.
// Teaches: echo, mv, wc, grep, find, >> append, rm, man pages (via prompt)
// Two endings: destroy evidence OR consolidate and transmit

export default {
  order: 2,
  id: 'terminal-basics-2',
  title: 'Operation: Cover Burn',
  synopsis: 'The intel is extracted. Now cover your tracks, analyze the data, and prepare for final transmission. Advanced terminal techniques — ordered from easy to expert.',
  tool: 'terminal',
  stories: [
    {
      id: 'cover-burn',
      title: 'Cover Burn',
      setting: 'Back on the target system. You have the files. HQ wants more. And your trail is showing.',
      steps: [

        // ── LEVEL 1: echo ── (very easy)
        {
          id: 'echo-briefing',
          narration: 'HQ is on the line. Secure channel. They want a mission log — a record of what you\'ve done inside this system.\n\n  The simplest way to create a text file from the terminal: `echo`. It prints text to the screen. But paired with the `>` operator (output redirection), it writes that text directly into a file instead.\n\n  Format: `echo "your text" > filename.txt`\n\n  The `>` redirects the output away from your screen and into the file. If the file doesn\'t exist, it creates it. If it does exist, it overwrites it.\n\n  Create your mission log.',
          objective: 'Run `echo "OPERATION: COVER BURN" > ~/classified/mission-log.txt` to create the mission log.',
          verify: {
            mode: 'shell',
            command: 'cat ~/classified/mission-log.txt',
            custom: ({ stdout, exitCode }, input) => {
              if (!/\becho\b/.test(input)) return { ok: false, reason: 'use echo to write the file' };
              if (!/>/.test(input)) return { ok: false, reason: 'use > to redirect the output into a file' };
              if (!/mission-log/.test(input) && !/classified/.test(input)) return { ok: false, reason: 'write to ~/classified/mission-log.txt' };
              if (exitCode !== 0) return { ok: false, reason: 'command failed' };
              return { ok: true };
            },
          },
          hints: [
            '`echo` prints text. `>` redirects that text into a file instead of the screen. Together: `echo "text" > file.txt` creates a file with that text.',
            'Create the log in your existing classified directory.',
            'Run: `echo "OPERATION: COVER BURN" > ~/classified/mission-log.txt`',
          ],
          solution: 'echo "OPERATION: COVER BURN" > ~/classified/mission-log.txt',
          xp: 20,
        },

        // ── LEVEL 2: mv ── (easy)
        {
          id: 'mv-rename',
          narration: 'Mission log created. Now clean up the file names — anything that reads "network-map" is an obvious red flag if someone runs a search.\n\n  `mv` — short for "move" — does two things: it moves files between directories, and it renames them in place. If source and destination are in the same directory with a different name, it\'s a rename. If they\'re in different directories, it\'s a move.\n\n  Format: `mv <source> <destination>`\n\n  Rename the network map to something that won\'t trigger a keyword search.',
          objective: 'Run `mv ~/classified/network-map.txt ~/classified/topology.dat` to rename the file.',
          verify: {
            mode: 'shell',
            command: 'ls ~/classified',
            custom: ({ stdout, exitCode }, input) => {
              if (!/\bmv\b/.test(input)) return { ok: false, reason: 'use mv to rename the file' };
              if (!/network-map/.test(input)) return { ok: false, reason: 'move ~/classified/network-map.txt' };
              if (exitCode !== 0) return { ok: false, reason: 'mv failed — does network-map.txt exist in ~/classified? Try the extract step from Part 1 first.' };
              return { ok: true };
            },
          },
          hints: [
            '`mv` renames a file when source and destination are in the same directory. `mv oldname.txt newname.txt` renames it in place.',
            'You\'re renaming network-map.txt in ~/classified/ to something less obvious.',
            'Run: `mv ~/classified/network-map.txt ~/classified/topology.dat`',
          ],
          solution: 'mv ~/classified/network-map.txt ~/classified/topology.dat',
          xp: 20,
        },

        // ── LEVEL 3: wc ── (easy)
        {
          id: 'wc-count',
          narration: 'File renamed. HQ wants a quick count — how many entries are in the topology file? Each line is one hostname-to-IP mapping.\n\n  `wc` — word count — counts words, lines, and characters in a file. The `-l` flag makes it count only lines. One flag, instant answer.\n\n  Format: `wc -l <file>`\n\n  Count the intelligence entries.',
          objective: 'Run `wc -l ~/classified/topology.dat` to count the lines in the file.',
          verify: {
            mode: 'shell',
            command: 'wc -l ~/classified/topology.dat',
            custom: ({ stdout, exitCode }, input) => {
              if (!/\bwc\b/.test(input)) return { ok: false, reason: 'use wc to count lines' };
              if (!/-l/.test(input)) return { ok: false, reason: 'use the -l flag to count lines' };
              if (exitCode !== 0) return { ok: false, reason: 'wc failed — does topology.dat exist in ~/classified?' };
              if (!stdout.trim()) return { ok: false, reason: 'no output — check the file path' };
              return { ok: true };
            },
          },
          hints: [
            '`wc -l` counts lines in a file. Each line = one entry. It\'s the fastest way to get a count without opening the file.',
            'Point it at your renamed topology file.',
            'Run: `wc -l ~/classified/topology.dat`',
          ],
          solution: 'wc -l ~/classified/topology.dat',
          xp: 15,
        },

        // ── LEVEL 4: grep ── (easy-medium)
        {
          id: 'grep-search',
          narration: 'Line count confirmed. Now HQ needs something specific: the entry for `localhost` — the loopback address. Every hosts file has it, but they want confirmation it\'s in your extracted copy.\n\n  `grep` searches a file for lines that match a pattern and prints only the matching lines. It\'s one of the most powerful tools in the terminal — used constantly in debugging, log analysis, and data extraction.\n\n  Format: `grep "pattern" <file>`\n\n  Search the topology file for "localhost".',
          objective: 'Run `grep "localhost" ~/classified/topology.dat` to find the localhost entry.',
          verify: {
            mode: 'shell',
            command: 'grep "localhost" ~/classified/topology.dat',
            custom: ({ stdout, stderr, exitCode }, input) => {
              if (!/\bgrep\b/.test(input)) return { ok: false, reason: 'use grep to search the file' };
              if (!/localhost/.test(input)) return { ok: false, reason: 'search for "localhost" in the file' };
              if (exitCode === 2) return { ok: false, reason: stderr || 'grep failed — check the file path' };
              return { ok: true };
            },
          },
          hints: [
            '`grep` filters a file by pattern — it prints only the lines that match. It\'s faster than reading the whole file.',
            'Put your search term in quotes, then the file path.',
            'Run: `grep "localhost" ~/classified/topology.dat`',
          ],
          xp: 25,
        },

        // ── LEVEL 5: grep -i and grep -c ── (medium)
        {
          id: 'grep-flags',
          narration: 'Found it. Now a harder search: count how many entries in the file contain "127" — the loopback range. Some systems alias multiple names to 127.0.0.1.\n\n  `grep` has two useful flags for this:\n  `-i` makes the search case-insensitive (so "Local" and "local" both match)\n  `-c` counts matching lines instead of printing them\n\n  Together: `grep -c "pattern" file` returns a number — exactly what HQ wants.\n\n  Count how many lines contain "127".',
          objective: 'Run `grep -c "127" ~/classified/topology.dat` to count matching entries.',
          verify: {
            mode: 'shell',
            command: 'grep -c "127" ~/classified/topology.dat',
            custom: ({ stdout, exitCode }, input) => {
              if (!/\bgrep\b/.test(input)) return { ok: false, reason: 'use grep to count matches' };
              if (!/-c/.test(input)) return { ok: false, reason: 'use the -c flag to count matching lines' };
              if (exitCode === 2) return { ok: false, reason: 'grep failed — check the file path' };
              return { ok: true };
            },
          },
          hints: [
            '`grep -c` counts how many lines match the pattern instead of printing them. One number out.',
            'Search for "127" — the loopback address range.',
            'Run: `grep -c "127" ~/classified/topology.dat`',
          ],
          xp: 25,
        },

        // ── LEVEL 6: find ── (medium)
        {
          id: 'find-files',
          narration: 'Count confirmed. HQ asks: how many files have you extracted total? Not just what\'s in `~/classified/` — you need to know if any other text files were created anywhere under your home directory during this operation.\n\n  `find` searches for files and directories recursively — it crawls through a directory tree and returns everything that matches your criteria.\n\n  Format: `find <start-dir> -name "pattern" -type f`\n\n  `-name` matches filenames (supports wildcards like `*.txt`)\n  `-type f` means "files only" (not directories)\n\n  Find all text files under your home directory.',
          objective: 'Run `find ~ -name "*.txt" -type f` to locate all text files in your home directory.',
          verify: {
            mode: 'shell',
            command: 'find ~ -name "*.txt" -type f',
            custom: ({ stdout, stderr, exitCode }, input) => {
              if (!/\bfind\b/.test(input)) return { ok: false, reason: 'use the find command' };
              if (!/\*\.txt|"?\*\.txt/.test(input) && !/\.txt/.test(input)) return { ok: false, reason: 'search for *.txt files' };
              if (exitCode !== 0 && !stdout.trim()) return { ok: false, reason: stderr || 'find failed' };
              return { ok: true };
            },
          },
          hints: [
            '`find` recursively searches a directory for files matching criteria. `-name "*.txt"` matches any file ending in .txt. `-type f` limits to files (not directories).',
            'Start the search from your home directory `~` to cover everything.',
            'Run: `find ~ -name "*.txt" -type f`',
          ],
          xp: 30,
        },

        // ── LEVEL 7: >> append ── (medium)
        {
          id: 'append-log',
          narration: 'All files located. Now update your mission log with a status entry — but don\'t overwrite what\'s already there.\n\n  Earlier you used `>` to create a file. Using `>` again on the same file would erase everything and start fresh. That\'s destructive.\n\n  `>>` is the append operator. It adds to the end of an existing file without touching what\'s already there. This is how logs are written — each event appended to the bottom, chronologically.\n\n  Format: `echo "text" >> file.txt`\n\n  Add a status line to your mission log.',
          objective: 'Run `echo "STATUS: INTEL CONFIRMED" >> ~/classified/mission-log.txt` to append a status entry.',
          verify: {
            mode: 'shell',
            command: 'cat ~/classified/mission-log.txt',
            custom: ({ stdout, exitCode }, input) => {
              if (!/\becho\b/.test(input)) return { ok: false, reason: 'use echo to write the entry' };
              if (!/>/.test(input)) return { ok: false, reason: 'use >> to append without overwriting' };
              if (/[^>]>[^>]/.test(input)) return { ok: false, reason: 'use >> (double arrow) to append — a single > would overwrite the file' };
              if (!/mission-log/.test(input)) return { ok: false, reason: 'append to ~/classified/mission-log.txt' };
              if (exitCode !== 0) return { ok: false, reason: 'command failed' };
              return { ok: true };
            },
          },
          hints: [
            '`>>` appends to a file — it adds to the end without erasing. `>` overwrites. Always use `>>` for logs.',
            'Use echo with >> to add the status entry to your mission log.',
            'Run: `echo "STATUS: INTEL CONFIRMED" >> ~/classified/mission-log.txt`',
          ],
          xp: 25,
        },

        // ── LEVEL 8: man pages ── (medium-hard, via prompt)
        {
          id: 'man-pages',
          narration: 'You\'ve learned a lot of commands in the last two missions. But HQ doesn\'t want you dependent on a trainer forever.\n\n  Every command installed on a Unix system has a built-in manual: the `man` page. Run `man <command>` and you get the full documentation — every flag, every option, every example. It opens in a pager (`less`). Press `space` to scroll down, `b` to go back, and `q` to quit.\n\n  The manual is always available. No internet required. No Stack Overflow. Just `man`.\n\n  Try it: `man grep` — find out what flag makes grep search recursively through directories.\n\n  (Press `q` to exit the manual when you\'re done.)',
          objective: 'What flag makes `grep` search recursively through directories?',
          verify: {
            mode: 'prompt',
            choices: ['-r or -R', '-i', '-c', '-v'],
            answers: ['-r or -R'],
          },
          hints: [
            'Run `man grep` to open the manual. Use the arrow keys or space to scroll. Look for "DESCRIPTION" or "OPTIONS" sections.',
            'You\'re looking for the flag that means "recursive" — searching through subdirectories as well as the given directory.',
            'It\'s `-r` (or `-R` on some systems). Open the manual with `man grep` and find it yourself.',
          ],
          xp: 30,
        },

        // ── BRANCH: choose your ending ──
        {
          type: 'branch',
          id: 'final-choice',
          narration: 'Mission log complete. Intel analyzed. You know the system. HQ is waiting.\n\n  Two ways to close this operation. Choose.',
          branches: [
            {
              label: 'Destroy the evidence — leave no trace',
              flavor: 'Clean exit. No files, no trail, no evidence you were here.',
              steps: [
                {
                  id: 'rm-evidence',
                  narration: 'The cleanest exit: remove every file you created. `rm` — remove — deletes files permanently. There\'s no Trash, no undo. Once it\'s gone, it\'s gone.\n\n  Be precise. Never run `rm` on a path you haven\'t verified. Professional operators always `ls` a directory before `rm`-ing anything from it.\n\n  You created all the files in `~/classified/`. Remove the staging directory and everything in it using `rm -r` (recursive — removes directories and their contents).',
                  objective: 'Run `rm -r ~/classified` to remove your entire staging directory.',
                  verify: {
                    mode: 'shell',
                    command: 'ls ~',
                    custom: ({ stdout, exitCode }, input) => {
                      if (!/\brm\b/.test(input)) return { ok: false, reason: 'use rm to delete the files' };
                      if (!/classified/.test(input)) return { ok: false, reason: 'remove ~/classified — your staging directory' };
                      if (exitCode !== 0) return { ok: false, reason: 'rm failed — check the path' };
                      if (stdout.includes('classified')) return { ok: false, reason: 'classified directory still exists — did the rm command succeed?' };
                      return { ok: true };
                    },
                  },
                  hints: [
                    '`rm` deletes files. `rm -r` removes directories and everything inside them recursively. Use with precision.',
                    'Remove the entire classified directory: rm -r ~/classified',
                    'Run: `rm -r ~/classified`',
                  ],
                  xp: 30,
                },
                {
                  id: 'verify-clean',
                  narration: 'Done. The staging area is gone. No extracted files, no mission logs, no trace.\n\n  One last confirmation: verify your home directory is clean.',
                  objective: 'Run `ls ~` to confirm the classified directory is gone.',
                  verify: {
                    mode: 'shell',
                    command: 'ls ~',
                    custom: ({ stdout, exitCode }, input) => {
                      if (!/\bls\b/.test(input)) return { ok: false, reason: 'use ls to verify' };
                      if (exitCode !== 0) return { ok: false, reason: 'ls failed' };
                      if (stdout.includes('classified')) return { ok: false, reason: 'classified directory still exists — run rm -r ~/classified first' };
                      return { ok: true };
                    },
                  },
                  hints: [
                    'Check your home directory. The classified folder should be gone.',
                    'ls ~ lists your home directory contents.',
                    'Run: `ls ~`',
                  ],
                  xp: 20,
                },
                {
                  id: 'clean-exit',
                  narration: 'Clean. No trace. The system looks exactly as it did before you arrived.\n\n  That\'s the professional standard: maximum intelligence, minimum footprint. You went in, took what you needed, and left nothing behind.\n\n  You\'ve now used `echo`, `mv`, `wc`, `grep`, `find`, `>>`, `rm`, and `man`. These are the core tools of every terminal operator — the commands that separate someone who uses the terminal from someone who commands it.\n\n  **OPERATION: COVER BURN — STATUS: COMPLETE. NO TRACE DETECTED.**',
                  objective: 'Run `echo "OPERATION: COVER BURN — COMPLETE"` to mark the mission closed.',
                  verify: {
                    mode: 'shell',
                    command: 'echo "OPERATION: COVER BURN — COMPLETE"',
                    custom: ({ exitCode }, input) => {
                      if (!/\becho\b/.test(input)) return { ok: false, reason: 'use echo to send the final signal' };
                      if (exitCode !== 0) return { ok: false, reason: 'echo failed' };
                      return { ok: true };
                    },
                  },
                  hints: [
                    'Send the all-clear with echo.',
                    'echo followed by your message in quotes.',
                    'Run: `echo "OPERATION: COVER BURN — COMPLETE"`',
                  ],
                  xp: 25,
                },
              ],
            },
            {
              label: 'Consolidate and transmit — send the full report',
              flavor: 'Maximum value. Combine everything into one file and get it out.',
              steps: [
                {
                  id: 'consolidate',
                  narration: 'Better play: don\'t destroy the data. Consolidate it. Combine all your extracted files into one master report using `cat` with a wildcard and output redirection.\n\n  `cat` can read multiple files at once and stream them all to stdout. Redirect that stream with `>` into a single output file.\n\n  Format: `cat ~/classified/*.dat ~/classified/*.txt > ~/classified/full-report.txt`\n\n  The `*` is a wildcard — it matches any filename with that extension. This combines every `.dat` and `.txt` file in your staging area into one document.',
                  objective: 'Run `cat ~/classified/*.dat ~/classified/*.txt > ~/classified/full-report.txt` to consolidate the intel.',
                  verify: {
                    mode: 'shell',
                    command: 'ls ~/classified',
                    custom: ({ stdout, exitCode }, input) => {
                      if (!/\bcat\b/.test(input)) return { ok: false, reason: 'use cat to combine the files' };
                      if (!/>/.test(input)) return { ok: false, reason: 'use > to redirect the combined output into a file' };
                      if (!/full-report/.test(input)) return { ok: false, reason: 'save to ~/classified/full-report.txt' };
                      if (exitCode !== 0) return { ok: false, reason: 'command failed — check the file paths' };
                      if (!stdout.includes('full-report')) return { ok: false, reason: 'full-report.txt not found — did the redirect succeed?' };
                      return { ok: true };
                    },
                  },
                  hints: [
                    '`cat` can read multiple files in sequence. Combine it with `>` to write all of them into one output file.',
                    'Use a wildcard `*` to match all .dat and .txt files in ~/classified/',
                    'Run: `cat ~/classified/*.dat ~/classified/*.txt > ~/classified/full-report.txt`',
                  ],
                  xp: 35,
                },
                {
                  id: 'count-report',
                  narration: 'Report consolidated. Before transmitting, verify the total line count — HQ wants to confirm the full document landed intact.',
                  objective: 'Run `wc -l ~/classified/full-report.txt` to count the total lines in the combined report.',
                  verify: {
                    mode: 'shell',
                    command: 'wc -l ~/classified/full-report.txt',
                    custom: ({ stdout, exitCode }, input) => {
                      if (!/\bwc\b/.test(input)) return { ok: false, reason: 'use wc -l to count lines' };
                      if (exitCode !== 0) return { ok: false, reason: 'wc failed — does full-report.txt exist?' };
                      if (!stdout.trim()) return { ok: false, reason: 'no output — check the path' };
                      return { ok: true };
                    },
                  },
                  hints: [
                    '`wc -l` counts lines. Use it to get the total line count of your consolidated report.',
                    'Point it at full-report.txt in ~/classified/',
                    'Run: `wc -l ~/classified/full-report.txt`',
                  ],
                  xp: 20,
                },
                {
                  id: 'transmit-exit',
                  narration: 'Line count confirmed. Report is complete. HQ has the full picture.\n\n  You combined `cat`, wildcards, and output redirection to consolidate multiple files into one clean document. That\'s professional data handling — the same technique used in log aggregation, data pipelines, and every serious shell script.\n\n  You\'ve now used `echo`, `mv`, `wc`, `grep`, `find`, `>>`, `cat` with wildcards, and `man`. These are the commands that make the terminal a precision instrument.\n\n  **OPERATION: COVER BURN — STATUS: COMPLETE. REPORT TRANSMITTED.**',
                  objective: 'Run `grep -c "" ~/classified/full-report.txt` to confirm the report\'s total entry count.',
                  verify: {
                    mode: 'shell',
                    command: 'grep -c "" ~/classified/full-report.txt',
                    custom: ({ stdout, exitCode }, input) => {
                      if (!/\bgrep\b/.test(input) && !/\bwc\b/.test(input)) return { ok: false, reason: 'use grep or wc to get the count' };
                      if (exitCode !== 0) return { ok: false, reason: 'command failed' };
                      return { ok: true };
                    },
                  },
                  hints: [
                    '`grep -c ""` counts all lines in a file (an empty pattern matches everything). Alternatively, `wc -l` does the same.',
                    'Point it at full-report.txt for the final count.',
                    'Run: `grep -c "" ~/classified/full-report.txt`',
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
