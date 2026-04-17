import type { Step } from './types';

export function nextHint(step: Step, hintsUsed: number): { text: string; index: number; total: number } | null {
  if (!step.hints || step.hints.length === 0) return null;
  const idx = Math.min(hintsUsed, step.hints.length - 1);
  return { text: step.hints[idx], index: idx, total: step.hints.length };
}

export function xpAfterHints(step: Step, hintsUsed: number): number {
  const base = step.xp || 0;
  if (hintsUsed <= 0) return base;
  const penalty = base * 0.25 * hintsUsed;
  const minimum = Math.max(5, Math.floor(base * 0.25));
  return Math.max(minimum, Math.floor(base - penalty));
}
