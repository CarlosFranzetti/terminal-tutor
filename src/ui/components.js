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

function wordWrap(text, maxWidth) {
  const result = [];
  for (const line of text.split('\n')) {
    if (line.length <= maxWidth) { result.push(line); continue; }
    const indentMatch = line.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1] : '';
    const available = Math.max(20, maxWidth - indent.length);
    const words = line.slice(indent.length).split(' ');
    let current = '';
    for (const word of words) {
      if (!current) { current = word; }
      else if (current.length + 1 + word.length <= available) { current += ' ' + word; }
      else { result.push(indent + current); current = word; }
    }
    if (current) result.push(indent + current);
  }
  return result.join('\n');
}

export async function typewriter(text, { cps = 368, gradientFn } = {}) {
  const width = Math.min(termWidth(), 110) - 4;
  const wrapped = wordWrap(text, width);
  if (!supportsAnimation() || process.env.TT_NO_TYPEWRITER === '1') {
    process.stdout.write((gradientFn ? gradientFn(wrapped) : wrapped) + '\n');
    return;
  }
  const delayMs = Math.max(4, Math.floor(1000 / cps));
  const lines = wrapped.split('\n');
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      process.stdout.write(gradientFn ? gradientFn(char) : char);
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
