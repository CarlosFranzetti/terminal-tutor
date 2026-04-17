// Hint ladder + XP penalty math. Pure, unit-testable.

export function nextHint(step, hintsUsed) {
  if (!step.hints || step.hints.length === 0) return null;
  const idx = Math.min(hintsUsed, step.hints.length - 1);
  return { text: step.hints[idx], index: idx, total: step.hints.length };
}

export function xpAfterHints(step, hintsUsed) {
  const base = step.xp || 0;
  if (hintsUsed <= 0) return base;
  // Each hint costs 25% of base. Floor at 25% (or 5, whichever higher).
  const penalty = base * 0.25 * hintsUsed;
  const minimum = Math.max(5, Math.floor(base * 0.25));
  return Math.max(minimum, Math.floor(base - penalty));
}
