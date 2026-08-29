export type SubmissionStatus = 
  | 'pending' 
  | 'processing' 
  | 'accepted' 
  | 'wrong_answer' 
  | 'time_limit_exceeded' 
  | 'memory_limit_exceeded' 
  | 'runtime_error' 
  | 'compilation_error';

export type Verdict = 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'COMPILATION_ERROR' | 'RUNTIME_ERROR' | 'PENDING' | 'EXECUTED';

export type TestCaseResult = {
  caseNumber: number;
  verdict: Verdict;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  stderr?: string;
  compileOutput?: string;
  executionTime?: number;
  memory?: number;
  matchesExpected?: boolean;
};

export type RunResult = 
  | {
      mode: "examples";
      verdict: Verdict;
      passed: number;
      total: number;
      cases: TestCaseResult[];
    }
  | {
      mode: "custom";
      status: string;
      verdict: Verdict;
      stdout: string;
      stderr: string;
      compileOutput: string;
      executionTime: number;
      memory: number;
    };

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
