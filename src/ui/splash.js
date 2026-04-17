// Splash screen with animated figlet title.

import figlet from 'figlet';
import chalkAnimation from 'chalk-animation';
import { sunset, pinkCyan, neon, palette, supportsAnimation, symbols } from './theme.js';
import { divider } from './components.js';

export async function showSplash() {
  const title = figlet.textSync('Terminal Tutor', {
    font: 'Small Slant',
    horizontalLayout: 'default'
  });

  console.log('');
  if (supportsAnimation()) {
    const anim = chalkAnimation.rainbow(title, 2);
    await new Promise((r) => setTimeout(r, 1800));
    anim.stop();
    console.log('\x1b[' + (title.split('\n').length + 1) + 'A');
    // redraw static gradient version
    console.log(sunset(title));
  } else {
    console.log(sunset(title));
  }

  const tagline = `A gamified, story-driven CLI trainer  ${symbols.sword}  quests for real commands`;
  console.log('  ' + pinkCyan(tagline));
  console.log('  ' + palette.muted(`${symbols.sparkle} Learn by doing. Ship real commands. Level up. ${symbols.sparkle}`));
  console.log(divider());
}

export function showLevelUp(level) {
  const line = `  ${symbols.star}  LEVEL UP! You are now level ${level}  ${symbols.star}`;
  if (!supportsAnimation()) {
    console.log(neon(line));
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const anim = chalkAnimation.pulse(line, 2);
    setTimeout(() => { anim.stop(); console.log(''); resolve(); }, 1200);
  });
}
