import { NextResponse } from 'next/server';

import { Round2Phase, TeamMember, TeamRoundStatus } from '@/constants/event';
import connectDB from '@/lib/db';
import Problem, { type ProblemDocument } from '@/models/Problem';
import Round from '@/models/Round';
import TeamRound from '@/models/TeamRound';
import { requireAuthentication } from '@/app/api/_lib/authorization';

import {
  RoundRequestError,
  type PatchRound2CodeInput,
  type PostRound2CompleteInput,
  type Round2Number,
} from '../_validators/round';

export const ROUND_2_GLOBAL_DURATION_MS = 60 * 60 * 1000;
export const ROUND_2_PHASE_A_DURATION_MS = 10 * 60 * 1000;
export const ROUND_2_PHASE_B_DURATION_MS = 15 * 60 * 1000;

type Round2QuestionDoc = {
  questionNumber: number;
  problemId?: unknown;
  activeMember?: TeamMember | null;
  phase?: Round2Phase;
  member1StartedAt?: Date | null;
  member1EndsAt?: Date | null;
  member2StartedAt?: Date | null;
  member2EndsAt?: Date | null;
  status?: string;
  code?: string;
  [key: string]: unknown;
};

type Round2SubDoc = {
  currentQuestionNumber?: number;
  activeMember?: TeamMember;
  phase?: Round2Phase;
  phaseStartedAt?: Date | null;
  phaseEndsAt?: Date | null;
  questions?: Round2QuestionDoc[];
  [key: string]: unknown;
};

type TeamRoundInstance = {
  _id?: unknown;
  status?: TeamRoundStatus;
  startedAt?: Date | null;
  endsAt?: Date | null;
  completedAt?: Date | null;
  round2?: Round2SubDoc;
  save: () => Promise<unknown>;
  [key: string]: unknown;
};

type RoundDoc = {
  _id: unknown;
  configuration?: {
    round2?: {
      questionCount?: number;
    };
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
};

type ProblemLike = ProblemDocument;

export type Round2Actor = {
  userId: string;
  teamId: string;
  teamMember: TeamMember;
};

export type Round2ScopedInput = {
  roundNumber: Round2Number;
  actor: Round2Actor;
  nowMs?: number;
};

export type Round2AllowedActions = {
  canSeeProblem: boolean;
  canEditCode: boolean;
  canSubmitCode: boolean;
  canCompleteQuestion: boolean;
};

export type Round2StateView = {
  roundNumber: Round2Number;
  roundStatus: TeamRoundStatus;
  globalStartTime: Date | null;
  globalEndsAt: Date | null;
  isGlobalExpired: boolean;
  phase: Round2Phase;
  activeMember: TeamMember;
  phaseStartedAt: Date | null;
  phaseEndsAt: Date | null;
  currentQuestionNumber: number;
  currentCode: string | null;
  canSeeProblem: boolean;
  allowedActions: Round2AllowedActions;
};

export type Round2QuestionView = {
  questionNumber: number;
  status: string;
  activeMember: TeamMember | null;
  phase: Round2Phase;
  problem: unknown | null;
};

export type Round2QuestionsView = {
  roundNumber: Round2Number;
  currentQuestionNumber: number;
  activeMember: TeamMember;
  questions: Round2QuestionView[];
};

export type PatchRound2CodeResult = {
  sourceCode: string;
  phase: Round2Phase;
  activeMember: TeamMember;
};

export type PostRound2CompleteResult = {
  roundNumber: Round2Number;
  roundStatus: TeamRoundStatus;
  phase: Round2Phase;
  activeMember: TeamMember;
  currentQuestionNumber: number;
  completedQuestionNumber: number | null;
  isRoundComplete: boolean;
  round2: unknown;
};

async function resolveActor(request: Request): Promise<Round2Actor> {
  // Verify the signed JWT 'session' cookie — same as every other route in this codebase.
  // requireAuthentication throws UnauthorizedError (401) if the token is missing or invalid.
  let session;
  try {
    session = await requireAuthentication(request);
  } catch {
    throw new RoundRequestError(
      'Authentication required. Please log in.',
      401,
      'UNAUTHENTICATED',
    );
  }

  if (!session.teamId) {
    throw new RoundRequestError(
      'User is not assigned to a team.',
      403,
      'NO_TEAM',
    );
  }

  if (!session.teamMember) {
    throw new RoundRequestError(
      'User team member role is not set.',
      403,
      'NO_TEAM_ROLE',
    );
  }

  return {
    userId: session.userId,
    teamId: session.teamId,
    teamMember: session.teamMember as TeamMember,
  };
}

async function ensureQuestionsInitialized(
  teamRoundDoc: TeamRoundInstance,
  roundDoc: RoundDoc,
  now: Date,
): Promise<void> {
  if (!teamRoundDoc.round2) {
    teamRoundDoc.round2 = {};
  }
  if (teamRoundDoc.round2.currentQuestionNumber === undefined ||
      teamRoundDoc.round2.currentQuestionNumber === null) {
    teamRoundDoc.round2.currentQuestionNumber = 1;
  }
  if (!teamRoundDoc.round2.activeMember) {
    teamRoundDoc.round2.activeMember = TeamMember.MEMBER_1;
  }
  if (!teamRoundDoc.round2.phase) {
    teamRoundDoc.round2.phase = Round2Phase.MEMBER_1;
  }

  const questionCount = roundDoc?.configuration?.round2?.questionCount ?? 0;
  if (questionCount > 0 && (!teamRoundDoc.round2.questions || teamRoundDoc.round2.questions.length === 0)) {
    const round2Problems = await Problem.find({
      roundNumber: 2,
      isActive: true,
    })
      .sort({ _id: 1 })
      .limit(questionCount)
      .lean();

    const questions: Round2QuestionDoc[] = [];
    for (let i = 0; i < questionCount; i++) {
      const problem = round2Problems[i] ?? null;
      questions.push({
        questionNumber: i + 1,
        problemId: problem ? problem._id : null,
        activeMember: null,
        phase: Round2Phase.MEMBER_1,
        member1StartedAt: null,
        member1EndsAt: null,
        member2StartedAt: null,
        member2EndsAt: null,
        status: 'PENDING',
        code: '',
        hasSeenBothPhases: false,
      });
    }
    teamRoundDoc.round2.questions = questions;
  }

  if (!teamRoundDoc.round2.phaseStartedAt && teamRoundDoc.status === TeamRoundStatus.IN_PROGRESS) {
    teamRoundDoc.round2.phaseStartedAt = now;
    teamRoundDoc.round2.phaseEndsAt = new Date(now.getTime() + ROUND_2_PHASE_A_DURATION_MS);
    const qIdx = teamRoundDoc.round2.currentQuestionNumber - 1;
    if (teamRoundDoc.round2.questions && teamRoundDoc.round2.questions[qIdx]) {
      teamRoundDoc.round2.questions[qIdx].activeMember = TeamMember.MEMBER_1;
      teamRoundDoc.round2.questions[qIdx].phase = Round2Phase.MEMBER_1;
      teamRoundDoc.round2.questions[qIdx].member1StartedAt = now;
      teamRoundDoc.round2.questions[qIdx].member1EndsAt = new Date(now.getTime() + ROUND_2_PHASE_A_DURATION_MS);
      teamRoundDoc.round2.questions[qIdx].status = 'IN_PROGRESS';
    }
  }
}

async function getOrCreateTeamRound(
  actor: Round2Actor,
): Promise<{ teamRound: TeamRoundInstance; roundDoc: RoundDoc }> {
  await connectDB();

  const fetchedRound = await Round.findOne({ roundNumber: 2 }).lean();
  if (!fetchedRound) {
    throw new RoundRequestError(
      'Round 2 has not been configured by admin.',
      404,
      'ROUND_NOT_FOUND',
    );
  }
  const roundDoc = fetchedRound as unknown as RoundDoc;

  let teamRound = (await TeamRound.findOne({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    teamId: actor.teamId as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    roundId: roundDoc._id as any,
  })) as TeamRoundInstance | null;

  if (!teamRound) {
    teamRound = new TeamRound({
      teamId: actor.teamId,
      roundId: roundDoc._id,
      status: TeamRoundStatus.NOT_STARTED,
      round2: {
        currentQuestionNumber: 1,
        activeMember: TeamMember.MEMBER_1,
        phase: Round2Phase.MEMBER_1,
        phaseStartedAt: null,
        phaseEndsAt: null,
        questions: [],
      },
    }) as unknown as TeamRoundInstance;
  }

  return { teamRound, roundDoc };
}

function isGlobalTimerExpired(teamRound: TeamRoundInstance, nowMs: number): boolean {
  if (!teamRound.startedAt) return false;
  const globalEndsAt = teamRound.startedAt.getTime() + ROUND_2_GLOBAL_DURATION_MS;
  return nowMs >= globalEndsAt;
}

function nextPhaseDetails(currentPhase: Round2Phase): {
  phase: Round2Phase;
  activeMember: TeamMember;
  durationMs: number;
} {
  if (currentPhase === Round2Phase.MEMBER_1) {
    return {
      phase: Round2Phase.MEMBER_2,
      activeMember: TeamMember.MEMBER_2,
      durationMs: ROUND_2_PHASE_B_DURATION_MS,
    };
  }
  return {
    phase: Round2Phase.MEMBER_1,
    activeMember: TeamMember.MEMBER_1,
    durationMs: ROUND_2_PHASE_A_DURATION_MS,
  };
}

async function applyLazyPhaseHandover(input: Round2ScopedInput): Promise<void> {
  const { actor, nowMs } = input;
  const now = nowMs !== undefined ? new Date(nowMs) : new Date();
  const msNow = now.getTime();

  await connectDB();
  const { teamRound, roundDoc } = await getOrCreateTeamRound(actor);

  if (teamRound.status !== TeamRoundStatus.IN_PROGRESS) {
    await teamRound.save();
    return;
  }

  await ensureQuestionsInitialized(teamRound, roundDoc, now);

  const globalExpired = isGlobalTimerExpired(teamRound, msNow);
  if (globalExpired) {
    teamRound.status = TeamRoundStatus.COMPLETED;
    teamRound.completedAt = now;
    if (teamRound.round2) {
      teamRound.round2.phase = Round2Phase.COMPLETED;
    }
    await teamRound.save();
    return;
  }

  const globalEndsAtMs = teamRound.startedAt
    ? teamRound.startedAt.getTime() + ROUND_2_GLOBAL_DURATION_MS
    : msNow + ROUND_2_GLOBAL_DURATION_MS;

  let changed = false;
  const maxIterations = 50;
  let iterations = 0;

  while (iterations++ < maxIterations) {
    if (!teamRound.round2 || !teamRound.round2.phaseEndsAt) {
      break;
    }
    const phaseEndsAtMs = teamRound.round2.phaseEndsAt.getTime();
    if (msNow < phaseEndsAtMs) {
      break;
    }

    const currentPhase = teamRound.round2.phase as Round2Phase;
    const qIdxForPhase = (teamRound.round2.currentQuestionNumber ?? 1) - 1;

    if (currentPhase === Round2Phase.MEMBER_2) {
      const currQIdx = qIdxForPhase;
      if (
        teamRound.round2.questions &&
        teamRound.round2.questions[currQIdx]
      ) {
        teamRound.round2.questions[currQIdx].hasSeenBothPhases = true;
      }
    }

    const next = nextPhaseDetails(currentPhase);
    teamRound.round2.phase = next.phase;
    teamRound.round2.activeMember = next.activeMember;
    teamRound.round2.phaseStartedAt = new Date(phaseEndsAtMs);

    let rawEnd: number;
    if (currentPhase === Round2Phase.MEMBER_2) {
      rawEnd = phaseEndsAtMs + 0;
    } else {
      rawEnd = phaseEndsAtMs + next.durationMs;
    }
    const clampedEnd = Math.min(rawEnd, globalEndsAtMs);
    teamRound.round2.phaseEndsAt = new Date(clampedEnd);

    const newQIdx = (teamRound.round2.currentQuestionNumber ?? 1) - 1;
    if (teamRound.round2.questions && teamRound.round2.questions[newQIdx]) {
      const q = teamRound.round2.questions[newQIdx];
      q.activeMember = next.activeMember;
      q.phase = next.phase;
      if (next.phase === Round2Phase.MEMBER_1) {
        q.member1StartedAt = new Date(phaseEndsAtMs);
        if (currentPhase === Round2Phase.MEMBER_2) {
          q.member1EndsAt = new Date(clampedEnd);
        } else {
          q.member1EndsAt = new Date(clampedEnd);
        }
      } else {
        q.member2StartedAt = new Date(phaseEndsAtMs);
        q.member2EndsAt = new Date(clampedEnd);
      }
    }

    changed = true;
  }

  if (changed) {
    await teamRound.save();
  } else if (!teamRound._id) {
    await teamRound.save();
  } else {
    await teamRound.save();
  }
}

async function getState(input: Round2ScopedInput): Promise<Round2StateView> {
  const { actor, nowMs, roundNumber } = input;
  await connectDB();
  const { teamRound, roundDoc } = await getOrCreateTeamRound(actor);
  const now = nowMs !== undefined ? new Date(nowMs) : new Date();
  await ensureQuestionsInitialized(teamRound, roundDoc, now);

  const msNow = now.getTime();
  const globalStartTime = teamRound.startedAt ? new Date(teamRound.startedAt) : null;
  const globalEndsAt = teamRound.startedAt
    ? new Date(teamRound.startedAt.getTime() + ROUND_2_GLOBAL_DURATION_MS)
    : null;
  const isGlobalExpired = globalEndsAt ? msNow >= globalEndsAt.getTime() : false;

  const roundStatus: TeamRoundStatus =
    (teamRound.status as TeamRoundStatus) ?? TeamRoundStatus.NOT_STARTED;

  const phase =
    isGlobalExpired || teamRound.status === TeamRoundStatus.COMPLETED
      ? Round2Phase.COMPLETED
      : (teamRound.round2?.phase as Round2Phase) ?? Round2Phase.MEMBER_1;

  const activeMember =
    phase === Round2Phase.COMPLETED
      ? (teamRound.round2?.activeMember as TeamMember) ?? TeamMember.MEMBER_1
      : (teamRound.round2?.activeMember as TeamMember) ?? TeamMember.MEMBER_1;

  const phaseStartedAt = teamRound.round2?.phaseStartedAt
    ? new Date(teamRound.round2.phaseStartedAt)
    : null;
  const phaseEndsAt = teamRound.round2?.phaseEndsAt
    ? new Date(teamRound.round2.phaseEndsAt)
    : null;

  const currentQuestionNumber = teamRound.round2?.currentQuestionNumber ?? 1;
  const qIdx = currentQuestionNumber - 1;
  const currentQuestion =
    teamRound.round2?.questions && teamRound.round2.questions[qIdx]
      ? teamRound.round2.questions[qIdx]
      : null;

  const currentCode: string | null =
    currentQuestion && typeof currentQuestion.code === 'string'
      ? currentQuestion.code
      : null;

  const canSeeProblem =
    phase !== Round2Phase.COMPLETED &&
    roundStatus === TeamRoundStatus.IN_PROGRESS &&
    !isGlobalExpired &&
    actor.teamMember === activeMember;

  const canEditCode =
    phase !== Round2Phase.COMPLETED &&
    roundStatus === TeamRoundStatus.IN_PROGRESS &&
    !isGlobalExpired &&
    actor.teamMember === activeMember;

  const phaseTimerExpired =
    phaseEndsAt !== null && phaseEndsAt !== undefined && msNow >= phaseEndsAt.getTime();
  const canSubmitCode =
    phase !== Round2Phase.COMPLETED &&
    roundStatus === TeamRoundStatus.IN_PROGRESS &&
    !isGlobalExpired &&
    actor.teamMember === activeMember &&
    phaseTimerExpired;

  const seenBothPhases = currentQuestion ? currentQuestion.hasSeenBothPhases === true : false;
  const canCompleteQuestion =
    canEditCode &&
    phase === Round2Phase.MEMBER_1 &&
    currentQuestion !== null &&
    seenBothPhases &&
    phaseTimerExpired;

  const allowedActions: Round2AllowedActions = {
    canSeeProblem,
    canEditCode,
    canSubmitCode,
    canCompleteQuestion,
  };

  return {
    roundNumber,
    roundStatus,
    globalStartTime,
    globalEndsAt,
    isGlobalExpired,
    phase,
    activeMember,
    phaseStartedAt,
    phaseEndsAt,
    currentQuestionNumber,
    currentCode,
    canSeeProblem,
    allowedActions,
  };
}

async function getQuestions(
  input: Round2ScopedInput,
): Promise<Round2QuestionsView> {
  const { actor, nowMs, roundNumber } = input;
  await connectDB();
  const { teamRound, roundDoc } = await getOrCreateTeamRound(actor);
  const now = nowMs !== undefined ? new Date(nowMs) : new Date();
  await ensureQuestionsInitialized(teamRound, roundDoc, now);

  const msNow = now.getTime();
  const globalEndsAt = teamRound.startedAt
    ? teamRound.startedAt.getTime() + ROUND_2_GLOBAL_DURATION_MS
    : null;
  const isGlobalExpired = globalEndsAt ? msNow >= globalEndsAt : false;

  const activeMember =
    (teamRound.round2?.activeMember as TeamMember) ?? TeamMember.MEMBER_1;
  const currentQuestionNumber = teamRound.round2?.currentQuestionNumber ?? 1;
  const phase =
    isGlobalExpired || teamRound.status === TeamRoundStatus.COMPLETED
      ? Round2Phase.COMPLETED
      : (teamRound.round2?.phase as Round2Phase) ?? Round2Phase.MEMBER_1;

  const questionsRaw = teamRound.round2?.questions ?? [];
  const problemIds: string[] = [];
  for (const q of questionsRaw) {
    if (q.problemId) problemIds.push(String(q.problemId));
  }

  const problems: Record<string, ProblemLike> = {};
  if (problemIds.length > 0) {
    const docs = await Problem.find({ _id: { $in: problemIds } }).lean();
    for (const p of docs) {
      problems[String(p._id)] = p as ProblemLike;
    }
  }

  const canSeeProblem = (q: Round2QuestionDoc): boolean => {
    if (phase === Round2Phase.COMPLETED) return false;
    if (q.questionNumber !== currentQuestionNumber) return false;
    if (actor.teamMember !== activeMember) return false;
    return true;
  };

  const questions: Round2QuestionView[] = questionsRaw.map((q: Round2QuestionDoc) => {
    const problem = problems[String(q.problemId)];
    const visible = canSeeProblem(q);
    return {
      questionNumber: q.questionNumber,
      status: q.status ?? 'PENDING',
      activeMember: (q.activeMember as TeamMember) ?? null,
      phase: (q.phase as Round2Phase) ?? Round2Phase.MEMBER_1,
      problem: visible ? problem ?? null : null,
      problemId: q.problemId ?? null,
    };
  });

  return {
    roundNumber,
    currentQuestionNumber,
    activeMember,
    questions,
  };
}

async function patchCode(
  input: Round2ScopedInput & { body: PatchRound2CodeInput },
): Promise<PatchRound2CodeResult> {
  const { actor, nowMs, body } = input;
  await connectDB();
  const { teamRound, roundDoc } = await getOrCreateTeamRound(actor);
  const now = nowMs !== undefined ? new Date(nowMs) : new Date();
  await ensureQuestionsInitialized(teamRound, roundDoc, now);

  const msNow = now.getTime();
  const globalEndsAt = teamRound.startedAt
    ? teamRound.startedAt.getTime() + ROUND_2_GLOBAL_DURATION_MS
    : null;
  const isGlobalExpired = globalEndsAt ? msNow >= globalEndsAt : false;

  if (teamRound.status !== TeamRoundStatus.IN_PROGRESS) {
    throw new RoundRequestError(
      'Round 2 is not in progress. Code edits are disabled.',
      403,
      'ROUND_NOT_ACTIVE',
    );
  }

  if (isGlobalExpired) {
    throw new RoundRequestError(
      'Global round timer has expired. Code edits are disabled.',
      403,
      'GLOBAL_TIMER_EXPIRED',
    );
  }

  const activeMember =
    (teamRound.round2?.activeMember as TeamMember) ?? TeamMember.MEMBER_1;

  if (actor.teamMember !== activeMember) {
    throw new RoundRequestError(
      `Only the currently active member (${activeMember}) may edit code.`,
      403,
      'NOT_ACTIVE_MEMBER',
    );
  }

  const phaseEndsAt = teamRound.round2?.phaseEndsAt as Date | null | undefined;
  if (phaseEndsAt === null || phaseEndsAt === undefined) {
    throw new RoundRequestError(
      'Phase timer has not been initialized. Cannot submit code yet.',
      403,
      'PHASE_TIMER_NOT_INITIALIZED',
    );
  }
  if (msNow < phaseEndsAt.getTime()) {
    throw new RoundRequestError(
      `Code submission is locked until the phase timer expires. Remaining: ${Math.ceil(
        (phaseEndsAt.getTime() - msNow) / 1000,
      )} seconds.`,
      403,
      'SUBMISSION_BLOCKED_UNTIL_TIMER_EXPIRES',
    );
  }

  const currentQNum = teamRound.round2?.currentQuestionNumber ?? 1;
  const qIdx = currentQNum - 1;

  if (!teamRound.round2?.questions || !teamRound.round2.questions[qIdx]) {
    throw new RoundRequestError(
      'No question is currently active for code editing.',
      404,
      'NO_ACTIVE_QUESTION',
    );
  }

  teamRound.round2.questions[qIdx].code = body.sourceCode;
  await teamRound.save();

  return {
    sourceCode: body.sourceCode,
    phase: (teamRound.round2.phase as Round2Phase) ?? Round2Phase.MEMBER_1,
    activeMember,
  };
}

async function complete(
  input: Round2ScopedInput & { body: PostRound2CompleteInput },
): Promise<PostRound2CompleteResult> {
  const { actor, nowMs, roundNumber, body } = input;
  await connectDB();
  const { teamRound, roundDoc } = await getOrCreateTeamRound(actor);
  const now = nowMs !== undefined ? new Date(nowMs) : new Date();
  await ensureQuestionsInitialized(teamRound, roundDoc, now);

  const msNow = now.getTime();
  const globalEndsAt = teamRound.startedAt
    ? teamRound.startedAt.getTime() + ROUND_2_GLOBAL_DURATION_MS
    : null;
  const isGlobalExpired = globalEndsAt ? msNow >= globalEndsAt : false;

  if (teamRound.status !== TeamRoundStatus.IN_PROGRESS) {
    throw new RoundRequestError(
      'Round 2 is not in progress. Completion is disabled.',
      403,
      'ROUND_NOT_ACTIVE',
    );
  }

  if (isGlobalExpired) {
    teamRound.status = TeamRoundStatus.COMPLETED;
    teamRound.completedAt = now;
    if (teamRound.round2) {
      teamRound.round2.phase = Round2Phase.COMPLETED;
    }
    await teamRound.save();
  }

  const activeMember =
    (teamRound.round2?.activeMember as TeamMember) ?? TeamMember.MEMBER_1;

  if (actor.teamMember !== activeMember && teamRound.status !== TeamRoundStatus.COMPLETED) {
    throw new RoundRequestError(
      `Only the currently active member (${activeMember}) may trigger completion.`,
      403,
      'NOT_ACTIVE_MEMBER',
    );
  }

  const questionCount = roundDoc?.configuration?.round2?.questionCount ?? 0;
  const currentQNum = teamRound.round2?.currentQuestionNumber ?? 1;
  const qIdx = currentQNum - 1;

  if (!teamRound.round2?.questions || !teamRound.round2.questions[qIdx]) {
    throw new RoundRequestError(
      'No question is currently active for completion.',
      404,
      'NO_ACTIVE_QUESTION',
    );
  }

  const activeQuestion = teamRound.round2.questions[qIdx];
  if (body.questionId !== undefined && body.questionId !== null) {
    const requestedId = String(body.questionId);
    if (activeQuestion.problemId && String(activeQuestion.problemId) !== requestedId) {
      throw new RoundRequestError(
        `questionId (${requestedId}) does not match the currently active question.`,
        400,
        'QUESTION_ID_MISMATCH',
      );
    }
  }

  if (teamRound.round2.phase !== Round2Phase.MEMBER_1) {
    throw new RoundRequestError(
      'Only Member 1 may complete a question and advance to the next question.',
      403,
      'COMPLETE_REQUIRES_MEMBER_1',
    );
  }
  if (activeQuestion.hasSeenBothPhases !== true) {
    throw new RoundRequestError(
      'Cannot complete this question yet. Both members must serve their full phase timers at least once before advancing.',
      403,
      'COMPLETE_NOT_READY',
    );
  }

  activeQuestion.status = 'COMPLETED';
  const completedQuestionNumber: number | null = currentQNum;
  let isRoundComplete = false;

  if (currentQNum >= questionCount) {
    teamRound.status = TeamRoundStatus.COMPLETED;
    teamRound.completedAt = now;
    teamRound.round2.phase = Round2Phase.COMPLETED;
    isRoundComplete = true;
  } else {
    const nextQNum = currentQNum + 1;
    teamRound.round2.currentQuestionNumber = nextQNum;
    const nextQIdx = nextQNum - 1;
    if (teamRound.round2.questions[nextQIdx]) {
      const nowForNext = isGlobalExpired
        ? new Date(globalEndsAt!)
        : now;
      const phaseStart = nowForNext.getTime();
      teamRound.round2.phase = Round2Phase.MEMBER_1;
      teamRound.round2.activeMember = TeamMember.MEMBER_1;
      teamRound.round2.phaseStartedAt = new Date(phaseStart);
      const rawEnd = phaseStart + ROUND_2_PHASE_A_DURATION_MS;
      const clampedEnd = globalEndsAt !== null ? Math.min(rawEnd, globalEndsAt) : rawEnd;
      teamRound.round2.phaseEndsAt = new Date(clampedEnd);

      const nq = teamRound.round2.questions[nextQIdx];
      nq.activeMember = TeamMember.MEMBER_1;
      nq.phase = Round2Phase.MEMBER_1;
      nq.member1StartedAt = new Date(phaseStart);
      nq.member1EndsAt = new Date(clampedEnd);
      if (nq.status === 'PENDING') {
        nq.status = 'IN_PROGRESS';
      }
    }
  }

  await teamRound.save();

  const finalPhase = isGlobalExpired || teamRound.status === TeamRoundStatus.COMPLETED
    ? Round2Phase.COMPLETED
    : (teamRound.round2.phase as Round2Phase);
  const finalActive = isGlobalExpired || teamRound.status === TeamRoundStatus.COMPLETED
    ? (teamRound.round2?.activeMember as TeamMember) ?? TeamMember.MEMBER_1
    : (teamRound.round2?.activeMember as TeamMember) ?? TeamMember.MEMBER_1;

  return {
    roundNumber,
    roundStatus: teamRound.status as TeamRoundStatus,
    phase: finalPhase,
    activeMember: finalActive,
    currentQuestionNumber: teamRound.round2.currentQuestionNumber ?? 1,
    completedQuestionNumber,
    isRoundComplete,
    round2: teamRound.round2,
  };
}

async function start(
  input: Round2ScopedInput,
): Promise<Round2StateView> {
  const { actor, nowMs } = input;
  await connectDB();
  const { teamRound, roundDoc } = await getOrCreateTeamRound(actor);
  const now = nowMs !== undefined ? new Date(nowMs) : new Date();

  if (teamRound.status === TeamRoundStatus.NOT_STARTED) {
    const durationSeconds = (roundDoc as any).durationSeconds ?? 3600;
    teamRound.status = TeamRoundStatus.IN_PROGRESS;
    teamRound.startedAt = now;
    teamRound.endsAt = new Date(now.getTime() + durationSeconds * 1000);
    
    await ensureQuestionsInitialized(teamRound, roundDoc, now);
    await teamRound.save();
  } else {
    await ensureQuestionsInitialized(teamRound, roundDoc, now);
  }

  return getState(input);
}

export function roundErrorResponse(error: unknown): NextResponse {
  if (error instanceof RoundRequestError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status },
    );
  }

  return NextResponse.json(
    { error: 'Internal server error.', code: 'INTERNAL_ERROR' },
    { status: 500 },
  );
}

export const roundService = {
  resolveActor,
  applyLazyPhaseHandover,
  getState,
  getQuestions,
  patchCode,
  complete,
  start,
};
