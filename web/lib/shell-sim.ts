import type { ShellResult } from './types';

// ─── Mutable simulator state ──────────────────────────────────────────────────
// Everything here is module-level so state persists across commands within a
// session (mkdir creates dirs, cd changes directory, git state progresses, etc.)

type FSEntry = 'file' | 'dir';

const FS: Map<string, FSEntry> = new Map([
  ['.', 'dir'],
  ['src', 'dir'],
  ['src/game.js', 'file'],
  ['src/physics.js', 'file'],
  ['src/world.js', 'file'],
  ['src/player.js', 'file'],
  ['src/npc.js', 'file'],
  ['src/vehicles.js', 'file'],
  ['assets', 'dir'],
  ['assets/textures', 'dir'],
  ['assets/sounds', 'dir'],
  ['assets/models', 'dir'],
  ['package.json', 'file'],
  ['package-lock.json', 'file'],
  ['README.md', 'file'],
  ['index.html', 'file'],
  ['CHANGELOG.md', 'file'],
  ['.gitignore', 'file'],
  ['node_modules', 'dir'],
  ['.git', 'dir'],
]);

// Current working directory — relative to /Users/carlos/games/street-racer
let cwd = '.';

// Git status progression: dirty → staged → committed → pushed
type GitState = 'dirty' | 'staged' | 'committed' | 'pushed';
let gitState: GitState = 'dirty';

// ─── Rich file contents ───────────────────────────────────────────────────────
const FILE_CONTENTS: Record<string, string> = {
  'README.md': `# StreetRacer Unlimited

> Open-world street racing. GTA but make it Fast & Furious.

## Quick Start

\`\`\`bash
npm install
npm start        # dev server at http://localhost:5173
npm run build    # production bundle
\`\`\`

## Stack

| Layer    | Tech                        |
|----------|-----------------------------|
| Renderer | Three.js v163               |
| Physics  | Cannon-es v0.20             |
| Audio    | Web Audio API               |
| Bundler  | Vite v5                     |

## Features

- 🚗 12 driveable cars with realistic physics
- 🗺️  Open-world map (4 km² of city)
- 🚔  Dynamic police AI (5 wanted levels)
- 📻  In-game radio with 6 stations
- 🌙  Day/night cycle + dynamic weather
- 🎮  Controller support (Xbox, PS5)

## Project Structure

\`\`\`
src/
  game.js        # main game loop
  physics.js     # Cannon-es integration
  world.js       # map/environment
  player.js      # player controller
  npc.js         # NPC AI
  vehicles.js    # vehicle definitions
assets/
  textures/      # PBR texture atlases
  sounds/        # sfx + music
  models/        # GLTF car/world models
\`\`\`

## Status

v0.9.0 — Beta. All core features complete. **Ready to ship. 🚀**

## License

MIT — fork it, race it, ship it.
`,

  'package.json': `{
  "name": "street-racer-unlimited",
  "version": "0.9.0",
  "description": "Open-world street racing — GTA but make it Fast & Furious.",
  "type": "module",
  "scripts": {
    "start": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "three": "^0.163.0",
    "cannon-es": "^0.20.0"
  },
  "devDependencies": {
    "vite": "^5.2.0"
  }
}
`,

  '.gitignore': `node_modules/
dist/
.env
*.log
.DS_Store
`,

  'CHANGELOG.md': `# Changelog

All notable changes are documented here.

## [0.9.0] — 2026-04-16

### Added
- 12 new cars (Lambo, GT-R, Supra, ...)
- Dynamic police AI — 5 wanted star levels
- In-game radio: 6 stations, 24 tracks
- Day/night cycle and dynamic weather

### Fixed
- Physics jitter on bridge crossings
- NPC aggression tuned (less kamikaze)
- Map expanded by 40% — new docks district

## [0.8.0] — 2026-03-01

### Added
- Multiplayer lobby (beta)
- Garage customization system
`,

  'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>StreetRacer Unlimited</title>
    <style>
      body { margin: 0; background: #000; overflow: hidden; }
      canvas { display: block; width: 100vw; height: 100vh; }
    </style>
  </head>
  <body>
    <canvas id="game"></canvas>
    <script type="module" src="/src/game.js"></script>
  </body>
</html>
`,

  'src/game.js': `import * as THREE from 'three';
import { World } from './world.js';
import { Player } from './player.js';
import { PhysicsEngine } from './physics.js';

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game') });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);

const physics = new PhysicsEngine();
const world = new World(scene, physics);
const player = new Player(scene, camera, physics);

function gameLoop() {
  requestAnimationFrame(gameLoop);
  physics.step(1 / 60);
  player.update();
  world.update();
  renderer.render(scene, camera);
}

gameLoop();
`,

  'src/physics.js': `import { World, NaiveBroadphase, Body, Sphere } from 'cannon-es';

export class PhysicsEngine {
  constructor() {
    this.world = new World();
    this.world.gravity.set(0, -9.82, 0);
    // TODO: upgrade to SAPBroadphase for 40% perf gain
    this.world.broadphase = new NaiveBroadphase();
    this.world.allowSleep = true;
  }

  step(dt) {
    this.world.step(1 / 60, dt, 3);
  }

  addBody(body) {
    this.world.addBody(body);
  }
}
`,

  'src/player.js': `import * as THREE from 'three';

export class Player {
  constructor(scene, camera, physics) {
    this.speed = 0;
    this.health = 100;
    this.wantedLevel = 0;
    this.position = new THREE.Vector3(0, 1, 0);
    this.camera = camera;
  }

  update() {
    // Handle input, update physics body, follow camera
  }
}
`,

  'src/vehicles.js': `// Vehicle definitions — stats + 3D model paths

export const VEHICLES = [
  { id: 'banshee',  name: 'Banshee 900R',  speed: 98, handling: 85, model: '/assets/models/banshee.glb'  },
  { id: 'sultan',   name: 'Sultan RS',      speed: 88, handling: 95, model: '/assets/models/sultan.glb'   },
  { id: 'cheetah',  name: 'Cheetah Classic',speed: 95, handling: 78, model: '/assets/models/cheetah.glb'  },
  { id: 'elegy',    name: 'Elegy RH8',      speed: 90, handling: 92, model: '/assets/models/elegy.glb'    },
  { id: 'zentorno', name: 'Zentorno',        speed: 97, handling: 82, model: '/assets/models/zentorno.glb' },
];
`,
};

// ─── Path helpers ─────────────────────────────────────────────────────────────
function resolvePath(inputPath: string): string {
  if (!inputPath || inputPath === '~') return '.';
  if (inputPath === '.') return cwd;
  if (inputPath === '..') {
    if (cwd === '.') return '.';
    return cwd.includes('/') ? cwd.split('/').slice(0, -1).join('/') : '.';
  }
  if (cwd === '.') return inputPath;
  return `${cwd}/${inputPath}`;
}

function absolutePath(rel: string): string {
  const base = '/Users/carlos/games/street-racer';
  if (rel === '.') return base;
  return `${base}/${rel}`;
}

function listDir(path: string, showHidden: boolean): string[] {
  const entries: string[] = [];
  FS.forEach((v, k) => {
    if (path === '.') {
      if (k === '.' || k.includes('/')) return;
      entries.push(v === 'dir' ? k + '/' : k);
    } else {
      if (!k.startsWith(path + '/')) return;
      const rest = k.slice(path.length + 1);
      if (rest.includes('/')) return;
      entries.push(v === 'dir' ? rest + '/' : rest);
    }
  });
  if (!showHidden) return entries.filter(e => !e.startsWith('.'));
  return entries;
}

// ─── Git status strings ───────────────────────────────────────────────────────
function gitStatusOutput(): string {
  switch (gitState) {
    case 'dirty':
      return 'On branch main\n\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n\n\tmodified:   src/player.js\n\tmodified:   src/vehicles.js\n\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)\n\n\tCHANGELOG.md\n\nno changes added to commit (use "git add" or "git commit -a")\n';
    case 'staged':
      return 'On branch main\n\nChanges to be committed:\n  (use "git restore --staged <file>..." to unstage)\n\n\tmodified:   src/player.js\n\tmodified:   src/vehicles.js\n\tnew file:   CHANGELOG.md\n';
    case 'committed':
    case 'pushed':
      return 'On branch main\nYour branch is up to date with \'origin/main\'.\n\nnothing to commit, working tree clean\n';
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ok  = (stdout: string): ShellResult => ({ stdout, stderr: '', exitCode: 0 });
const err = (stderr: string, code = 1): ShellResult => ({ stdout: '', stderr, exitCode: code });

type Handler = (args: string[], raw: string) => ShellResult;
const HANDLERS: Array<[RegExp, Handler]> = [

  // ── pwd ───────────────────────────────────────────────────────────────────
  [/^pwd$/, () => ok(absolutePath(cwd) + '\n')],

  // ── ls ───────────────────────────────────────────────────────────────────
  [/^ls(\s|$)/, (args) => {
    const showHidden = args.some(a => /^-.*a/.test(a));
    const showLong   = args.some(a => /^-.*l/.test(a));
    const pathArg    = args.find(a => !a.startsWith('-'));
    const target     = pathArg ? resolvePath(pathArg) : cwd;

    if (!FS.has(target) && target !== '.') {
      return err(`ls: ${pathArg}: No such file or directory\n`);
    }

    const entries = listDir(target, showHidden);
    entries.sort();

    if (!showLong) {
      return ok(entries.join('  ') + '\n');
    }

    const rows = ['total ' + entries.length * 8];
    const now = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    rows.push(`drwxr-xr-x  ${entries.length} carlos  staff   256 ${now} .`);
    rows.push(`drwxr-xr-x  3 carlos  staff    96 ${now} ..`);
    for (const e of entries) {
      const isDir = e.endsWith('/');
      const name  = isDir ? e.slice(0, -1) : e;
      const perm  = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
      const size  = isDir ? '  192' : '  ' + (200 + name.length * 7);
      rows.push(`${perm}  2 carlos  staff  ${size} ${now} ${name}`);
    }
    return ok(rows.join('\n') + '\n');
  }],

  // ── cd ────────────────────────────────────────────────────────────────────
  [/^cd(\s|$)/, (args) => {
    const target = args[0];
    if (!target || target === '~') { cwd = '.'; return ok(''); }
    if (target === '.') return ok('');
    if (target === '..') {
      cwd = cwd === '.' ? '.' : (cwd.includes('/') ? cwd.split('/').slice(0, -1).join('/') : '.');
      return ok('');
    }
    const resolved = resolvePath(target);
    if (FS.get(resolved) === 'dir') { cwd = resolved; return ok(''); }
    return err(`cd: no such file or directory: ${target}\n`);
  }],

  // ── mkdir ─────────────────────────────────────────────────────────────────
  [/^mkdir(\s|$)/, (args) => {
    const mkParents = args.includes('-p');
    const names = args.filter(a => !a.startsWith('-'));
    if (!names.length) return err('mkdir: missing operand\n');
    for (const name of names) {
      const resolved = resolvePath(name);
      if (FS.has(resolved)) return err(`mkdir: ${name}: File exists\n`);
      FS.set(resolved, 'dir');
    }
    return ok('');
  }],

  // ── touch ─────────────────────────────────────────────────────────────────
  [/^touch(\s|$)/, (args) => {
    const names = args.filter(a => !a.startsWith('-'));
    if (!names.length) return err('touch: missing file operand\n');
    for (const name of names) {
      const resolved = resolvePath(name);
      if (!FS.has(resolved)) FS.set(resolved, 'file');
    }
    return ok('');
  }],

  // ── rm ────────────────────────────────────────────────────────────────────
  [/^rm(\s|$)/, (args) => {
    const names = args.filter(a => !a.startsWith('-'));
    if (!names.length) return err('rm: missing operand\n');
    for (const name of names) {
      const resolved = resolvePath(name);
      if (!FS.has(resolved)) return err(`rm: ${name}: No such file or directory\n`);
      FS.delete(resolved);
      // Also remove children
      const toDelete: string[] = [];
      FS.forEach((_, k) => { if (k.startsWith(resolved + '/')) toDelete.push(k); });
      toDelete.forEach(k => FS.delete(k));
    }
    return ok('');
  }],

  // ── cp ────────────────────────────────────────────────────────────────────
  [/^cp(\s|$)/, (args) => {
    const names = args.filter(a => !a.startsWith('-'));
    if (names.length < 2) return err('cp: missing destination file operand\n');
    const [src, dst] = [resolvePath(names[0]), resolvePath(names[1])];
    if (!FS.has(src)) return err(`cp: ${names[0]}: No such file or directory\n`);
    FS.set(dst, FS.get(src)!);
    return ok('');
  }],

  // ── mv ────────────────────────────────────────────────────────────────────
  [/^mv(\s|$)/, (args) => {
    const names = args.filter(a => !a.startsWith('-'));
    if (names.length < 2) return err('mv: missing destination file operand\n');
    const [src, dst] = [resolvePath(names[0]), resolvePath(names[1])];
    if (!FS.has(src)) return err(`mv: ${names[0]}: No such file or directory\n`);
    FS.set(dst, FS.get(src)!);
    FS.delete(src);
    return ok('');
  }],

  // ── cat ───────────────────────────────────────────────────────────────────
  [/^cat(\s|$)/, (args) => {
    const names = args.filter(a => !a.startsWith('-'));
    if (!names.length) return err('cat: missing file operand\n');

    let out = '';
    for (const name of names) {
      const resolved = resolvePath(name);
      const type = FS.get(resolved);
      if (!type && !FS.has(name)) return err(`cat: ${name}: No such file or directory\n`);
      if (type === 'dir' || FS.get(name) === 'dir') return err(`cat: ${name}: Is a directory\n`);

      // Check both resolved and raw name in file contents
      const content = FILE_CONTENTS[name] ?? FILE_CONTENTS[resolved];
      if (content) { out += content; continue; }
      out += `[binary or empty file: ${name}]\n`;
    }
    return ok(out);
  }],

  // ── grep ──────────────────────────────────────────────────────────────────
  [/^grep(\s|$)/, (args) => {
    const pattern = args.find(a => !a.startsWith('-'));
    if (!pattern) return err('grep: missing pattern\n');
    const target = args.find((a, i) => i > 0 && !a.startsWith('-')) || 'src/game.js';
    const content = FILE_CONTENTS[target] || '';
    const re = new RegExp(pattern, 'gi');
    const matches = content.split('\n').filter(l => re.test(l));
    if (!matches.length) return { stdout: '', stderr: '', exitCode: 1 };
    return ok(matches.map(l => `${target}:${l}`).join('\n') + '\n');
  }],

  // ── find ──────────────────────────────────────────────────────────────────
  [/^find(\s|$)/, (args) => {
    const nameArg = args.findIndex(a => a === '-name');
    const pattern = nameArg >= 0 ? args[nameArg + 1]?.replace(/\*/g, '') : null;
    const allKeys: string[] = [];
    FS.forEach((_, k) => { if (k !== '.' && (!pattern || k.includes(pattern))) allKeys.push(k); });
    const entries = allKeys;
    return ok(entries.map(k => './' + k).join('\n') + '\n');
  }],

  // ── which / where ─────────────────────────────────────────────────────────
  [/^which(\s|$)/, (args) => {
    const bin = args[0];
    if (!bin) return err('which: missing argument\n');
    const known: Record<string, string> = {
      gh: '/opt/homebrew/bin/gh',
      git: '/usr/bin/git',
      node: '/opt/homebrew/bin/node',
      npm: '/opt/homebrew/bin/npm',
      ls: '/bin/ls',
      cat: '/bin/cat',
    };
    return known[bin] ? ok(known[bin] + '\n') : err(`${bin} not found\n`, 1);
  }],
  [/^where(\s|$)/, (args) => {
    const bin = args[0];
    return bin ? ok(`/usr/local/bin/${bin}\n`) : err('where: missing argument\n');
  }],

  // ── echo ──────────────────────────────────────────────────────────────────
  [/^echo(\s|$)/, (_, raw) => {
    const content = raw.replace(/^echo\s*/, '').replace(/^(["'])(.*)\1$/, '$2');
    return ok(content + '\n');
  }],

  // ── clear ─────────────────────────────────────────────────────────────────
  [/^clear$/, () => ok('\x1b[2J\x1b[H')],

  // ── whoami / date / uname ─────────────────────────────────────────────────
  [/^whoami$/, () => ok('carlos\n')],
  [/^date$/, () => ok(new Date().toString() + '\n')],
  [/^uname/, () => ok('Darwin\n')],
  [/^hostname$/, () => ok('MacBook-Pro-Carlos.local\n')],

  // ── open ──────────────────────────────────────────────────────────────────
  [/^open(\s|$)/, () => ok('')],

  // ── curl ─────────────────────────────────────────────────────────────────
  [/^curl(\s|$)/, (args) => {
    const url = args.find(a => a.startsWith('http'));
    if (!url) return ok('200 OK\n{"status":"ok"}\n');
    return ok(`200 OK\n{"url":"${url}","status":"live"}\n`);
  }],

  // ── man ───────────────────────────────────────────────────────────────────
  [/^man(\s|$)/, (args) => {
    const cmd = args[0];
    if (!cmd) return err('What manual page do you want?\n');
    return ok(`${cmd}(1)          User Commands          ${cmd}(1)\n\nNAME\n       ${cmd} - a command\n\nSYNOPSIS\n       ${cmd} [OPTIONS]...\n\nDESCRIPTION\n       This is the simulated man page for ${cmd}.\n       For real documentation, visit https://man.cx/${cmd}\n\n(END)\n`);
  }],

  // ── history ───────────────────────────────────────────────────────────────
  [/^history$/, () =>
    ok('  1  ls\n  2  git status\n  3  git diff\n  4  git add .\n  5  git commit -m "feat: v0.9.0"\n  6  gh --version\n  7  gh auth status\n  8  gh repo create street-racer-unlimited --public --source=. --push\n  9  gh repo view\n')],

  // ── node / npm ────────────────────────────────────────────────────────────
  [/^node\s+--version$/, () => ok('v20.11.1\n')],
  [/^npm\s+--version$/, () => ok('10.2.4\n')],
  [/^npm\s+install/, () => ok('\nadded 247 packages, and audited 248 packages in 3.4s\n\n62 packages are looking for funding\n  run `npm fund` for details\n\nfound 0 vulnerabilities\n')],
  [/^npm\s+run\s+build/, () =>
    ok('\n> street-racer-unlimited@0.9.0 build\n> vite build\n\n✓ 47 modules transformed.\ndist/index.html         0.44 kB │ gzip:  0.30 kB\ndist/assets/game.js  1,024.32 kB │ gzip: 318.55 kB\n\n✓ built in 4.21s\n')],
  [/^npm\s+start/, () =>
    ok('\n> street-racer-unlimited@0.9.0 start\n> vite\n\n  VITE v5.2.0  ready in 312 ms\n\n  ➜  Local:   http://localhost:5173/\n  ➜  Network: use --host to expose\n  ➜  press h + enter to show help\n')],

  // ── git ───────────────────────────────────────────────────────────────────
  [/^git\s+status/, () => ok(gitStatusOutput())],

  [/^git\s+add(\s|$)/, () => {
    if (gitState === 'dirty') gitState = 'staged';
    return ok('');
  }],

  [/^git\s+commit/, (args) => {
    if (gitState !== 'staged') {
      return err('nothing to commit, working tree clean\n');
    }
    const msgMatch = args.join(' ').match(/-m\s+["']?(.+?)["']?\s*$/);
    const msg = msgMatch ? msgMatch[1] : 'update';
    gitState = 'committed';
    return ok(`[main 3f7a2d1] ${msg}\n 3 files changed, 47 insertions(+), 2 deletions(-)\n create mode 100644 CHANGELOG.md\n`);
  }],

  [/^git\s+push/, () => {
    gitState = 'pushed';
    return ok('Enumerating objects: 8, done.\nCounting objects: 100% (8/8), done.\nDelta compression using up to 10 threads\nCompressing objects: 100% (5/5), done.\nWriting objects: 100% (5/5), 1.23 KiB | 1.23 MiB/s, done.\nTotal 5 (delta 2), reused 0 (delta 0), pack-reused 0\nTo https://github.com/carlosfranzetti/street-racer-unlimited.git\n   b84e975..3f7a2d1  main -> main\n');
  }],

  [/^git\s+pull/, () => ok('Already up to date.\n')],

  [/^git\s+init$/, () => {
    FS.set('.git', 'dir');
    return ok('Initialized empty Git repository in ' + absolutePath(cwd) + '/.git/\n');
  }],

  [/^git\s+diff/, () =>
    ok('diff --git a/src/player.js b/src/player.js\nindex 2c3d4e5..6f7a8b9 100644\n--- a/src/player.js\n+++ b/src/player.js\n@@ -42,6 +42,10 @@ class Player {\n   constructor() {\n     this.speed = 0;\n     this.health = 100;\n+    this.wantedLevel = 0;\n+    this.cash = 500;\n   }\n }\ndiff --git a/src/vehicles.js b/src/vehicles.js\nindex aa1b2c3..dd4e5f6 100644\n--- a/src/vehicles.js\n+++ b/src/vehicles.js\n@@ -1,3 +1,4 @@\n+// v0.9.0 — 12 cars\n export const VEHICLES = [\n')],

  [/^git\s+log/, (args) => {
    const oneline = args.includes('--oneline');
    if (oneline) {
      return ok('3f7a2d1 (HEAD -> main) feat: v0.9.0 final polish\nb84e975 initial commit: 47k lines of mayhem\n');
    }
    return ok('commit 3f7a2d1a8b9c4e2f1d3a (HEAD -> main, origin/main)\nAuthor: Carlos Franzetti <carlosfranzetti@gmail.com>\nDate:   Thu Apr 16 09:15:42 2026 -0500\n\n    feat: v0.9.0 — final polish before launch\n\ncommit b84e975c3a2d1f0e4b5c\nAuthor: Carlos Franzetti <carlosfranzetti@gmail.com>\nDate:   Wed Apr 15 18:00:00 2026 -0500\n\n    initial commit: 47,000 lines of open-world mayhem\n');
  }],

  [/^git\s+branch/, (args) => {
    const newBranch = args.filter(a => !a.startsWith('-'))[0];
    if (newBranch && !args.includes('-m')) {
      return ok(`Switched to a new branch '${newBranch}'\n`);
    }
    return ok('* main\n  develop\n');
  }],

  [/^git\s+checkout\s+-b\s+/, (args) => {
    const branch = args.find(a => a !== '-b');
    return ok(branch ? `Switched to a new branch '${branch}'\n` : 'error: missing branch name\n');
  }],

  [/^git\s+checkout\s+/, (args) => {
    const branch = args.find(a => !a.startsWith('-'));
    return ok(branch ? `Switched to branch '${branch}'\n` : '');
  }],

  [/^git\s+remote/, (args) => {
    if (args[0] === 'add') {
      return ok('');
    }
    return ok('origin\thttps://github.com/carlosfranzetti/street-racer-unlimited.git (fetch)\norigin\thttps://github.com/carlosfranzetti/street-racer-unlimited.git (push)\n');
  }],

  [/^git\s+clone(\s|$)/, (args) => {
    const url = args.find(a => a.startsWith('http') || a.includes('/'));
    const name = url ? url.split('/').pop()?.replace('.git', '') || 'repo' : 'repo';
    FS.set(name, 'dir');
    return ok(`Cloning into '${name}'...\nremote: Enumerating objects: 1203, done.\nremote: Counting objects: 100% (1203/1203), done.\nRemote: Compressing objects: 100% (841/841), done.\nReceiving objects: 100% (1203/1203), 14.2 MiB | 8.4 MiB/s, done.\nResolving deltas: 100% (412/412), done.\n`);
  }],

  [/^git\s+stash/, () => ok('Saved working directory and index state WIP on main: 3f7a2d1 feat: v0.9.0\n')],

  // ── gh ────────────────────────────────────────────────────────────────────
  [/^gh\s+--version$/, () => ok('gh version 2.50.0 (2026-03-01)\nhttps://github.com/cli/gh\n')],

  [/^gh\s+auth\s+status$/, () =>
    ok('github.com\n  ✓ Logged in to github.com account carlosfranzetti (keyring)\n  - Active account: true\n  - Git operations for github.com configured to use https protocol.\n  - Token: ghp_****\n  - Token scopes: gist, read:org, repo, workflow\n')],

  [/^gh\s+auth\s+login/, () =>
    ok('? What account do you want to log into? GitHub.com\n? What is your preferred protocol for Git operations? HTTPS\n? How would you like to authenticate GitHub CLI? Login with a web browser\n✓ Authentication complete.\n✓ Logged in as carlosfranzetti\n')],

  [/^gh\s+auth\s+logout/, () => ok('✓ Logged out of github.com account carlosfranzetti\n')],

  [/^gh\s+repo\s+create(\s|$)/, (args, raw) => {
    const name = args.find(a => !a.startsWith('--')) || 'street-racer-unlimited';
    const isPublic = raw.includes('--public');
    const pushed   = raw.includes('--push') || raw.includes('--source');
    if (pushed) gitState = 'pushed';
    return ok(`✓ Created repository carlosfranzetti/${name} on GitHub\n  https://github.com/carlosfranzetti/${name}\n${isPublic ? '  (public)\n' : '  (private)\n'}${pushed ? '\nEnumerating objects: 8, done.\nWriting objects: 100% (8/8), 1.23 KiB | 1.23 MiB/s, done.\nTo https://github.com/carlosfranzetti/${name}.git\n * [new branch]      main -> main\n' : ''}`);
  }],

  [/^gh\s+repo\s+view(\s|$)/, (args) => {
    const target = args.find(a => !a.startsWith('--')) || 'carlosfranzetti/street-racer-unlimited';
    const parts  = target.split('/');
    const repo   = parts[parts.length - 1] || 'street-racer-unlimited';
    return ok(`${target}\nOpen-world street racing — GTA but make it Fast & Furious.\n\n  ✓ Public repository\n  ★  1 star  🍴 0 forks  ⚠ 0 issues\n\nAbout\n  Open-world street racing game built with Three.js + Cannon-es.\n  \nREPO\n  Name:     ${repo}\n  Owner:    carlosfranzetti\n  Language: JavaScript\n  Topics:   game, webgl, three-js\n  URL:      https://github.com/${target}\n\nCLONE\n  git clone https://github.com/${target}.git\n`);
  }],

  [/^gh\s+repo\s+fork(\s|$)/, (args) => {
    const target = args.find(a => !a.startsWith('--')) || 'opengame/opcity';
    const repo   = target.split('/').pop() || 'repo';
    FS.set(repo, 'dir');
    return ok(`✓ Created fork carlosfranzetti/${repo}\n  https://github.com/carlosfranzetti/${repo}\n`);
  }],

  [/^gh\s+repo\s+list/, () =>
    ok('Showing 3 of 3 repositories in @carlosfranzetti\n\nNAME                                DESCRIPTION              PUSHED\ncarlosfranzetti/street-racer-unlimited  Open-world street racing   about now\ncarlosfranzetti/terminal-tutor          Story-driven CLI trainer   2 hours ago\ncarlosfranzetti/opcity                  Forked from opengame       just now\n')],

  [/^gh\s+repo\s+clone(\s|$)/, (args) => {
    const target = args.find(a => !a.startsWith('-')) || 'street-racer-unlimited';
    const repo   = target.split('/').pop() || target;
    FS.set(repo, 'dir');
    return ok(`Cloning into '${repo}'...\nremote: Enumerating objects: 1203, done.\nReceiving objects: 100% (1203/1203), 14.2 MiB | 8.4 MiB/s, done.\n`);
  }],

  [/^gh\s+issue\s+list/, () =>
    ok('Showing 0 open issues in carlosfranzetti/street-racer-unlimited\n\n(no issues yet — ship first, fix later)\n')],

  [/^gh\s+issue\s+create/, () =>
    ok('https://github.com/carlosfranzetti/street-racer-unlimited/issues/1\n')],

  [/^gh\s+pr\s+create(\s|$)/, (args, raw) => {
    const titleMatch = raw.match(/--title\s+["']?([^"']+?)["']?\s+(--|$)/);
    const title = titleMatch ? titleMatch[1] : 'chore: updates';
    return ok(`\nhttps://github.com/opengame/opcity/pull/42\n\nCreating pull request for carlosfranzetti:main into main in opengame/opcity\n\nTitle: ${title}\nBody: (no body)\n\n✓ Pull request #42 created\n`);
  }],

  [/^gh\s+pr\s+list/, () =>
    ok('Showing 0 open pull requests in carlosfranzetti/street-racer-unlimited\n')],

  [/^gh\s+pr\s+--help$/, () =>
    ok('Work with GitHub pull requests.\n\nUSAGE\n  gh pr <command> [flags]\n\nCOMMANDS\n  checkout    Check out a pull request locally\n  close       Close a pull request\n  create      Create a pull request\n  diff        View changes in a pull request\n  list        List pull requests\n  merge       Merge a pull request\n  ready       Mark a pull request as ready for review\n  reopen      Reopen a pull request\n  review      Add a review to a pull request\n  status      Show status of relevant pull requests\n  view        View a pull request\n\nFLAGS\n  -h, --help   Show help for command\n\nLEARN MORE\n  https://cli.github.com/manual/gh_pr\n')],

  [/^gh\s+extension\s+list/, () =>
    ok('INSTALLED EXTENSIONS\ngithub/gh-copilot  1.0.1  gh copilot\n\nFind more extensions at https://github.com/topics/gh-extension\n')],

  [/^gh\s+extension\s+install/, (args) => {
    const ext = args.find(a => !a.startsWith('-')) || 'github/gh-copilot';
    return ok(`✓ Installed extension ${ext}\n`);
  }],

  [/^gh\s+copilot\s+--help$/, () =>
    ok('Your AI command line copilot.\n\nUsage:\n  gh copilot [command]\n\nAvailable Commands:\n  explain     Explain a given input command in plain English\n  suggest     Suggest a command based on a natural language description\n  config      Configure options\n  alias       Manage Copilot Shell Suggest aliases\n\nFlags:\n      --hostname string   The GitHub host to use for authentication\n  -h, --help              Help for copilot\n  -v, --version           Version for copilot\n\nUse "gh copilot [command] --help" for more information about a command.\n')],

  [/^gh\s+copilot\s+explain(\s|$)/, (args) => {
    const cmd = args.filter(a => !a.startsWith('-')).join(' ') || 'ls -la';
    return ok(`Explanation of \`${cmd}\`:\n\n  ${explainCommand(cmd)}\n\n  This explanation is AI-generated. Verify with official docs before use in production.\n`);
  }],

  [/^gh\s+copilot\s+suggest(\s|$)/, (args) => {
    const query = args.filter(a => !a.startsWith('-')).join(' ');
    const suggestion = suggestCommand(query);
    return ok(`\nSuggested command for: "${query}"\n\n  ${suggestion}\n\n  (1) Copy command to clipboard\n  (2) Explain command\n  (3) Revise query\n  (q) Quit\n\n  ? > \n`);
  }],

  // Catch-all gh
  [/^gh(\s|$)/, (_, raw) => ok(`gh: ran "${raw}" — (simulated, exit 0)\n`)],

  // ── Fallthrough for common aliases ────────────────────────────────────────
  [/^(ll|la)$/, (_, raw) => {
    const showHidden = raw === 'la';
    const entries = listDir(cwd, showHidden);
    return ok(entries.sort().join('\n') + '\n');
  }],
];

// ─── AI copilot response generators ──────────────────────────────────────────
function explainCommand(cmd: string): string {
  const lower = cmd.toLowerCase();
  if (/ls\s+-la/.test(lower)) return '`ls -la` lists all files and directories in long format,\n  including hidden files (those starting with `.`). Shows permissions,\n  owner, size, and modification date for each entry.';
  if (/git\s+status/.test(lower)) return '`git status` shows the state of your working directory and staging\n  area. It lists which changes are staged, which are not, and which\n  files are not tracked by Git.';
  if (/git\s+diff/.test(lower)) return '`git diff` shows the exact line-by-line changes between your working\n  directory and the last commit. Lines prefixed with `+` are additions,\n  `-` are deletions.';
  if (/node\s+--max-old-space-size/.test(lower)) return '`--max-old-space-size=N` sets the maximum heap size for the V8 JS\n  engine to N megabytes. Useful when your Node.js process is crashing\n  with "JavaScript heap out of memory" errors under heavy load.';
  if (/segmentation\s+fault/.test(lower)) return 'A "Segmentation fault (core dumped)" occurs when a process tries to\n  access memory it doesn\'t have permission to access. Common causes:\n  null pointer dereference, stack overflow, or buffer overflow. The\n  "(core dumped)" part means a crash dump was saved for debugging.';
  return `\`${cmd}\` is a shell command. It runs a program with the given arguments.\n  Break it down: the first word is the binary, remaining words are options\n  and arguments passed to it.`;
}

function suggestCommand(query: string): string {
  const lower = query.toLowerCase();
  if (/list.*file.*date|sort.*modif/.test(lower)) return 'ls -lt';
  if (/compress.*mp4|video.*compress/.test(lower)) return 'for f in *.mp4; do ffmpeg -i "$f" -vf scale=-1:720 -c:v libx264 -crf 23 "720p_$f"; done';
  if (/upload.*s3|s3.*upload/.test(lower)) return 'aws s3 sync . s3://my-bucket --exclude \'*\' --include \'*.mp4\'';
  if (/node.*memory|memory.*node/.test(lower)) return 'node --max-old-space-size=4096 your-script.js';
  if (/disk.*space|free.*space/.test(lower)) return 'df -h';
  if (/find.*file/.test(lower)) return 'find . -name "*.js" -type f';
  if (/kill.*port/.test(lower)) return 'lsof -ti tcp:3000 | xargs kill';
  return `# Suggested for: ${query}\ngh copilot suggest "${query}"`;
}

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
      } catch (e) {
        return err(`error: ${e instanceof Error ? e.message : String(e)}\n`);
      }
    }
  }

  const cmdName = parts[0] || trimmed;
  return { stdout: '', stderr: `${cmdName}: command not found\n`, exitCode: 127 };
}

const INITIAL_FS: Array<[string, FSEntry]> = [
  ['.', 'dir'], ['src', 'dir'], ['src/game.js', 'file'], ['src/physics.js', 'file'],
  ['src/world.js', 'file'], ['src/player.js', 'file'], ['src/npc.js', 'file'],
  ['src/vehicles.js', 'file'], ['assets', 'dir'], ['assets/textures', 'dir'],
  ['assets/sounds', 'dir'], ['assets/models', 'dir'], ['package.json', 'file'],
  ['package-lock.json', 'file'], ['README.md', 'file'], ['index.html', 'file'],
  ['CHANGELOG.md', 'file'], ['.gitignore', 'file'], ['node_modules', 'dir'], ['.git', 'dir'],
];

/** Reset the simulator state (call between quests / stories if needed) */
export function resetSimulator(): void {
  cwd = '.';
  gitState = 'dirty';
  FS.clear();
  INITIAL_FS.forEach(([k, v]) => FS.set(k, v));
}
