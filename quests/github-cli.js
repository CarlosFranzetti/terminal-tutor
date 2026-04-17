// Quest pack: GitHub CLI — "Escape the Merge Conflict Dungeon"
// Teaches: install/verify, auth status, repo creation, PR, issue review.

export default {
  id: 'github-cli',
  title: 'Escape the Merge Conflict Dungeon',
  synopsis: 'Master the GitHub CLI (`gh`) — install, auth, repos, and pull requests.',
  tool: 'gh',
  steps: [
    {
      id: 'verify-install',
      narration:
        "You wake in a stone cell. A flickering torch reveals a command etched into the wall: `gh`. Before you can escape, you must confirm the blade even exists on your belt.",
      objective: 'Confirm the `gh` binary is installed on your PATH.',
      verify: { mode: 'which', binary: 'gh' },
      hints: [
        'Before you wield a tool, you must know it is within reach.',
        'Your shell has a way of asking "where does this command live?"',
        'Try running: `which gh` (or `where gh` on Windows).'
      ],
      xp: 25
    },
    {
      id: 'check-version',
      narration:
        "The blade is real. But dull blades cut no ropes. You need to read the runes engraved in its steel — its version and build.",
      objective: 'Print the installed version of `gh`.',
      verify: {
        mode: 'shell',
        exitCode: 0,
        stdoutMatches: 'gh version'
      },
      hints: [
        'Most command-line tools will tell you their version if you ask politely.',
        'The conventional polite phrasing uses the word `version`.',
        'Try: `gh --version`'
      ],
      xp: 20
    },
    {
      id: 'auth-status',
      narration:
        "A shadowy gatekeeper steps out. 'Name yourself, traveler, or no repository shall open to you.' The CLI keeps a ledger of who you are logged in as — you must consult it.",
      objective: 'Check your GitHub authentication status.',
      verify: {
        mode: 'shell',
        stdoutContains: 'github.com',
        custom: (r) => ({
          ok: /github\.com/i.test(r.stdout + r.stderr),
          reason: 'expected output to mention github.com (logged in or not logged in)'
        })
      },
      hints: [
        'The CLI has a whole sub-command family devoted to identity.',
        'It begins with `gh auth`.',
        'Try: `gh auth status`'
      ],
      xp: 30
    },
    {
      id: 'find-repo-help',
      narration:
        "A passage opens. Inside: dozens of doors, each labeled `repo`. Before you open any, you should learn the spells of the `repo` subcommand.",
      objective: 'List the `repo` sub-commands (help page).',
      verify: {
        mode: 'shell',
        stdoutContains: 'create',
        exitCode: 0
      },
      hints: [
        'Every `gh` subcommand has its own `--help`.',
        'You are looking at the `repo` family — so ask it for help.',
        'Try: `gh repo --help`'
      ],
      xp: 25
    },
    {
      id: 'view-remote-repo',
      narration:
        "A great vault door reads: `cli/cli`. The CLI can peek at any public repo. Spy on it before you decide whether to mirror its magic.",
      objective: 'Print metadata for the public repo `cli/cli`.',
      verify: {
        mode: 'shell',
        stdoutContains: 'cli/cli',
        exitCode: 0
      },
      hints: [
        'You want to *view* a *repo*.',
        'The subcommand almost writes itself: `gh repo view`.',
        'Try: `gh repo view cli/cli`'
      ],
      xp: 30
    },
    {
      id: 'list-issues',
      narration:
        "Deeper in the dungeon a pile of scrolls spills from a cracked chest — open issues, unanswered. You must learn to read them at a glance.",
      objective: 'List open issues on the `cli/cli` repository (any number is fine).',
      verify: {
        mode: 'shell',
        exitCode: 0,
        custom: (r) => ({
          ok: /#\d+|No issues|OPEN|TITLE/i.test(r.stdout),
          reason: 'expected output to look like an issue list'
        })
      },
      hints: [
        'There is a whole `gh issue` family.',
        'You want to *list* issues of a specific repo.',
        'Try: `gh issue list --repo cli/cli --limit 5`'
      ],
      xp: 35
    },
    {
      id: 'pr-concept',
      narration:
        "Before the final door you hear a riddle echoing: 'What is a Pull Request, really, in the grammar of git?' Answer wisely.",
      objective: 'Pick the best definition of a pull request.',
      verify: {
        mode: 'prompt',
        choices: [
          'A way to download a repository to your machine',
          'A proposal to merge one branch into another, open to review',
          'A command that rebases main onto your feature branch automatically',
          'An alias for `git fetch --all`'
        ],
        answer: 'A proposal to merge one branch into another, open to review'
      },
      hints: [
        'A PR is a *social* artifact, not just a git operation.',
        'It lives on the server and invites review.',
        'It proposes merging one branch into another.'
      ],
      xp: 20
    },
    {
      id: 'pr-help',
      narration:
        "The gate opens onto a long hallway of PR spells. Before casting any, survey the available incantations.",
      objective: 'Show the help page for the `gh pr` subcommand.',
      verify: {
        mode: 'shell',
        stdoutContains: 'create',
        exitCode: 0
      },
      hints: [
        'Same pattern as before — each subcommand has its own help.',
        'You want the pr family.',
        'Try: `gh pr --help`'
      ],
      xp: 20
    },
    {
      id: 'victory-torch',
      narration:
        "A final torch lights itself as you pass. To seal your escape, etch your name into the dungeon wall — any shell echo will do.",
      objective: 'Print a line that includes the phrase `merge conflict dungeon`.',
      verify: {
        mode: 'shell',
        exitCode: 0,
        stdoutContains: 'merge conflict dungeon'
      },
      hints: [
        '`echo` is your friend here.',
        'You can use single or double quotes.',
        'Try: `echo "escaped the merge conflict dungeon"`'
      ],
      xp: 40
    }
  ]
};
