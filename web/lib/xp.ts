export function levelForXp(xp: number): number {
  if (xp <= 0) return 1;
  return Math.max(1, Math.ceil(Math.sqrt(xp / 50)));
}

export function xpForNextLevel(xp: number): number {
  const level = levelForXp(xp);
  const nextThreshold = Math.pow(level, 2) * 50;
  return Math.max(0, nextThreshold - xp);
}

export function progressToNextLevel(xp: number): number {
  const level = levelForXp(xp);
  const prevThreshold = Math.pow(level - 1, 2) * 50;
  const nextThreshold = Math.pow(level, 2) * 50;
  const span = nextThreshold - prevThreshold;
  if (span <= 0) return 1;
  return Math.min(1, Math.max(0, (xp - prevThreshold) / span));
}
