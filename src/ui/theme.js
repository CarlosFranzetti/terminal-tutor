// Palette, gradients, and symbols. Detects NO_COLOR and narrow terminals.

import chalk from 'chalk';
import gradient from 'gradient-string';

export const noColor = () => process.env.NO_COLOR === '1' || process.env.NO_COLOR === 'true';

export const termWidth = () => (process.stdout.columns && process.stdout.columns > 0 ? process.stdout.columns : 80);

export const isNarrow = () => termWidth() < 70;

export const palette = {
  accent: chalk.hex('#ff79c6'),
  heroA: chalk.hex('#8be9fd'),
  heroB: chalk.hex('#50fa7b'),
  heroC: chalk.hex('#ffb86c'),
  muted: chalk.gray,
  warn: chalk.hex('#f1fa8c'),
  danger: chalk.hex('#ff5555'),
  ok: chalk.hex('#50fa7b'),
  dim: chalk.dim
};

export const bold = chalk.bold;

export const pinkCyan = noColor()
  ? (s) => s
  : gradient(['#ff79c6', '#8be9fd']);

export const sunset = noColor()
  ? (s) => s
  : gradient(['#ffb86c', '#ff79c6', '#bd93f9']);

export const neon = noColor()
  ? (s) => s
  : gradient(['#50fa7b', '#8be9fd', '#bd93f9', '#ff79c6']);

export const symbols = {
  bullet: '•',
  arrow: '→',
  check: '✔',
  cross: '✘',
  star: '★',
  sparkle: '✦',
  heart: '♥',
  sword: '⚔',
  scroll: '✎',
  gem: '◆'
};

export function supportsAnimation() {
  if (noColor()) return false;
  if (!process.stdout.isTTY) return false;
  return true;
}

export function gradientFor(name) {
  switch (name) {
    case 'sunset': return sunset;
    case 'neon': return neon;
    case 'pinkCyan':
    default: return pinkCyan;
  }
}
