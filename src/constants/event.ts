export const UserRole = {
  PARTICIPANT: 'PARTICIPANT',
  ADMIN: 'ADMIN',
  JUDGE: 'JUDGE',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const TeamMember = {
  MEMBER_1: 'MEMBER_1',
  MEMBER_2: 'MEMBER_2',
} as const;

export type TeamMember = (typeof TeamMember)[keyof typeof TeamMember];

export const TeamStatus = {
  ACTIVE: 'ACTIVE',
  DISQUALIFIED: 'DISQUALIFIED',
  COMPLETED: 'COMPLETED',
} as const;

export type TeamStatus = (typeof TeamStatus)[keyof typeof TeamStatus];

export const RoundStatus = {
  UPCOMING: 'UPCOMING',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
} as const;

export type RoundStatus = (typeof RoundStatus)[keyof typeof RoundStatus];

export const TeamRoundStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  DISQUALIFIED: 'DISQUALIFIED',
} as const;

export type TeamRoundStatus =
  (typeof TeamRoundStatus)[keyof typeof TeamRoundStatus];

export const Round1Path = {
  TRIANGLE: 'TRIANGLE',
  CIRCLE: 'CIRCLE',
  SQUARE: 'SQUARE',
  STAR: 'STAR',
} as const;

export type Round1Path = (typeof Round1Path)[keyof typeof Round1Path];

export const Round1Topic = {
  BASIC_MATH_NUMBERS: 'BASIC_MATH_NUMBERS',
  STRING_MANIPULATION: 'STRING_MANIPULATION',
  ARRAYS_LOGIC: 'ARRAYS_LOGIC',
  LOOPS_PATTERNS: 'LOOPS_PATTERNS',
} as const;

export type Round1Topic = (typeof Round1Topic)[keyof typeof Round1Topic];

export const Round2Phase = {
  MEMBER_1: 'MEMBER_1',
  MEMBER_2: 'MEMBER_2',
  COMPLETED: 'COMPLETED',
} as const;

export type Round2Phase = (typeof Round2Phase)[keyof typeof Round2Phase];

export const ProblemDifficulty = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
} as const;

export type ProblemDifficulty =
  (typeof ProblemDifficulty)[keyof typeof ProblemDifficulty];

export const ProblemTopic = {
  BASIC_MATH_NUMBERS: 'BASIC_MATH_NUMBERS',
  STRING_MANIPULATION: 'STRING_MANIPULATION',
  ARRAYS_LOGIC: 'ARRAYS_LOGIC',
  LOOPS_PATTERNS: 'LOOPS_PATTERNS',
  GENERAL: 'GENERAL',
} as const;

export type ProblemTopic = (typeof ProblemTopic)[keyof typeof ProblemTopic];

export const SubmissionVerdict = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  WRONG_ANSWER: 'WRONG_ANSWER',
  COMPILATION_ERROR: 'COMPILATION_ERROR',
  RUNTIME_ERROR: 'RUNTIME_ERROR',
  TIME_LIMIT: 'TIME_LIMIT',
  MEMORY_LIMIT: 'MEMORY_LIMIT',
  AST_CONSTRAINT_FAILED: 'AST_CONSTRAINT_FAILED',
  SYSTEM_ERROR: 'SYSTEM_ERROR',
} as const;

export type SubmissionVerdict =
  (typeof SubmissionVerdict)[keyof typeof SubmissionVerdict];
