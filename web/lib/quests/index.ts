import terminalBasics from './terminal-basics';
import terminalBasics2 from './terminal-basics-2';
import githubCli from './github-cli';
import copilotCli from './copilot-cli';
import claudeCode from './claude-code';
import gitBasics from './git-basics';
import type { Pack } from '../types';

const packs: Pack[] = [terminalBasics, terminalBasics2, githubCli, copilotCli, claudeCode, gitBasics];

export const allPacks: Pack[] = packs.sort((a, b) => {
  const ao = typeof a.order === 'number' ? a.order : Infinity;
  const bo = typeof b.order === 'number' ? b.order : Infinity;
  if (ao !== bo) return ao - bo;
  return a.title.localeCompare(b.title);
});
