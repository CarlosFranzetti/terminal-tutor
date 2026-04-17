import type { ShellResult } from './types';

// ─── Simulated filesystem state ───────────────────────────────────────────────
// Represents ~/games/street-racer — the project the new-hire is shipping.
const FS: Record<string, string> = {
  '.': 'dir',
  'src': 'dir',
  'src/game.js': 'file',
  'src/physics.js': 'file',
  'src/world.js': 'file',
  'src/player.js': 'file',
  'src/npc.js': 'file',
  'src/vehicles.js': 'file',
  'assets': 'dir',
  'assets/textures': 'dir',
  'assets/sounds': 'dir',
  'assets/models': 'dir',
  'package.json': 'file',
  'package-lock.json': 'file',
  'README.md': 'file',
  'index.html': 'file',
  'CHANGELOG.md': 'file',
  '.gitignore': 'file',
  'node_modules': 'dir',
  '.git': 'dir',
};

const FILE_CONTENTS: Record<string, string> = {
  'README.md':
    '# StreetRacer Unlimited\n\nOpen-world street racing game. GTA but make it Fast & Furious.\n\n## Play\n```\nnpm install\nnpm start\n```\n\n## Stack\nThree.js, Cannon.js, Web Audio API\n\n## Status\nBeta — ready to ship 🚀\n',
  'package.json':
    '{\n  "name": "street-racer-unlimited",\n  "version": "0.9.0",\n  "description": "Open-world street racing — ship it.",\n  "scripts": {\n    "start": "vite",\n    "build": "vite build"\n  },\n  "dependencies": {\n    "three": "^0.163.0",\n    "cannon-es": "^0.20.0"\n  }\n}\n',
  '.gitignore':
    'node_modules/\ndist/\n.env\n*.log\n',
  'CHANGELOG.md':
    '# Changelog\n\n## 0.9.0\n- Added 12 new cars\n- Fixed physics jitter on bridges\n- Tuned NPC aggression\n- Map expanded by 40%\n\n## 0.8.0\n- Multiplayer lobby (beta)\n- Radio system\n',
  'index.html':
    '<!DOCTYPE html>\n<html>\n  <head><title>StreetRacer Unlimited</title></head>\n  <body>\n    <canvas id="game"></canvas>\n    <script type="module" src="/src/game.js"></script>\n  </body>\n</html>\n',
};

// ─── Git state (progressive as the quest advances) ───────────────────────────
const GIT_STATUS_CLEAN =
  'On branch main\nYour branch is up to date with \'origin/main\'.\n\nnothing to commit, working tree clean\n';

const GIT_STATUS_DIRTY =
  'On branch main\n\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n\n\tmodified:   src/player.js\n\tmodified:   src/vehicles.js\n\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)\n\n\tCHANGELOG.md\n\nno changes added to commit (use "git add" or "git commit -a")\n';

const GIT_STATUS_STAGED =
  'On branch main\n\nChanges to be committed:\n  (use "git restore --staged <file>..." to unstage)\n\n\tmodified:   src/player.js\n\tmodified:   src/vehicles.js\n\tnew file:   CHANGELOG.md\n';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function lsSimple(path = '.'): string {
  const entries = Object.keys(FS)
    .filter(k => {
      if (path === '.') return !k.includes('/') && k !== '.';
      return k.startsWith(path + '/') && !k.slice(path.length + 1).includes('/');
    })
    .map(k => {
      const name = k.includes('/') ? k.split('/').pop()! : k;
      return FS[k] === 'dir' ? name + '/' : name;
    });
  return entries.join('  ') + '\n';
}

function lsLong(path = '.'): string {
  const rows: string[] = ['total 96'];
  const entries = Object.keys(FS)
    .filter(k => {
      if (path === '.') return !k.includes('/') && k !== '.';
      return k.startsWith(path + '/') && !k.slice(path.length + 1).includes('/');
    });

  // Add . and ..
  rows.push('drwxr-xr-x  8 carlos  staff   256 Apr 16 09:03 .');
  rows.push('drwxr-xr-x  3 carlos  staff    96 Apr 15 18:22 ..');

  for (const k of entries) {
    const name = k.includes('/') ? k.split('/').pop()! : k;
    const isDir = FS[k] === 'dir';
    const perm = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
    const size = isDir ? ' 192' : ' ' + (200 + name.length * 7);
    rows.push(`${perm}  2 carlos  staff  ${size} Apr 16 08:55 ${name}`);
  }
  return rows.join('\n') + '\n';
}

// ─── Command table ────────────────────────────────────────────────────────────
type Handler = (args: string[], raw: string) => ShellResult;

const ok = (stdout: string): ShellResult => ({ stdout, stderr: '', exitCode: 0 });
const err = (stderr: string, code = 1): ShellResult => ({ stdout: '', stderr, exitCode: code });

const HANDLERS: Array<[RegExp, Handler]> = [

  // ── Navigation / filesystem ───────────────────────────────────────────────
  [/^ls(\s|$)/, (args) => {
    const showHidden = args.includes('-a') || args.includes('-la') || args.includes('-al');
    const showLong   = args.some(a => a.startsWith('-') && a.includes('l'));
    const path = args.find(a => !a.startsWith('-')) || '.';

    if (showLong) {
      let out = lsLong(path);
      if (!showHidden) out = out.split('\n').filter(l => !/ \.$| \.\.$| \.\w/.test(l)).join('\n') + '\n';
      return ok(out);
    }
    let out = lsSimple(path);
    if (!showHidden) out = out.split('  ').filter(n => !n.trim().startsWith('.')).join('  ');
    return ok(out + '\n');
  }],

  [/^pwd$/, () => ok('/Users/carlos/games/street-racer\n')],

  [/^cd(\s|$)/, (args) => {
    const target = args[0] || '~';
    if (target === '~' || target === '') return ok('');
    // Check if directory exists in our simulated FS
    const exists = target === '..' || target === '.' || Object.keys(FS).some(k => k === target && FS[k] === 'dir');
    if (!exists) return err(`cd: no such file or directory: ${target}\n`);
    return ok('');
  }],

  [/^mkdir\s+/, (args) => {
    if (!args[0]) return err('mkdir: missing operand\n');
    return ok('');
  }],

  [/^touch\s+/, () => ok('')],

  [/^cat\s+/, (args) => {
    const file = args[0];
    if (!file) return err('cat: missing operand\n');
    const content = FILE_CONTENTS[file];
    if (content) return ok(content);
    if (FS[file] === 'dir') return err(`cat: ${file}: Is a directory\n`);
    if (FS[file] === 'file') return ok(`[contents of ${file}]\n`);
    return err(`cat: ${file}: No such file or directory\n`);
  }],

  [/^rm\s+/, (args) => {
    if (!args[0]) return err('rm: missing operand\n');
    return ok('');
  }],

  [/^cp\s+/, (args) => {
    if (args.length < 2) return err('cp: missing destination\n');
    return ok('');
  }],

  [/^mv\s+/, (args) => {
    if (args.length < 2) return err('mv: missing destination\n');
    return ok('');
  }],

  [/^grep\s+/, (args) => {
    if (!args[0]) return err('grep: missing pattern\n');
    return ok(`src/player.js:  // ${args[0]} found here\nsrc/game.js:  // ${args[0]} referenced\n`);
  }],

  [/^find\s+/, () => ok('src/game.js\nsrc/physics.js\nsrc/world.js\nsrc/player.js\nsrc/npc.js\nsrc/vehicles.js\n')],

  [/^which\s+/, (args) => ok(`/usr/local/bin/${args[0]}\n`)],
  [/^where\s+/, (args) => ok(`/usr/local/bin/${args[0]}\n`)],

  [/^echo(\s|$)/, (args, raw) => {
    const content = raw.replace(/^echo\s*/, '').replace(/^["']|["']$/g, '');
    return ok(content + '\n');
  }],

  [/^clear$/, () => ok('\x1b[2J\x1b[H')],

  // ── Node / npm ────────────────────────────────────────────────────────────
  [/^node\s+--version$/, () => ok('v20.11.1\n')],
  [/^npm\s+--version$/, () => ok('10.2.4\n')],
  [/^npm\s+install/, () => ok('\nadded 247 packages in 3.4s\n')],
  [/^npm\s+run\s+build/, () => ok('\n> street-racer-unlimited@0.9.0 build\n> vite build\n\n✓ 47 modules transformed.\ndist/index.html  0.44 kB\ndist/assets/game-BxK9dL2f.js  1,024.32 kB\n\n✓ built in 4.21s\n')],
  [/^npm\s+start/, () => ok('\n> vite\n\n  VITE v5.2.0  ready in 312 ms\n\n  ➜  Local:   http://localhost:5173/\n  ➜  Network: use --host to expose\n')],

  // ── Git ───────────────────────────────────────────────────────────────────
  [/^git\s+status$/, () => ok(GIT_STATUS_DIRTY)],
  [/^git\s+status\s+/, () => ok(GIT_STATUS_DIRTY)],

  [/^git\s+add\s+/, () => ok('')],

  [/^git\s+commit/, (args) => {
    const msgMatch = args.join(' ').match(/-m\s+["']?(.+?)["']?$/);
    const msg = msgMatch ? msgMatch[1] : 'update';
    return ok(`[main 3f7a2d1] ${msg}\n 3 files changed, 47 insertions(+), 2 deletions(-)\n`);
  }],

  [/^git\s+push/, () =>
    ok('Enumerating objects: 8, done.\nCounting objects: 100% (8/8), done.\nDelta compression using up to 10 threads\nCompressing objects: 100% (5/5), done.\nWriting objects: 100% (5/5), 1.23 KiB | 1.23 MiB/s, done.\nTotal 5 (delta 2), reused 0 (delta 0), pack-reused 0\nTo https://github.com/carlosfranzetti/street-racer-unlimited.git\n   b84e975..3f7a2d1  main -> main\n')],

  [/^git\s+pull/, () => ok('Already up to date.\n')],

  [/^git\s+log/, () =>
    ok('commit 3f7a2d1a8b9c4e2f (HEAD -> main, origin/main)\nAuthor: Carlos Franzetti <carlosfranzetti@gmail.com>\nDate:   Thu Apr 16 09:15:42 2026\n\n    feat: final polish before launch\n\ncommit b84e975c3a2d1f0e\nAuthor: Carlos Franzetti <carlosfranzetti@gmail.com>\nDate:   Wed Apr 15 18:00:00 2026\n\n    initial commit: 47k lines of mayhem\n')],

  [/^git\s+init$/, () => ok('Initialized empty Git repository in /Users/carlos/games/street-racer/.git/\n')],

  [/^git\s+branch/, () => ok('* main\n')],

  [/^git\s+remote/, () => ok('origin\thttps://github.com/carlosfranzetti/street-racer-unlimited.git (fetch)\norigin\thttps://github.com/carlosfranzetti/street-racer-unlimited.git (push)\n')],

  [/^git\s+diff/, () => ok('diff --git a/src/player.js b/src/player.js\nindex 2c3d4e5..6f7a8b9 100644\n--- a/src/player.js\n+++ b/src/player.js\n@@ -42,6 +42,7 @@ class Player {\n   constructor() {\n     this.speed = 0;\n     this.health = 100;\n+    this.wantedLevel = 0;\n   }\n')],

  [/^git\s+clone/, () => ok('Cloning into \'street-racer-unlimited\'...\nremote: Enumerating objects: 1203, done.\nremote: Counting objects: 100% (1203/1203), done.\nReceiving objects: 100% (1203/1203), 14.2 MiB | 8.4 MiB/s, done.\n')],

  // ── GitHub CLI ────────────────────────────────────────────────────────────
  [/^gh\s+--version$/, () => ok('gh version 2.45.0 (2024-03-04)\nhttps://github.com/cli/gh\n')],

  [/^gh\s+auth\s+status$/, () =>
    ok('github.com\n  ✓ Logged in to github.com as carlosfranzetti (oauth_token)\n  ✓ Git operations for github.com configured to use https protocol.\n  ✓ Token: ghp_****\n')],

  [/^gh\s+auth\s+login/, () =>
    ok('? What account do you want to log into? GitHub.com\n✓ Authenticated to github.com as carlosfranzetti\n')],

  [/^gh\s+repo\s+create/, (args, raw) => {
    const name = args.find(a => !a.startsWith('--')) || 'street-racer-unlimited';
    const isPublic = raw.includes('--public');
    return ok(`✓ Created repository carlosfranzetti/${name} on GitHub\n  https://github.com/carlosfranzetti/${name}\n${isPublic ? '  Visibility: public\n' : ''}`)
  }],

  [/^gh\s+repo\s+view(\s|$)/, (args) => {
    const target = args.find(a => !a.startsWith('--')) || 'carlosfranzetti/street-racer-unlimited';
    return ok(`${target}\nStreetRacer Unlimited — open-world street racing\n\nREPOSITORY\n  Name:        street-racer-unlimited\n  Description: Open-world street racing game. GTA but make it Fast & Furious.\n  Visibility:  public\n  Stars:       1\n  Forks:       0\n  Open issues: 0\n  Language:    JavaScript\n  URL:         https://github.com/carlosfranzetti/street-racer-unlimited\n`);
  }],

  [/^gh\s+repo\s+--help$/, () =>
    ok('Work with GitHub repositories\n\nUSAGE\n  gh repo <command> [flags]\n\nCOMMANDS\n  create      Create a new repository\n  clone       Clone a repository locally\n  view        View a repository\n  fork        Create a fork\n  list        List repositories\n  delete      Delete a repository\n  edit        Edit repository settings\n\nFLAGS\n  -h, --help   Show help\n')],

  [/^gh\s+repo\s+list/, () =>
    ok('Showing repositories for carlosfranzetti\n\nNAME                         DESCRIPTION                UPDATED\ncarlosfranzetti/terminal-tutor  Story-driven CLI trainer   about 1 hour ago\n')],

  [/^gh\s+issue\s+list/, () =>
    ok('Showing 0 open issues\n\n(no issues yet — ship first, fix later)\n')],

  [/^gh\s+pr\s+--help$/, () =>
    ok('Manage pull requests\n\nUSAGE\n  gh pr <command> [flags]\n\nCOMMANDS\n  create      Create a pull request\n  list        List pull requests\n  merge       Merge a pull request\n  view        View a pull request\n  checkout    Check out a pull request\n  status      Show PR status\n\nFLAGS\n  -h, --help   Show help\n')],

  [/^gh\s+extension\s+list/, () => ok('INSTALLED EXTENSIONS\n(none installed)\n')],

  [/^gh\s+copilot\s+--help$/, () =>
    ok('Your AI-powered CLI experience.\n\nUsage:\n  gh copilot [command]\n\nAvailable Commands:\n  explain     Explain a command\n  suggest     Suggest a command based on a description\n  config      Configure options\n\nFlags:\n  -h, --help   help for copilot\n')],

  // Catch-all gh <anything>
  [/^gh\s+/, (_, raw) => ok(`gh: ran "${raw}" — exit 0\n`)],

  // ── Misc ──────────────────────────────────────────────────────────────────
  [/^man\s+/, (args) => ok(`${args[0]}(1) manual page\n\nNAME\n     ${args[0]} -- a command\n\nSYNOPSIS\n     ${args[0]} [options]\n\nDESCRIPTION\n     This is the simulated manual for ${args[0]}.\n`)],

  [/^history$/, () =>
    ok('  1  ls\n  2  git status\n  3  git add .\n  4  git commit -m "feat: ship it"\n  5  gh auth status\n  6  gh repo create carlosfranzetti/street-racer-unlimited --public\n  7  git push origin main\n  8  gh repo view\n')],

  [/^whoami$/, () => ok('carlos\n')],
  [/^date$/, () => ok(new Date().toString() + '\n')],
  [/^uname/, () => ok('Darwin MacBook-Pro-Carlos.local 23.4.0 Darwin Kernel Version 23.4.0\n')],
  [/^open\s+/, () => ok('')],
  [/^curl\s+/, () => ok('200 OK\n{"status":"live"}\n')],
];

// ─── Main export ──────────────────────────────────────────────────────────────
export function runCommand(cmd: string): ShellResult {
  const trimmed = cmd.trim();
  if (!trimmed) return ok('');

  const parts = trimmed.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
  const argv = parts.slice(1).map(p => p.replace(/^["']|["']$/g, ''));

  for (const [pattern, handler] of HANDLERS) {
    if (pattern.test(trimmed)) {
      try {
        return handler(argv, trimmed);
      } catch {
        return err(`error executing ${trimmed}\n`);
      }
    }
  }

  const cmdName = parts[0] || trimmed;
  return {
    stdout: '',
    stderr: `${cmdName}: command not found\n`,
    exitCode: 127,
  };
}
