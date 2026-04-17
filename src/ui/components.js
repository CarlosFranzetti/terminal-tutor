// Shared UI primitives: typewriter, boxed panel, progress bar, divider, XP burst.

import boxen from 'boxen';
import chalk from 'chalk';
import { palette, symbols, noColor, termWidth, supportsAnimation, neon, sunset } from './theme.js';

export function divider(char = '─') {
  const w = Math.min(termWidth(), 80);
  return palette.muted(char.repeat(w));
}

export function panel(text, options = {}) {
  return boxen(text, {
    padding: 1,
    margin: { top: 0, bottom: 0, left: 2, right: 2 },
    borderStyle: 'round',
    borderColor: options.color || 'magenta',
    title: options.title,
    titleAlignment: 'center',
    dimBorder: false,
    ...options
  });
}

export async function typewriter(text, { cps = 320, gradientFn } = {}) {
  if (!supportsAnimation() || process.env.TT_NO_TYPEWRITER === '1') {
    process.stdout.write((gradientFn ? gradientFn(text) : text) + '\n');
    return;
  }
  const delayMs = Math.max(4, Math.floor(1000 / cps));
  const lines = text.split('\n');
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    for (let i = 0; i < line.length; i++) {
      const chunk = line.slice(0, i + 1);
      process.stdout.write('\r' + (gradientFn ? gradientFn(chunk) : chunk));
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, delayMs));
    }
    process.stdout.write('\n');
  }
}

export function bar(ratio, width = 24, color = 'magenta') {
  const clamped = Math.max(0, Math.min(1, ratio));
  const filled = Math.round(clamped * width);
  const empty = width - filled;
  const filledSegment = '█'.repeat(filled);
  const emptySegment = '░'.repeat(empty);
  if (noColor()) return filledSegment + emptySegment;
  const tint = color === 'rainbow' ? neon : (s) => chalk.hex(colorForName(color))(s);
  return tint(filledSegment) + palette.muted(emptySegment);
}

function colorForName(name) {
  switch (name) {
    case 'magenta': return '#ff79c6';
    case 'green': return '#50fa7b';
    case 'cyan': return '#8be9fd';
    case 'orange': return '#ffb86c';
    case 'purple': return '#bd93f9';
    default: return '#ff79c6';
  }
}

export async function xpBurst(xpGained) {
  const parts = [
    `${symbols.sparkle} ${symbols.star} ${symbols.sparkle}`,
    `+${xpGained} XP`,
    `${symbols.sparkle} ${symbols.star} ${symbols.sparkle}`
  ];
  if (!supportsAnimation()) {
    console.log(sunset(parts.join('  ')));
    return;
  }
  const frames = [
    sunset(`   ${symbols.sparkle}  +${xpGained} XP  ${symbols.sparkle}   `),
    neon(`  ${symbols.star}  +${xpGained} XP  ${symbols.star}  `),
    sunset(` ${symbols.sparkle}${symbols.star} +${xpGained} XP ${symbols.star}${symbols.sparkle} `),
    neon(`${symbols.star}${symbols.sparkle}${symbols.star} +${xpGained} XP ${symbols.star}${symbols.sparkle}${symbols.star}`)
  ];
  for (const f of frames) {
    process.stdout.write('\r  ' + f + '   ');
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, 120));
  }
  process.stdout.write('\n');
}

export function keyHint(keys) {
  // keys: [{key, label}]
  const parts = keys.map(({ key, label }) => palette.accent(`[${key}]`) + ' ' + palette.muted(label));
  return parts.join('  ' + palette.muted(symbols.bullet) + '  ');
}
