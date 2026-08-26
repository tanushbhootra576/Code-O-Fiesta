export type SubmissionStatus = 
  | 'pending' 
  | 'processing' 
  | 'accepted' 
  | 'wrong_answer' 
  | 'time_limit_exceeded' 
  | 'memory_limit_exceeded' 
  | 'runtime_error' 
  | 'compilation_error';

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timeMs: number;
  memoryKb: number;
  matchesExpected?: boolean;
}

export interface SubmissionResult {
  id: string;
  status: SubmissionStatus;
  testsPassed: number;
  totalTests: number;
  timeMs: number;
  memoryKb: number;
  failedTest?: FailedTest;
  compilerError?: string;
  pointsEarned?: number;
  constraintViolations?: ConstraintViolation[];
  sourceCode?: string;
  language?: string;
}

export interface FailedTest {
  index: number;
  input: string;
  expected: string;
  actual: string;
}

export interface ConstraintViolation {
  constraintId: string;
  line: number;
  column: number;
  message: string;
}
