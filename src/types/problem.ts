export type SupportedLanguage = 'cpp' | 'python' | 'java' | 'javascript' | 'c' | 'go';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type IDEMode = 'standard' | 'relay' | 'constraint';

export interface RoundProblem {
  id: string;
  title: string;
  difficulty: Difficulty;
  points: number;
  statement: string;
  examples: Example[];
  constraints: string[];
  timeLimit: number;
  memoryLimit: number;
  roundNumber: 1 | 2 | 3;
  status?: string;
}

export interface Problem extends RoundProblem {}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface RoundIDEConfig {
  mode: IDEMode;
  // relay mode
  activeTeamMember?: 'member1' | 'member2';
  currentUserId?: string;
  forceSwitchAfterMs?: number;
  serverCode?: string | null;
  // constraint mode
  activeConstraints?: CodeConstraint[];
  // standard
  problemIds?: string[];
}

export interface CodeConstraint {
  id: string;
  label: string;
  description: string;
  type: 'no-loops' | 'no-recursion' | 'max-variables' | 'forbidden-keyword' | 'custom';
  value?: number | string;
}
