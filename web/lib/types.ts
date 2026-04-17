export type VerifySpec = {
  mode: 'shell' | 'which' | 'prompt';
  // shell mode
  exitCode?: number;
  stdoutContains?: string;
  stdoutMatches?: string;
  stderrContains?: string;
  custom?: (result: ShellResult) => { ok: boolean; reason?: string };
  // which mode
  binary?: string;
  // prompt mode
  choices?: string[];
  answer?: string;
};

export type Step = {
  id: string;
  narration: string;
  objective: string;
  verify: VerifySpec;
  hints: string[];
  xp: number;
};

export type Pack = {
  id: string;
  title: string;
  synopsis: string;
  tool: string;
  steps: Step[];
};

export type ShellResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
};

export type QuestState = {
  completedStepIds: string[];
  currentStepId: string | null;
  hintsUsed: Record<string, number>;
  startedAt: string;
  completedAt: string | null;
};

export type ProgressState = {
  profile: { xp: number; level: number; createdAt: string };
  quests: Record<string, QuestState>;
};
