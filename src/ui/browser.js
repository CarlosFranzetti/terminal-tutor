// Quest browser: pick a pack and story to play.

import { select } from '@inquirer/prompts';
import { palette, pinkCyan, neon, symbols } from './theme.js';
import { panel, bar, divider } from './components.js';
import { progressToNextLevel, levelForXp } from '../engine/xp.js';

export function renderProfileHeader(profile) {
  const level = levelForXp(profile.xp || 0);
  const progress = progressToNextLevel(profile.xp || 0);
  const line1 = `${symbols.gem} ${palette.accent('Operator Profile')}  ${palette.muted('level')} ${neon(String(level))}  ${palette.muted('xp')} ${pinkCyan(String(profile.xp || 0))}`;
  const line2 = `  ${bar(progress, 30, 'magenta')}  ${palette.muted('next level')}`;
  console.log('\n' + line1);
  console.log(line2);
  console.log(divider());
}

const MAIN_QUEST_IDS = new Set(['terminal-basics', 'terminal-basics-2']);

export async function pickQuest(packs, progressState) {
  if (packs.length === 0) {
    console.log(palette.danger('No quest packs found in /quests.'));
    return { action: 'exit' };
  }

  const activePacks  = packs.filter(p => !progressState.quests[p.id]?.completedAt);
  const completedIds = new Set(packs.filter(p => progressState.quests[p.id]?.completedAt).map(p => p.id));

  const makeChoice = (pack) => {
    const q = progressState.quests[pack.id];
    const storyCount = pack.stories?.length ?? 1;
    const done = q ? q.completedStepIds.length : 0;
    const isMain = MAIN_QUEST_IDS.has(pack.id);
    const mainBadge = isMain ? palette.ok(' ★ MAIN QUEST') : '';
    const status =
      done > 0 ? palette.warn(`${symbols.arrow} in progress`) :
      palette.muted(`${symbols.star} new`);
    return {
      name: `${palette.accent(pack.title)}${mainBadge}  ${palette.muted(symbols.bullet)}  ${palette.muted(pack.tool)}  ${palette.muted(`[${storyCount} stories]`)}  ${status}\n      ${palette.muted(pack.synopsis)}`,
      value: pack.id,
      short: pack.title
    };
  };

  const choices = activePacks.map(makeChoice);

  if (completedIds.size > 0) {
    choices.push({
      name: palette.muted(`${symbols.gem} Completed Quests  ${palette.dim(`(${completedIds.size})`)}`),
      value: '__completed__',
      short: 'Completed Quests'
    });
  }
  choices.push({ name: palette.muted(`${symbols.cross} Quit`), value: '__quit__', short: 'quit' });

  const pick = await select({
    message: pinkCyan('Choose your quest'),
    choices,
    loop: false,
    pageSize: Math.max(6, choices.length)
  });

  if (pick === '__quit__') return { action: 'exit' };
  if (pick === '__completed__') return { action: 'completed' };
  return { action: 'play', packId: pick };
}

export async function pickCompletedQuest(packs, progressState) {
  const completed = packs.filter(p => progressState.quests[p.id]?.completedAt);
  if (completed.length === 0) {
    console.log(palette.muted('  No completed quests yet.'));
    return null;
  }

  const choices = completed.map((pack) => {
    const q = progressState.quests[pack.id];
    const completedAt = q?.completedAt ? new Date(q.completedAt).toLocaleDateString() : '';
    return {
      name: `${palette.ok(`${symbols.check}`)}  ${palette.accent(pack.title)}  ${palette.muted(`completed ${completedAt}`)}\n      ${palette.muted(pack.synopsis)}`,
      value: pack.id,
      short: pack.title
    };
  });
  choices.push({ name: palette.muted(`${symbols.arrow} Back`), value: '__back__', short: 'back' });

  const pick = await select({
    message: pinkCyan('Completed Quests — replay any time'),
    choices,
    loop: false,
    pageSize: Math.max(6, choices.length)
  });

  if (pick === '__back__') return null;
  return { action: 'play', packId: pick };
}

export async function pickStory(pack, progressState) {
  const q = progressState.quests[pack.id];

  const choices = pack.stories.map((story) => {
    const isActive = q?.storyId === story.id;
    const badge = isActive ? palette.warn(' ← last played') : '';
    return {
      name: `${palette.accent(story.title)}${badge}\n      ${palette.muted(story.setting)}`,
      value: story.id,
      short: story.title
    };
  });
  choices.push({ name: palette.muted(`${symbols.arrow} Back`), value: '__back__', short: 'back' });

  const pick = await select({
    message: pinkCyan(`Choose a story — ${pack.title}`),
    choices,
    loop: false,
    pageSize: Math.max(6, choices.length)
  });

  if (pick === '__back__') return null;
  return pack.stories.find(s => s.id === pick) ?? null;
}

export function showNoPacks() {
  console.log(panel(
    'No quest packs found.\nAdd a file under ./quests/ and relaunch.',
    { color: 'red', title: 'empty catalog' }
  ));
}
