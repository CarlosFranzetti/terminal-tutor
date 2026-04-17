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
  trackHintUsed,
} from '@/lib/progress';
import type { Pack, Step } from '@/lib/types';

// ─── ANSI color helpers ───────────────────────────────────────────────────────
const A = {
  reset:        '\x1b[0m',
  bold:         '\x1b[1m',
  dim:          '\x1b[2m',
  green:        '\x1b[32m',
  brightGreen:  '\x1b[92m',
  cyan:         '\x1b[36m',
  brightCyan:   '\x1b[96m',
  yellow:       '\x1b[33m',
  brightYellow: '\x1b[93m',
  magenta:      '\x1b[35m',
  brightMagenta:'\x1b[95m',
  red:          '\x1b[31m',
  white:        '\x1b[37m',
  brightWhite:  '\x1b[97m',
  blue:         '\x1b[34m',
  brightBlue:   '\x1b[94m',
};

const SPLASH_ART = `
   ______              _           __   ______      __
  /_  __/__  ________ (_)__  ___ _/ /  /_  __/_ __/ /____  ____
   / / / _ \\/ __/ __ // / _ \\/ _ \`/ /    / / / // / __/ _ \\/ __/
  /_/  \\___/_/ /_/ /_/_/_//_/\\_,_/_/    /_/  \\_,_/\\__/\\___/_/
`;

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

    // Write helper (always use \r\n)
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
      // Move cursor up to overwrite previous render
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

    // ── Delay helper ────────────────────────────────────────────────────────
    const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

    // ────────────────────────────────────────────────────────────────────────
    // SPLASH SCREEN
    // ────────────────────────────────────────────────────────────────────────
    const showSplash = async () => {
      wln();
      // Print ASCII art with gradient effect
      const lines = SPLASH_ART.split('\n').filter(l => l.length > 0);
      const colors = [A.brightCyan, A.cyan, A.brightBlue, A.blue];
      for (let i = 0; i < lines.length; i++) {
        wln(colors[i % colors.length] + A.bold + lines[i] + A.reset);
        await delay(60);
      }
      wln();
      await typewrite(
        A.dim + '  Gamified, story-driven CLI trainer. Learn by doing.' + A.reset,
        14,
      );
      wln();
      await delay(400);
      wln(A.brightGreen + '  ✦  Two quests loaded. Press ' + A.bold + 'Enter' + A.reset + A.brightGreen + ' to begin...' + A.reset);
      wln();
      await readline('');
    };

    // ────────────────────────────────────────────────────────────────────────
    // QUEST BROWSER
    // ────────────────────────────────────────────────────────────────────────
    const showBrowser = async (): Promise<Pack | null> => {
      const state = loadProgress();
      const xp = state.profile.xp;
      const level = levelForXp(xp);

      wln(divider());
      wln();
      wln(
        `  ${A.brightYellow}${A.bold}TRAVELER PROFILE${A.reset}  ` +
        `${A.cyan}Level ${level}${A.reset}  ` +
        `${A.dim}XP: ${xp}${A.reset}  ` +
        xpBar(xp, 20),
      );
      wln();
      wln(divider());
      wln();
      wln(`  ${A.bold}${A.brightWhite}SELECT A QUEST${A.reset}`);
      wln();

      const opts = [
        ...allPacks.map(p => {
          const q = state.quests[p.id];
          const done = q?.completedAt ? A.brightGreen + ' ✓ completed' + A.reset : '';
          const resumed = q && !q.completedAt && q.completedStepIds.length > 0
            ? A.yellow + ` (step ${q.completedStepIds.length + 1}/${p.steps.length})` + A.reset
            : '';
          return `${p.title}${done}${resumed}`;
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
    // QUEST PLAYER
    // ────────────────────────────────────────────────────────────────────────
    const playQuest = async (pack: Pack): Promise<{ quit: boolean }> => {
      const state = loadProgress();
      const q = ensureQuestState(state, pack.id);
      const done = new Set(q.completedStepIds);
      saveProgress(state);

      // Find resume point
      let startIdx = 0;
      for (let i = 0; i < pack.steps.length; i++) {
        if (!done.has(pack.steps[i].id)) { startIdx = i; break; }
        if (i === pack.steps.length - 1) startIdx = pack.steps.length;
      }

      wln();
      wln(divider('═', A.brightCyan));
      wln(`  ${A.brightCyan}${A.bold}⚔  ${pack.title}${A.reset}`);
      wln(`  ${A.dim}${pack.synopsis}${A.reset}`);
      if (startIdx > 0) wln(`  ${A.yellow}↩  Resuming from step ${startIdx + 1}${A.reset}`);
      wln(divider('═', A.brightCyan));
      wln();

      if (startIdx >= pack.steps.length) {
        const s = loadProgress();
        markQuestComplete(s, pack.id);
        saveProgress(s);
        await showQuestComplete(pack, s.profile.xp);
        return { quit: false };
      }

      for (let i = startIdx; i < pack.steps.length; i++) {
        const step = pack.steps[i];
        const state2 = loadProgress();
        setCurrentStep(state2, pack.id, step.id);
        saveProgress(state2);

        let hintsUsed = 0;
        let resolved = false;

        await showStepIntro(step, i, pack.steps.length, pack.title);

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
              wln(`  ${A.dim}You have heard all I can tell you, traveler.${A.reset}`);
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

          // Run verification
          w(`  ${A.dim}verifying...${A.reset}`);
          await delay(400);
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
              `${A.brightYellow}+${gained} XP${A.reset}  ${A.dim}(${A.reset}Level ${levelForXp(s4.profile.xp)}${A.dim})${A.reset}`,
            ], A.brightGreen));
            wln();
            await delay(600);
            resolved = true;
          } else {
            wln();
            wln(`  ${A.red}✗ Not quite.${A.reset} ${A.dim}${result.reason || 'Try again.'}${A.reset}`);
            wln(`  ${A.dim}Type ${A.reset}h${A.dim} for a hint, ${A.reset}s${A.dim} to skip, or try another command.${A.reset}`);
            wln();
          }
        }
      }

      const finalState = loadProgress();
      markQuestComplete(finalState, pack.id);
      saveProgress(finalState);
      await showQuestComplete(pack, finalState.profile.xp);
      return { quit: false };
    };

    // ── Step intro ──────────────────────────────────────────────────────────
    const showStepIntro = async (step: Step, idx: number, total: number, questTitle: string) => {
      wln(divider('─', A.dim));
      wln(`  ${A.dim}${questTitle}  •  Step ${idx + 1} / ${total}${A.reset}`);
      wln();
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
    const showQuestComplete = async (pack: Pack, totalXp: number) => {
      wln();
      wln(divider('═', A.brightYellow));
      wln();
      await typewrite(
        `  ${A.brightYellow}${A.bold}✦ QUEST COMPLETE: ${pack.title} ✦${A.reset}`,
        14,
      );
      wln('\r\n');
      wln(`  Total XP: ${A.brightGreen}${totalXp}${A.reset}  •  Level: ${A.brightCyan}${levelForXp(totalXp)}${A.reset}`);
      wln(`  ${xpBar(totalXp, 40)}`);
      wln();
      wln(divider('═', A.brightYellow));
      wln();
      await delay(600);
    };

    // ────────────────────────────────────────────────────────────────────────
    // KEY HANDLER
    // ────────────────────────────────────────────────────────────────────────
    const handleKey = (key: string, domEvent: KeyboardEvent) => {
      // Multiple-choice navigation
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

      // Readline
      if (isReading) {
        if (domEvent.key === 'Enter') {
          const line = inputBuffer;
          inputBuffer = '';
          isReading = false;
          w('\r\n');
          const resolve = resolveReadline!;
          resolveReadline = null;

          // Map single-char shortcuts
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

        const result = await playQuest(pack);
        if (result.quit) {
          wln(`  ${A.dim}→ Progress saved. Return any time.${A.reset}`);
          wln();
        }
      }

      wln();
      wln(`  ${A.brightMagenta}✨ May your shells be colorful, traveler. ✨${A.reset}`);
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
          background:     '#0a0a0f',
          foreground:     '#d0d0d8',
          cursor:         '#00ff88',
          cursorAccent:   '#0a0a0f',
          selectionBackground: '#00ff8830',
          black:          '#1a1a2e',
          red:            '#ff5555',
          green:          '#50fa7b',
          yellow:         '#f1fa8c',
          blue:           '#6272a4',
          magenta:        '#ff79c6',
          cyan:           '#8be9fd',
          white:          '#d0d0d8',
          brightBlack:    '#44475a',
          brightRed:      '#ff6e6e',
          brightGreen:    '#69ff94',
          brightYellow:   '#ffffa5',
          brightBlue:     '#d6acff',
          brightMagenta:  '#ff92df',
          brightCyan:     '#a4ffff',
          brightWhite:    '#ffffff',
        },
        fontSize: 14,
        fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", "Courier New", monospace',
        cursorBlink: true,
        cursorStyle: 'block',
        scrollback: 2000,
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
        background: '#0a0a0f',
        overflow: 'hidden',
      }}
    />
  );
}
