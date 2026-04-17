// Top-level screens and flow. Owns the loop.

import { loadPacks, findPack } from './engine/loader.js';
import { runQuest } from './engine/runner.js';
import { loadProgress } from './engine/progress.js';
import { showSplash } from './ui/splash.js';
import { pickQuest, renderProfileHeader, showNoPacks } from './ui/browser.js';
import { createPlayerUi } from './ui/player.js';
import { palette, symbols } from './ui/theme.js';

export async function runApp() {
  await showSplash();

  const packs = await loadPacks();
  if (packs.length === 0) {
    showNoPacks();
    return;
  }

  const ui = createPlayerUi();

  // Main loop: browser → play → back to browser.
  while (true) {
    const state = loadProgress();
    renderProfileHeader(state.profile);

    let pick;
    try {
      pick = await pickQuest(packs, state);
    } catch (err) {
      // Inquirer throws on Ctrl+C; treat as clean exit.
      if (err?.name === 'ExitPromptError') return goodbye();
      throw err;
    }

    if (pick.action === 'exit') return goodbye();

    const pack = findPack(packs, pick.packId);
    if (!pack) {
      console.log(palette.danger(`unknown pack: ${pick.packId}`));
      continue;
    }

    try {
      const result = await runQuest(pack, ui);
      if (result.quit) {
        console.log('  ' + palette.muted(`${symbols.arrow} progress saved. return any time.`));
      }
    } catch (err) {
      if (err?.name === 'ExitPromptError') return goodbye();
      console.log(palette.danger(`quest crashed: ${err.message}`));
    }
  }
}

function goodbye() {
  console.log('');
  console.log('  ' + palette.accent(`${symbols.sparkle} may your shells be colorful, traveler. ${symbols.sparkle}`));
  console.log('');
}
