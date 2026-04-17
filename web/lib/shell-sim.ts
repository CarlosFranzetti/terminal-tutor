import type { ShellResult } from './types';

const SIMULATED: Record<string, ShellResult> = {
  'which gh': { stdout: '/usr/local/bin/gh\n', stderr: '', exitCode: 0 },
  'where gh': { stdout: '/usr/local/bin/gh\n', stderr: '', exitCode: 0 },

  'gh --version': {
    stdout: 'gh version 2.45.0 (2024-03-04)\nhttps://github.com/cli/gh\n',
    stderr: '',
    exitCode: 0,
  },

  'gh auth status': {
    stdout:
      'github.com\n' +
      '  ✓ Logged in to github.com as octocat (oauth_token)\n' +
      '  ✓ Git operations for github.com configured to use https protocol.\n' +
      '  ✓ Token: ghp_****\n',
    stderr: '',
    exitCode: 0,
  },

  'gh repo --help': {
    stdout:
      'Work with GitHub repositories\n\n' +
      'USAGE\n  gh repo <command> [flags]\n\n' +
      'COMMANDS\n' +
      '  create      Create a new repository\n' +
      '  clone       Clone a repository locally\n' +
      '  view        View a repository\n' +
      '  fork        Create a fork of a repository\n' +
      '  list        List repositories\n' +
      '  delete      Delete a repository\n' +
      '  edit        Edit repository settings\n\n' +
      'FLAGS\n  -h, --help   Show help for command\n',
    stderr: '',
    exitCode: 0,
  },

  'gh repo view cli/cli': {
    stdout:
      'cli/cli\n' +
      'The GitHub CLI\n\n' +
      'REPOSITORY\n' +
      '  Name:        cli\n' +
      "  Description: GitHub's official command line tool\n" +
      '  Visibility:  public\n' +
      '  Stars:       35,234\n' +
      '  Forks:       5,123\n' +
      '  Open issues: 287\n' +
      '  Language:    Go\n' +
      '  URL:         https://github.com/cli/cli\n',
    stderr: '',
    exitCode: 0,
  },

  'gh issue list --repo cli/cli --limit 5': {
    stdout:
      'Showing 5 of 287 open issues in cli/cli\n\n' +
      'TITLE                                     NUMBER  OPENED\n' +
      'fix: completion for gh pr list            #9125   about 2 days ago\n' +
      'feat: support --jq for gh run view        #9122   about 3 days ago\n' +
      'bug: auth token not refreshed properly    #9118   about 4 days ago\n' +
      'docs: update auth documentation           #9114   about 5 days ago\n' +
      'refactor: simplify http client            #9110   about 6 days ago\n',
    stderr: '',
    exitCode: 0,
  },

  'gh pr --help': {
    stdout:
      'Manage pull requests\n\n' +
      'USAGE\n  gh pr <command> [flags]\n\n' +
      'COMMANDS\n' +
      '  checkout    Check out a pull request\n' +
      '  checks      Show CI status for a pull request\n' +
      '  close       Close a pull request\n' +
      '  comment     Add a comment to a pull request\n' +
      '  create      Create a pull request\n' +
      '  diff        View changes in a pull request\n' +
      '  list        List pull requests\n' +
      '  merge       Merge a pull request\n' +
      '  review      Add a review to a pull request\n' +
      '  status      Show status of relevant pull requests\n' +
      '  view        View a pull request\n\n' +
      'FLAGS\n  -h, --help   Show help for command\n',
    stderr: '',
    exitCode: 0,
  },

  'gh extension list': {
    stdout: 'INSTALLED EXTENSIONS\n(none installed)\n',
    stderr: '',
    exitCode: 0,
  },

  'gh copilot --help': {
    stdout:
      'Your AI-powered CLI experience.\n\n' +
      'Usage:\n  gh copilot [command]\n\n' +
      'Available Commands:\n' +
      '  explain     Explain a command\n' +
      '  suggest     Suggest a command based on a description\n' +
      '  config      Configure options\n\n' +
      'Flags:\n  -h, --help   help for copilot\n\n' +
      'Use "gh copilot [command] --help" for more information about a command.\n',
    stderr: '',
    exitCode: 0,
  },
};

export function runCommand(cmd: string): ShellResult {
  const trimmed = cmd.trim();

  // Exact match first
  if (SIMULATED[trimmed]) return SIMULATED[trimmed];

  // echo <args> → return args as stdout
  if (trimmed.startsWith('echo ')) {
    const raw = trimmed.slice(5).trim();
    const unquoted = raw.replace(/^["'](.*)["']$/, '$1');
    return { stdout: unquoted + '\n', stderr: '', exitCode: 0 };
  }

  // which <binary> → always found
  if (/^which\s+\S+/.test(trimmed) || /^where\s+\S+/.test(trimmed)) {
    const binary = trimmed.split(/\s+/)[1];
    return { stdout: `/usr/local/bin/${binary}\n`, stderr: '', exitCode: 0 };
  }

  // gh <anything> — generic gh success (covers extension list variations etc.)
  if (trimmed.startsWith('gh ')) {
    return {
      stdout: `gh: executed "${trimmed}" successfully\n`,
      stderr: '',
      exitCode: 0,
    };
  }

  // Unknown command
  const cmdName = trimmed.split(/\s+/)[0];
  return {
    stdout: '',
    stderr: `${cmdName}: command not found\n`,
    exitCode: 127,
  };
}
