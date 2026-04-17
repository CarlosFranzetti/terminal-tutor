// Player UI — implements the contract consumed by engine/runner.js.

import { input, select, confirm } from '@inquirer/prompts';
import ora from 'ora';
import chalk from 'chalk';
import { palette, pinkCyan, sunset, neon, symbols, supportsAnimation } from './theme.js';
import { panel, divider, typewriter, bar, xpBurst, keyHint } from './components.js';

export function createPlayerUi() {
  return {
    async renderQuestStart(pack, story) {
      console.log('');
      console.log('  ' + sunset(`${symbols.sword}  ${pack.title}`));
      console.log('  ' + pinkCyan(story.title));
      console.log('  ' + palette.muted(story.setting));
      console.log(divider());
    },

    async renderStepIntro(step, ctx) {
      console.log('\n' + '  ' + palette.dim(`${ctx.questTitle}  •  ${ctx.storyTitle}`));
      console.log('');

      // ASCII art if present
      if (step.art) {
        const artLines = step.art.split('\n');
        for (const line of artLines) {
          console.log('  ' + chalk.cyan.dim(line));
        }
        console.log('');
      }

      await typewriter('  ' + step.narration, { cps: 480, gradientFn: undefined });
      console.log('');
      console.log(panel(palette.accent(step.objective), { color: 'cyan', title: '  objective  ' }));
    },

    async promptCommand(step) {
      if (step.verify.mode === 'prompt') {
        const answer = await select({
          message: pinkCyan('What do you choose?'),
          choices: step.verify.choices.map((c) => ({ name: c, value: c })),
          loop: false
        });
        return { kind: 'run', answer };
      }

      const footer = keyHint([
        { key: 'enter', label: 'run' },
        { key: 'h', label: 'hint' },
        { key: 's', label: 'skip' },
        { key: 'q', label: 'quit' }
      ]);
      console.log('  ' + footer);

      const raw = await input({
        message: pinkCyan(`${symbols.arrow} shell ${symbols.bullet}`),
        validate: () => true
      });

      const trimmed = (raw || '').trim();
      if (!trimmed) return { kind: 'hint' };
      if (trimmed === 'h' || trimmed === 'hint' || trimmed === ':h') return { kind: 'hint' };
      if (trimmed === 's' || trimmed === 'skip' || trimmed === ':s') {
        const yes = await confirm({ message: 'Skip this step? (no XP)', default: false });
        if (yes) return { kind: 'skip' };
        return { kind: 'hint' };
      }
      if (trimmed === 'q' || trimmed === 'quit' || trimmed === ':q' || trimmed === 'exit') {
        const yes = await confirm({ message: 'Quit this quest? Progress is saved.', default: true });
        if (yes) return { kind: 'quit' };
        return { kind: 'hint' };
      }
      return { kind: 'run', command: trimmed };
    },

    // Branch picker — called when engine hits a BranchPoint
    async pickBranch(branchPoint) {
      console.log('');
      console.log('  ' + pinkCyan(`⚡ ${branchPoint.narration}`));
      console.log('');

      const choices = branchPoint.branches.map((b) => ({
        name: `${palette.accent(b.label)}\n      ${palette.muted(b.flavor)}`,
        value: b.label,
        short: b.label
      }));

      const pick = await select({
        message: pinkCyan('Choose your path'),
        choices,
        loop: false
      });

      return branchPoint.branches.find(b => b.label === pick) ?? null;
    },

    renderVerifying() {
      if (!supportsAnimation()) {
        console.log(palette.muted('  verifying...'));
        return {
          succeed() { console.log(palette.ok(`  ${symbols.check} verified`)); },
          fail() { console.log(palette.danger(`  ${symbols.cross} not yet`)); }
        };
      }
      const spinner = ora({
        text: pinkCyan('  channeling the shell...'),
        spinner: 'dots12',
        color: 'magenta'
      }).start();
      return {
        succeed() { spinner.succeed(palette.ok('verified')); },
        fail() { spinner.fail(palette.danger('not yet')); }
      };
    },

    async renderSuccess(step, xpGained) {
      console.log('');
      await xpBurst(xpGained);
      console.log('  ' + sunset(`${symbols.check} ${step.objective}`));
      console.log('');
    },

    renderFailure(step, reason) {
      console.log('  ' + palette.danger(`${symbols.cross} ${reason}`));
      console.log('  ' + palette.muted(`try again, ask for a hint with ${chalk.bold('h')}, or skip with ${chalk.bold('s')}`));
    },

    renderHint(text, index, total) {
      const title = total > 0 ? `  hint ${index} of ${total}  ` : '  hints  ';
      console.log(panel(palette.warn(text), { color: 'yellow', title }));
    },

    async renderQuestComplete(pack, totalXp) {
      console.log('');
      console.log(panel(
        `${neon(`${symbols.star}  MISSION ACCOMPLISHED  ${symbols.star}`)}\n\n` +
        `${palette.accent(pack.title)}\n` +
        `${palette.muted('total xp:')} ${sunset(String(totalXp))}`,
        { color: 'magenta', title: '  victory  ' }
      ));
      console.log('');
    }
  };
}
