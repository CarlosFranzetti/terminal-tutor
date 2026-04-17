#!/usr/bin/env node
// Terminal Tutor entry point.

import { runApp } from '../src/app.js';

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
  tt — Terminal Tutor

  Usage:
    tt               Launch the animated quest browser.
    tt --version     Print version.
    tt --help        Show this screen.

  Inside a quest:
    <command>        Run a real shell command.
    h                Ask for a progressive hint.
    s                Skip this step (no XP).
    q                Quit. Progress is saved.
`);
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  // Read version without extra deps.
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, resolve } = await import('node:path');
  const here = dirname(fileURLToPath(import.meta.url));
  const pkg = JSON.parse(readFileSync(resolve(here, '..', 'package.json'), 'utf8'));
  console.log(pkg.version);
  process.exit(0);
}

process.on('SIGINT', () => {
  console.log('\n  may your shells be colorful, traveler.\n');
  process.exit(0);
});

runApp().catch((err) => {
  if (err?.name === 'ExitPromptError') {
    console.log('\n  may your shells be colorful, traveler.\n');
    process.exit(0);
  }
  console.error(err);
  process.exit(1);
});
