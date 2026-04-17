// Quest pack: GitHub Copilot CLI — "Summon the Copilot"
// Teaches: install/verify, auth, and three core prompts (explain/suggest/run).

export default {
  id: 'copilot-cli',
  title: 'Summon the Copilot',
  synopsis: "Call a pair programmer into your terminal with GitHub Copilot's CLI.",
  tool: 'gh copilot',
  steps: [
    {
      id: 'gh-present',
      narration:
        "A Copilot cannot fly without a runway. First, confirm the `gh` runway is under your feet.",
      objective: 'Confirm the base `gh` binary is installed.',
      verify: { mode: 'which', binary: 'gh' },
      hints: [
        'You need `gh` before the Copilot extension will run.',
        'Ask your shell where the binary lives.',
        'Try: `which gh`'
      ],
      xp: 20
    },
    {
      id: 'extension-list',
      narration:
        "Copilot lives as an *extension* of the GitHub CLI. Look into your tool belt and list what is already installed.",
      objective: 'List installed `gh` extensions (even if the list is empty).',
      verify: {
        mode: 'shell',
        exitCode: 0
      },
      hints: [
        'There is a whole `gh extension` subcommand family.',
        'You want to *list* the extensions.',
        'Try: `gh extension list`'
      ],
      xp: 20
    },
    {
      id: 'copilot-concept',
      narration:
        "Before you summon it, answer: what is the Copilot CLI *for*, in one sentence?",
      objective: 'Pick the best description of the GitHub Copilot CLI.',
      verify: {
        mode: 'prompt',
        choices: [
          'An AI pair programmer that suggests and explains shell commands in your terminal',
          'A service that auto-merges your pull requests',
          'A lightweight IDE for git',
          'A chatbot for filing GitHub issues'
        ],
        answer: 'An AI pair programmer that suggests and explains shell commands in your terminal'
      },
      hints: [
        'Copilot is an AI.',
        'It runs *in your terminal*, not in a browser.',
        'Its job is to help you write and understand shell commands.'
      ],
      xp: 20
    },
    {
      id: 'copilot-help',
      narration:
        "The incantation for the summoning is `gh copilot`. Before you summon, read its tome of spells.",
      objective: 'Show the help page for `gh copilot`.',
      verify: {
        mode: 'shell',
        exitCode: 0,
        custom: (r) => ({
          ok: /copilot|Usage|COMMANDS|Available/i.test(r.stdout + r.stderr),
          reason: 'expected help text — contains usage or command names'
        })
      },
      hints: [
        '`gh` is the caster, `copilot` is the spell.',
        'Every subcommand in `gh` responds to `--help`.',
        'Try: `gh copilot --help`'
      ],
      xp: 25
    },
    {
      id: 'auth-reminder',
      narration:
        "Even an AI Copilot refuses to fly for strangers. Check whether `gh` knows who you are.",
      objective: 'Print your `gh` auth status.',
      verify: {
        mode: 'shell',
        custom: (r) => ({
          ok: /github\.com|Logged in|not logged|status/i.test(r.stdout + r.stderr),
          reason: 'expected auth status output (logged in or not)'
        })
      },
      hints: [
        'Same subcommand family as the GitHub CLI quest.',
        'It starts with `gh auth`.',
        'Try: `gh auth status`'
      ],
      xp: 20
    },
    {
      id: 'explain-prompt',
      narration:
        "The Copilot lands. Its first gift is the power to *explain* commands you do not understand. Echo a command you'd like demystified — even a simple one.",
      objective: 'Print a command string you would like explained (using `echo`).',
      verify: {
        mode: 'shell',
        exitCode: 0,
        stdoutMatches: '.+'
      },
      hints: [
        'Pretend you are about to ask Copilot "what does this do?"',
        'Echo the command you would paste in.',
        'Try: `echo "tar -czvf archive.tar.gz ./src"`'
      ],
      xp: 25
    },
    {
      id: 'suggest-prompt',
      narration:
        "The Copilot's second gift: it *suggests* commands from plain English. Ask it (in your own voice, via echo) for a command that does something useful.",
      objective: 'Print a natural-language request (containing the word "how").',
      verify: {
        mode: 'shell',
        exitCode: 0,
        stdoutContains: 'how'
      },
      hints: [
        'Write the sentence you would put after `gh copilot suggest`.',
        'It should start with "how do I…" or include "how".',
        'Try: `echo "how do I find large files in my home directory"`'
      ],
      xp: 25
    },
    {
      id: 'run-prompt',
      narration:
        "The third gift: *run*. Copilot can execute a command it suggests, with your consent. Echo a safe command you'd let it run.",
      objective: 'Print a safe command involving `ls`.',
      verify: {
        mode: 'shell',
        exitCode: 0,
        stdoutContains: 'ls'
      },
      hints: [
        'Keep it read-only — nothing destructive.',
        '`ls -la` or `ls -1` are good candidates.',
        'Try: `echo "ls -la"`'
      ],
      xp: 25
    },
    {
      id: 'summon-banner',
      narration:
        "The Copilot bows. To seal the pact, etch the summoning phrase into the air of your terminal.",
      objective: 'Print a line containing "copilot summoned".',
      verify: {
        mode: 'shell',
        exitCode: 0,
        stdoutContains: 'copilot summoned'
      },
      hints: [
        'Use echo.',
        'Include the exact phrase `copilot summoned`.',
        'Try: `echo "copilot summoned"`'
      ],
      xp: 40
    }
  ]
};
