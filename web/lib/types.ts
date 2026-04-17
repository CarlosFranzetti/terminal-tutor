export type ShellResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
};

export type VerifySpec = {
  mode: 'shell' | 'which' | 'prompt';
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
  // accept multiple valid answers
  answers?: string[];
};

export type Step = {
  id: string;
  type?: 'step';
  narration: string;
  objective: string;
  verify: VerifySpec;
  hints: string[];
  xp: number;
  // optional ASCII art shown before narration
  art?: string;
};

export type Branch = {
  label: string;          // shown in picker
  flavor: string;         // one-line description
  steps: Step[];          // branch-specific steps (converge after)
};

export type BranchPoint = {
  id: string;
  type: 'branch';
  narration: string;
  branches: Branch[];
};

export type StepOrBranch = Step | BranchPoint;

export type Story = {
  id: string;
  title: string;
  setting: string;        // one-liner shown in story picker
  art?: string;           // ascii art for this story's intro
  steps: StepOrBranch[];
};

export type Pack = {
  id: string;
  title: string;
  synopsis: string;
  tool: string;
  stories: Story[];
};

export type QuestState = {
  storyId: string | null;
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
