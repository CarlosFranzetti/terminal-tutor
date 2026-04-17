// Quest browser: pick a pack to play.

import { select } from '@inquirer/prompts';
import { palette, pinkCyan, neon, symbols } from './theme.js';
import { panel, bar, divider } from './components.js';
import { progressToNextLevel, levelForXp } from '../engine/xp.js';

export function renderProfileHeader(profile) {
  const level = levelForXp(profile.xp || 0);
  const progress = progressToNextLevel(profile.xp || 0);
  const line1 = `${symbols.gem} ${palette.accent('Profile')}  ${palette.muted('level')} ${neon(String(level))}  ${palette.muted('xp')} ${pinkCyan(String(profile.xp || 0))}`;
  const line2 = `  ${bar(progress, 30, 'magenta')}  ${palette.muted('next level')}`;
  console.log('\n' + line1);
  console.log(line2);
  console.log(divider());
}

export async function pickQuest(packs, progressState) {
  if (packs.length === 0) {
    console.log(palette.danger('No quest packs found in /quests.'));
    return { action: 'exit' };
  }

  const choices = packs.map((pack) => {
    const q = progressState.quests[pack.id];
    const total = pack.steps.length;
    const done = q ? q.completedStepIds.length : 0;
    const status =
      q?.completedAt ? palette.ok(`${symbols.check} completed`) :
      done > 0 ? palette.warn(`${symbols.arrow} in progress ${done}/${total}`) :
      palette.muted(`${symbols.star} new`);
    return {
      name: `${palette.accent(pack.title)}  ${palette.muted(symbols.bullet)}  ${palette.muted(pack.tool)}  ${palette.muted(symbols.bullet)}  ${status}\n      ${palette.muted(pack.synopsis)}`,
      value: pack.id,
      short: pack.title
    };
  });
  choices.push({ name: palette.muted(`${symbols.cross} Quit`), value: '__quit__', short: 'quit' });

  const pick = await select({
    message: pinkCyan('Choose your quest'),
    choices,
    loop: false,
    pageSize: Math.max(6, choices.length)
  });

  if (pick === '__quit__') return { action: 'exit' };
  return { action: 'play', packId: pick };
}

export function showNoPacks() {
  console.log(panel(
    'No quest packs found.\nAdd a file under ./quests/ and relaunch.',
    { color: 'red', title: 'empty catalog' }
  ));
}
