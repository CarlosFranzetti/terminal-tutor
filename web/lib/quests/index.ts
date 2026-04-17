import githubCli from './github-cli';
import copilotCli from './copilot-cli';
import type { Pack } from '../types';

export const allPacks: Pack[] = [githubCli, copilotCli];
