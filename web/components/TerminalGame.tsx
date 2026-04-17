'use client';

import { useEffect, useRef } from 'react';
import { allPacks } from '@/lib/quests';
import { verifyStep } from '@/lib/verifier';
import { nextHint, xpAfterHints } from '@/lib/hints';
import { levelForXp, progressToNextLevel } from '@/lib/xp';
import {
  loadProgress,
  saveProgress,
  markStepComplete,
  markQuestComplete,
  ensureQuestState,
  setCurrentStep,
  setStory,
  trackHintUsed,
} from '@/lib/progress';
import type { Pack, Step, Story, BranchPoint, StepOrBranch } from '@/lib/types';
import { runCommand, resetSimulator } from '@/lib/shell-sim';

// ─── ANSI color helpers ───────────────────────────────────────────────────────
const A = {
  reset:         '\x1b[0m',
  bold:          '\x1b[1m',
  dim:           '\x1b[2m',
  italic:        '\x1b[3m',
  green:         '\x1b[32m',
  brightGreen:   '\x1b[92m',
  cyan:          '\x1b[36m',
  brightCyan:    '\x1b[96m',
  yellow:        '\x1b[33m',
  brightYellow:  '\x1b[93m',
  magenta:       '\x1b[35m',
  brightMagenta: '\x1b[95m',
  red:           '\x1b[31m',
  brightRed:     '\x1b[91m',
  white:         '\x1b[37m',
  brightWhite:   '\x1b[97m',
  blue:          '\x1b[34m',
  brightBlue:    '\x1b[94m',
  orange:        '\x1b[38;5;208m',
  pink:          '\x1b[38;5;213m',
  gold:          '\x1b[38;5;220m',
};

// Rainbow cycle for the animated splash
const RAINBOW = [
  '\x1b[38;5;196m', // red
  '\x1b[38;5;208m', // orange
  '\x1b[38;5;226m', // yellow
  '\x1b[38;5;46m',  // green
  '\x1b[38;5;51m',  // cyan
  '\x1b[38;5;21m',  // blue
  '\x1b[38;5;201m', // magenta
];

// Gradient colors for settled logo
const LOGO_GRADIENT = [A.brightCyan, A.brightBlue, A.blue, A.cyan];

const LOGO_LINES = [
  '  ████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ██╗',
  '     ██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗██║',
  '     ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║██║',
  '     ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║██║',
  '     ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║███████╗',
  '     ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝',
  '',
  '  ████████╗██╗   ██╗████████╗ ██████╗ ██████╗',
  '     ██╔══╝██║   ██║╚══██╔══╝██╔═══██╗██╔══██╗',
  '     ██║   ██║   ██║   ██║   ██║   ██║██████╔╝',
  '     ██║   ██║   ██║   ██║   ██║   ██║██╔══██╗',
  '     ██║   ╚██████╔╝   ██║   ╚██████╔╝██║  ██║',
  '     ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝',
];

const BOX_WIDTH = 70;

function box(lines: string[], color = A.cyan): string {
  const top    = color + '╭' + '─'.repeat(BOX_WIDTH - 2) + '╮' + A.reset;
  const bottom = color + '╰' + '─'.repeat(BOX_WIDTH - 2) + '╯' + A.reset;
  const body = lines.map(l => {
    const visible = l.replace(/\x1b\[[0-9;]*m/g, '');
    const pad = Math.max(0, BOX_WIDTH - 4 - visible.length);
    return color + '│ ' + A.reset + l + ' '.repeat(pad) + ' ' + color + '│' + A.reset;
  });
  return [top, ...body, bottom].join('\r\n');
}

function divider(char = '─', color = A.dim): string {
  return color + char.repeat(BOX_WIDTH) + A.reset;
}

function xpBar(xp: number, width = 30): string {
  const pct = progressToNextLevel(xp);
  const filled = Math.round(pct * width);
  const empty = width - filled;
  return A.brightGreen + '█'.repeat(filled) + A.dim + '░'.repeat(empty) + A.reset;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TerminalGame() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mutable input state (closure vars, no React state needed)
    let term: import('@xterm/xterm').Terminal;
    let resolveReadline: ((v: string) => void) | null = null;
    let inputBuffer = '';
    let isReading = false;

    let resolveChoice: ((v: string) => void) | null = null;
    let choiceOptions: string[] = [];
    let choiceIndex = 0;
    let isChoosing = false;
    let choiceLineCount = 0;

    // Write helpers (always use \r\n)
    const w = (text: string) => term?.write(text.replace(/(?<!\r)\n/g, '\r\n'));
    const wln = (text = '') => w(text + '\r\n');

    // Readline: show optional prompt, collect until Enter
    const readline = (prompt?: string): Promise<string> => new Promise(resolve => {
      if (prompt !== undefined) w(prompt);
      isReading = true;
      inputBuffer = '';
      resolveReadline = resolve;
    });

    // Multiple-choice prompt using arrow keys or numbers
    const promptChoice = (choices: string[]): Promise<string> => new Promise(resolve => {
      choiceOptions = choices;
      choiceIndex = 0;
      isChoosing = true;
      resolveChoice = resolve;
      renderChoices();
      wln();
      wln(A.dim + '  ↑↓ arrow keys or 1–' + choices.length + ' to select, Enter to confirm' + A.reset);
      choiceLineCount = choices.length + 2;
    });

    const renderChoices = () => {
      choiceOptions.forEach((opt, i) => {
        if (i === choiceIndex) {
          wln(`  ${A.brightCyan}▶ ${A.bold}${opt}${A.reset}`);
        } else {
          wln(`  ${A.dim}  ${opt}${A.reset}`);
        }
      });
    };

    const redrawChoices = () => {
      w(`\x1b[${choiceLineCount}A`);
      renderChoices();
      wln();
      wln(A.dim + '  ↑↓ arrow keys or 1–' + choiceOptions.length + ' to select, Enter to confirm' + A.reset);
    };

    // ── Typewriter effect ───────────────────────────────────────────────────
    const typewrite = (text: string, delayMs = 18): Promise<void> =>
      new Promise(resolve => {
        const chars = text.split('');
        let i = 0;
        const tick = () => {
          if (i >= chars.length) { resolve(); return; }
          const ch = chars[i++];
          w(ch === '\n' ? '\r\n' : ch);
          setTimeout(tick, delayMs);
        };
        tick();
      });

    const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

    // ─── Animate a single logo line through rainbow then settle ──────────────
    const animateLogoLine = async (line: string, settledColor: string): Promise<void> => {
      // Flash through rainbow colors quickly
      for (let pass = 0; pass < RAINBOW.length; pass++) {
        w(`\r${RAINBOW[pass]}${A.bold}${line}${A.reset}`);
        await delay(45);
      }
      // Settle on the gradient color
      w(`\r${settledColor}${A.bold}${line}${A.reset}\r\n`);
    };

    // ── Full animated splash ────────────────────────────────────────────────
    const showSplash = async () => {
      // Clear screen with a flash
      w('\x1b[2J\x1b[H');
      wln();
      wln();

      // Animate logo lines with staggered rainbow effect
      for (let i = 0; i < LOGO_LINES.length; i++) {
        if (LOGO_LINES[i] === '') {
          wln();
          continue;
        }
        const color = LOGO_GRADIENT[i % LOGO_GRADIENT.length];
        await animateLogoLine(LOGO_LINES[i], color);
        await delay(20);
      }

      wln();

      // Glowing subtitle — typewriter with bright colors
      const subtitle = '  ✦  Story-driven CLI training for game studio developers  ✦';
      await typewrite(A.brightMagenta + A.bold + subtitle + A.reset, 16);
      wln();
      wln();

      // Pulse effect on the press-enter line
      const enterMsg = '  ▶  Press Enter to jack in...';
      for (let pulse = 0; pulse < 2; pulse++) {
        w(`\r${A.brightGreen}${A.bold}${enterMsg}${A.reset}`);
        await delay(300);
        w(`\r${A.green}${enterMsg}${A.reset}        `);
        await delay(200);
      }
      w(`\r${A.brightGreen}${A.bold}${enterMsg}${A.reset}`);
      wln();
      wln();

      await readline('');

      // Quick wipe
      w('\x1b[2J\x1b[H');
    };

    // ────────────────────────────────────────────────────────────────────────
    // QUEST BROWSER
    // ────────────────────────────────────────────────────────────────────────
    const showBrowser = async (): Promise<Pack | null> => {
      const state = loadProgress();
      const xp = state.profile.xp;
      const level = levelForXp(xp);

      wln();
      wln(divider('═', A.brightCyan));
      wln();
      wln(
        `  ${A.brightYellow}${A.bold}OPERATOR PROFILE${A.reset}  ` +
        `${A.brightCyan}Level ${level}${A.reset}  ` +
        `${A.dim}XP: ${xp}${A.reset}  ` +
        xpBar(xp, 20),
      );
      wln();
      wln(divider('═', A.brightCyan));
      wln();
      wln(`  ${A.bold}${A.brightWhite}SELECT A QUEST PACK${A.reset}`);
      wln();

      const opts = [
        ...allPacks.map(p => {
          const q = state.quests[p.id];
          const storyCount = p.stories.length;
          const done = q?.completedAt ? A.brightGreen + ' ✓ completed' + A.reset : '';
          const resumed = q && !q.completedAt && q.completedStepIds.length > 0
            ? A.yellow + ` (in progress)` + A.reset
            : '';
          const stories = A.dim + ` [${storyCount} stories]` + A.reset;
          return `${p.title}${stories}${done}${resumed}`;
        }),
        A.dim + 'Quit' + A.reset,
      ];

      const picked = await promptChoice(opts);
      wln();

      if (picked.includes('Quit')) return null;

      const idx = opts.indexOf(picked);
      return allPacks[idx] ?? null;
    };

    // ────────────────────────────────────────────────────────────────────────
    // STORY PICKER
    // ────────────────────────────────────────────────────────────────────────
    const pickStory = async (pack: Pack): Promise<Story | null> => {
      wln(divider('─', A.brightMagenta));
      wln();
      wln(`  ${A.brightMagenta}${A.bold}⚡ ${pack.title}${A.reset}`);
      wln(`  ${A.dim}${pack.synopsis}${A.reset}`);
      wln();
      wln(`  ${A.brightWhite}${A.bold}CHOOSE YOUR STORY${A.reset}`);
      wln();

      const state = loadProgress();
      const q = state.quests[pack.id];

      const storyOpts = [
        ...pack.stories.map((s, i) => {
          const isActive = q?.storyId === s.id;
          const badge = isActive ? A.yellow + ' ← last played' + A.reset : '';
          return `${A.brightYellow}${i + 1}.${A.reset} ${A.bold}${s.title}${A.reset}  ${A.dim}${s.setting}${A.reset}${badge}`;
        }),
        A.dim + '← Back' + A.reset,
      ];

      const picked = await promptChoice(storyOpts);
      wln();

      if (picked.includes('Back')) return null;

      const idx = storyOpts.indexOf(picked);
      return pack.stories[idx] ?? null;
    };

    // ────────────────────────────────────────────────────────────────────────
    // QUEST PLAYER
    // ────────────────────────────────────────────────────────────────────────
    const playQuest = async (pack: Pack, story: Story): Promise<{ quit: boolean }> => {
      const state = loadProgress();
      const q = ensureQuestState(state, pack.id);

      // Reset step progress when starting a new story
      const isNewStory = q.storyId !== story.id;
      if (isNewStory) {
        q.storyId = story.id;
        q.completedStepIds = [];
        q.currentStepId = null;
        q.completedAt = null;
        q.startedAt = new Date().toISOString();
        resetSimulator(); // fresh filesystem + git state for the new story
      }

      setStory(state, pack.id, story.id);
      saveProgress(state);

      const done = new Set(q.completedStepIds);

      // Show story intro with ASCII art
      w('\x1b[2J\x1b[H');
      wln();

      if (story.art) {
        const artLines = story.art.split('\n');
        for (const line of artLines) {
          wln(A.brightCyan + line + A.reset);
        }
        wln();
      }

      wln(divider('═', A.brightMagenta));
      wln(`  ${A.brightMagenta}${A.bold}⚡ ${pack.title}${A.reset}`);
      wln(`  ${A.brightWhite}${A.bold}${story.title}${A.reset}`);
      wln(`  ${A.dim}${story.setting}${A.reset}`);
      wln(divider('═', A.brightMagenta));
      wln();

      // Flatten steps (BranchPoints will be resolved inline)
      const allStepsToPlay = await resolveSteps(story.steps, done, pack.id, state);
      if (!allStepsToPlay) return { quit: true }; // user quit during branch selection

      const { steps: flatSteps, quit } = allStepsToPlay;
      if (quit) return { quit: true };

      // Check if already done
      const remaining = flatSteps.filter(s => !done.has(s.id));
      if (remaining.length === 0) {
        const s = loadProgress();
        markQuestComplete(s, pack.id);
        saveProgress(s);
        await showQuestComplete(pack, story, s.profile.xp);
        return { quit: false };
      }

      for (const step of remaining) {
        const state2 = loadProgress();
        setCurrentStep(state2, pack.id, step.id);
        saveProgress(state2);

        let hintsUsed = 0;
        let resolved = false;

        await showStepIntro(step, pack.title, story.title);

        while (!resolved) {
          const input = await promptStep(step);

          if (input === '__quit__') return { quit: true };

          if (input === '__hint__') {
            const s3 = loadProgress();
            trackHintUsed(s3, pack.id, step.id);
            saveProgress(s3);
            const hint = nextHint(step, hintsUsed);
            hintsUsed++;
            if (hint) {
              wln();
              wln(`  ${A.yellow}💡 Hint ${hint.index + 1}/${hint.total}:${A.reset} ${hint.text}`);
            } else {
              wln(`  ${A.dim}No more hints available, operator.${A.reset}`);
            }
            wln();
            continue;
          }

          if (input === '__skip__') {
            wln(`  ${A.dim}→ Step skipped — no XP awarded.${A.reset}`);
            wln();
            resolved = true;
            break;
          }

          // For shell/which commands — run through simulator and show output first
          if (step.verify.mode === 'shell' || step.verify.mode === 'which') {
            const simOut = runCommand(input);
            if (simOut.stdout) {
              w(simOut.stdout.replace(/(?<!\r)\n/g, '\r\n'));
              if (!simOut.stdout.endsWith('\n')) wln();
            }
            if (simOut.stderr) {
              w(A.red + simOut.stderr.replace(/(?<!\r)\n/g, '\r\n') + A.reset);
              if (!simOut.stderr.endsWith('\n')) wln();
            }
          }

          // Verify
          w(`  ${A.dim}verifying...${A.reset}`);
          await delay(350);
          w('\r' + ' '.repeat(20) + '\r');

          let result;
          try {
            result = verifyStep(step.verify, input);
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            result = { ok: false, reason: `verifier error: ${msg}` };
          }

          if (result.ok) {
            const s4 = loadProgress();
            const gained = xpAfterHints(step, hintsUsed);
            markStepComplete(s4, pack.id, step.id, gained);
            saveProgress(s4);
            wln();
            wln(box([
              `${A.brightGreen}✓ CORRECT!${A.reset}`,
              `${A.brightYellow}+${gained} XP${A.reset}  ${A.dim}Level ${levelForXp(s4.profile.xp)}${A.reset}  ${xpBar(s4.profile.xp, 20)}`,
            ], A.brightGreen));
            wln();
            await delay(600);
            resolved = true;
          } else {
            wln();
            wln(`  ${A.red}✗ Not quite.${A.reset} ${A.dim}${result.reason || 'Try again.'}${A.reset}`);
            wln(`  ${A.dim}Type ${A.reset}h${A.dim} for a hint  ${A.reset}s${A.dim} to skip  ${A.reset}q${A.dim} to quit${A.reset}`);
            wln();
          }
        }
      }

      const finalState = loadProgress();
      markQuestComplete(finalState, pack.id);
      saveProgress(finalState);
      await showQuestComplete(pack, story, finalState.profile.xp);
      return { quit: false };
    };

    // ────────────────────────────────────────────────────────────────────────
    // BRANCH RESOLUTION
    // Walks StepOrBranch[], handles BranchPoint by prompting the user,
    // returns a flat Step[] to play through.
    // ────────────────────────────────────────────────────────────────────────
    const resolveSteps = async (
      items: StepOrBranch[],
      done: Set<string>,
      packId: string,
      progressState: ReturnType<typeof loadProgress>,
    ): Promise<{ steps: Step[]; quit: boolean } | null> => {
      const flat: Step[] = [];

      for (const item of items) {
        if (item.type === 'branch') {
          const bp = item as BranchPoint;

          // Show branch narration
          wln();
          wln(divider('─', A.brightYellow));
          await typewrite('  ' + A.brightYellow + A.bold + bp.narration + A.reset, 12);
          wln('\r\n');
          wln(`  ${A.brightWhite}Choose your path:${A.reset}`);
          wln();

          const branchOpts = bp.branches.map(
            b => `${A.bold}${b.label}${A.reset}  ${A.dim}${b.flavor}${A.reset}`
          );
          const picked = await promptChoice(branchOpts);
          wln();

          if (picked === '__quit__') return { steps: flat, quit: true };

          const branchIdx = branchOpts.indexOf(picked);
          const branch = bp.branches[branchIdx];
          if (branch) {
            flat.push(...branch.steps);
          }
        } else {
          flat.push(item as Step);
        }
      }

      return { steps: flat, quit: false };
    };

    // ── Step intro ──────────────────────────────────────────────────────────
    const showStepIntro = async (step: Step, questTitle: string, storyTitle: string) => {
      wln(divider('─', A.dim));
      wln(`  ${A.dim}${questTitle}  •  ${storyTitle}${A.reset}`);
      wln();

      // ASCII art if present
      if (step.art) {
        const artLines = step.art.split('\n');
        for (const line of artLines) {
          wln(A.brightCyan + A.dim + line + A.reset);
        }
        wln();
      }

      await typewrite('  ' + A.white + step.narration + A.reset, 12);
      wln('\r\n');
      wln(box([
        `${A.brightYellow}Objective:${A.reset} ${step.objective}`,
        `${A.dim}XP: ${step.xp}  •  h = hint  •  s = skip  •  q = quit${A.reset}`,
      ]));
      wln();
    };

    // ── Command / choice prompt ─────────────────────────────────────────────
    const promptStep = async (step: Step): Promise<string> => {
      if (step.verify.mode === 'prompt') {
        const choices = step.verify.choices!;
        wln(`  ${A.cyan}Choose your answer:${A.reset}`);
        wln();
        const picked = await promptChoice(choices);
        wln();
        return picked;
      }
      return readline(`${A.brightGreen}$ ${A.reset}`);
    };

    // ── Quest complete ──────────────────────────────────────────────────────
    const showQuestComplete = async (pack: Pack, story: Story, totalXp: number) => {
      wln();
      wln(divider('═', A.gold));
      wln();

      // Animate completion message with rainbow
      const msg = `  ★  MISSION ACCOMPLISHED: ${story.title}  ★`;
      for (let i = 0; i < RAINBOW.length; i++) {
        w(`\r${RAINBOW[i]}${A.bold}${msg}${A.reset}`);
        await delay(80);
      }
      w(`\r${A.gold}${A.bold}${msg}${A.reset}\r\n`);

      wln();
      wln(`  ${A.dim}Pack:${A.reset} ${pack.title}`);
      wln(`  ${A.dim}Story:${A.reset} ${story.title}`);
      wln(`  Total XP: ${A.brightGreen}${totalXp}${A.reset}  •  Level: ${A.brightCyan}${levelForXp(totalXp)}${A.reset}`);
      wln(`  ${xpBar(totalXp, 40)}`);
      wln();
      wln(divider('═', A.gold));
      wln();
      await delay(600);
    };

    // ────────────────────────────────────────────────────────────────────────
    // KEY HANDLER
    // ────────────────────────────────────────────────────────────────────────
    const handleKey = (key: string, domEvent: KeyboardEvent) => {
      if (isChoosing) {
        if (domEvent.key === 'ArrowUp') {
          choiceIndex = Math.max(0, choiceIndex - 1);
          redrawChoices();
        } else if (domEvent.key === 'ArrowDown') {
          choiceIndex = Math.min(choiceOptions.length - 1, choiceIndex + 1);
          redrawChoices();
        } else if (domEvent.key === 'Enter') {
          isChoosing = false;
          const resolve = resolveChoice!;
          resolveChoice = null;
          resolve(choiceOptions[choiceIndex]);
        } else {
          const num = parseInt(key, 10);
          if (num >= 1 && num <= choiceOptions.length) {
            choiceIndex = num - 1;
            redrawChoices();
          }
        }
        return;
      }

      if (isReading) {
        if (domEvent.key === 'Enter') {
          const line = inputBuffer;
          inputBuffer = '';
          isReading = false;
          w('\r\n');
          const resolve = resolveReadline!;
          resolveReadline = null;

          if (line === 'h' || line === 'H') { resolve('__hint__'); return; }
          if (line === 's' || line === 'S') { resolve('__skip__'); return; }
          if (line === 'q' || line === 'Q') { resolve('__quit__'); return; }

          resolve(line);
        } else if (domEvent.key === 'Backspace') {
          if (inputBuffer.length > 0) {
            inputBuffer = inputBuffer.slice(0, -1);
            w('\b \b');
          }
        } else if (
          !domEvent.ctrlKey &&
          !domEvent.metaKey &&
          !domEvent.altKey &&
          key.length === 1
        ) {
          inputBuffer += key;
          w(key);
        }
      }
    };

    // ────────────────────────────────────────────────────────────────────────
    // MAIN GAME LOOP
    // ────────────────────────────────────────────────────────────────────────
    const runGame = async () => {
      await showSplash();

      while (true) {
        const pack = await showBrowser();
        if (!pack) break;

        const story = await pickStory(pack);
        if (!story) continue; // back to pack browser

        const result = await playQuest(pack, story);
        if (result.quit) {
          wln(`  ${A.dim}→ Progress saved. Return to the terminal any time.${A.reset}`);
          wln();
        }
      }

      wln();
      wln(`  ${A.brightMagenta}${A.bold}✦ Connection terminated. Stay sharp, operator. ✦${A.reset}`);
      wln();
    };

    // ────────────────────────────────────────────────────────────────────────
    // INIT XTERM
    // ────────────────────────────────────────────────────────────────────────
    let fitAddon: import('@xterm/addon-fit').FitAddon;

    Promise.all([
      import('@xterm/xterm'),
      import('@xterm/addon-fit'),
    ]).then(([{ Terminal }, { FitAddon }]) => {
      term = new Terminal({
        theme: {
          background:          '#06060f',
          foreground:          '#c8c8d8',
          cursor:              '#00ffaa',
          cursorAccent:        '#06060f',
          selectionBackground: '#00ffaa22',
          black:               '#1a1a2e',
          red:                 '#ff5555',
          green:               '#50fa7b',
          yellow:              '#f1fa8c',
          blue:                '#6272a4',
          magenta:             '#ff79c6',
          cyan:                '#8be9fd',
          white:               '#c8c8d8',
          brightBlack:         '#44475a',
          brightRed:           '#ff6e6e',
          brightGreen:         '#69ff94',
          brightYellow:        '#ffffa5',
          brightBlue:          '#d6acff',
          brightMagenta:       '#ff92df',
          brightCyan:          '#a4ffff',
          brightWhite:         '#ffffff',
        },
        fontSize: 14,
        fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", "Courier New", monospace',
        cursorBlink: true,
        cursorStyle: 'block',
        scrollback: 3000,
        allowProposedApi: true,
        convertEol: true,
      });

      fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      if (containerRef.current) {
        term.open(containerRef.current);
        fitAddon.fit();
      }

      term.onKey(({ key, domEvent }: { key: string; domEvent: KeyboardEvent }) => {
        handleKey(key, domEvent);
      });

      runGame();
    });

    const handleResize = () => fitAddon?.fit();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term?.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        background: '#06060f',
        overflow: 'hidden',
      }}
    />
  );
}
