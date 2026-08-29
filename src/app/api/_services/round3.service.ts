import { Types } from 'mongoose';

import connectDB from '@/lib/db';
import Problem from '@/models/Problem';
import Round from '@/models/Round';
import TeamRound from '@/models/TeamRound';
import { RoundStatus, TeamRoundStatus } from '@/constants/event';

// ── Constants ──────────────────────────────────────────────────────────────
const ROUND_NUMBER = 3;
const PROBLEM_COUNT = 3;

// Points — fallback values used when Round.configuration.round3 is unpopulated
const DEFAULT_BASE_POINTS = 50;
const DEFAULT_OUROBOROS_POINTS = 30;
const DEFAULT_SHORT_AND_SWEET_POINTS = 20;
const DEFAULT_ONE_SHOT_WONDER_POINTS = 40;
const DEFAULT_MAX_LINES = 30;

// ── Types ──────────────────────────────────────────────────────────────────
export interface Round3ProblemStatus {
  problemId: string;
  title: string;
  difficulty: string;
  description: string;
  baseSolvePassed: boolean;
  ouroborosPassed: boolean;
  shortAndSweetPassed: boolean;
  oneShotWonderPassed: boolean;
  baseScore: number;
  bonusScore: number;
  totalScore: number;
  submissionCount: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SOLVED';
}

export interface Round3State {
  status: string;
  startedAt: string | null;
  endsAt: string | null;
  score: number;
  problems: Round3ProblemStatus[];
  roundConfig: {
    basePoints: number;
    ouroborosPoints: number;
    shortAndSweetPoints: number;
    oneShotWonderPoints: number;
    maxLines: number;
    durationSeconds: number;
  };
}

export interface Round3ConstraintResult {
  baseSolvePassed: boolean;
  ouroborosPassed: boolean;
  shortAndSweetPassed: boolean;
  oneShotWonderPassed: boolean;
  baseScore: number;
  bonusScore: number;
  totalScore: number;
  pointsEarned: number;
  constraintViolations: { constraintId: string; message: string }[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Get the active Round 3 document.
 */
export async function getActiveRound3() {
  await connectDB();
  return Round.findOne({ roundNumber: ROUND_NUMBER, status: RoundStatus.ACTIVE }).lean();
}

/**
 * Get any (active or completed) Round 3 document — used after round ends.
 */
export async function getRound3() {
  await connectDB();
  return Round.findOne({ roundNumber: ROUND_NUMBER }).lean();
}

/**
 * Assign 3 random round-3 problems to a team's TeamRound (idempotent).
 * Does nothing if problems are already assigned.
 */
export async function assignRound3Problems(
  teamId: Types.ObjectId | string,
  roundId: Types.ObjectId | string,
): Promise<void> {
  await connectDB();

  const teamRound = await TeamRound.findOne({ teamId, roundId });
  if (!teamRound) return;

  // Already assigned — don't reassign
  if (teamRound.round3?.problems && teamRound.round3.problems.length > 0) return;

  const problems = await Problem.aggregate([
    { $match: { roundNumber: ROUND_NUMBER, isActive: true } },
    { $sample: { size: PROBLEM_COUNT } },
  ]);

  if (problems.length === 0) return; // No problems seeded yet — graceful fallback

  const round3Problems = problems.map((p: any) => ({
    problemId: new Types.ObjectId(p._id.toString()),
    baseSolvePassed: false,
    ouroborosPassed: false,
    shortAndSweetPassed: false,
    oneShotWonderPassed: false,
    baseScore: 0,
    bonusScore: 0,
    totalScore: 0,
    submissionCount: 0,
    wrongSubmissionCount: 0,
    completedAt: null,
  }));

  teamRound.set('round3.problems', round3Problems);
  await teamRound.save();
}

/**
 * Get the full Round 3 state for a team (problems + timer + scores).
 */
export async function getRound3StateForTeam(
  teamId: Types.ObjectId | string,
  roundId: Types.ObjectId | string,
): Promise<Round3State> {
  await connectDB();

  const round = await Round.findById(roundId).lean() as any;
  const roundConfig = {
    basePoints: round?.configuration?.round3?.basePoints ?? DEFAULT_BASE_POINTS,
    ouroborosPoints: round?.configuration?.round3?.ouroborosPoints ?? DEFAULT_OUROBOROS_POINTS,
    shortAndSweetPoints: round?.configuration?.round3?.shortAndSweetPoints ?? DEFAULT_SHORT_AND_SWEET_POINTS,
    oneShotWonderPoints: round?.configuration?.round3?.oneShotWonderPoints ?? DEFAULT_ONE_SHOT_WONDER_POINTS,
    maxLines: round?.configuration?.round3?.maxLines ?? DEFAULT_MAX_LINES,
    durationSeconds: round?.durationSeconds ?? 3600,
  };

  const teamRound = await TeamRound.findOne({ teamId, roundId }).lean() as any;

  if (!teamRound) {
    return {
      status: TeamRoundStatus.NOT_STARTED,
      startedAt: null,
      endsAt: null,
      score: 0,
      problems: [],
      roundConfig,
    };
  }

  const assignedProblems = teamRound.round3?.problems ?? [];

  let problems: Round3ProblemStatus[] = [];
  if (assignedProblems.length > 0) {
    const problemIds = assignedProblems.map((p: any) => new Types.ObjectId(p.problemId));
    const problemDocs = await Problem.find({ _id: { $in: problemIds } }).lean();
    const problemMap = new Map(problemDocs.map((p: any) => [p._id.toString(), p]));

    problems = assignedProblems.map((entry: any) => {
      const doc = problemMap.get(entry.problemId?.toString()) as any;
      const solved = entry.baseSolvePassed;
      const inProgress = entry.submissionCount > 0 && !solved;
      return {
        problemId: entry.problemId?.toString() ?? '',
        title: doc?.title ?? 'Unknown Problem',
        difficulty: String(doc?.difficulty ?? 'medium').toUpperCase(),
        description: doc?.description ?? '',
        baseSolvePassed: entry.baseSolvePassed ?? false,
        ouroborosPassed: entry.ouroborosPassed ?? false,
        shortAndSweetPassed: entry.shortAndSweetPassed ?? false,
        oneShotWonderPassed: entry.oneShotWonderPassed ?? false,
        baseScore: entry.baseScore ?? 0,
        bonusScore: entry.bonusScore ?? 0,
        totalScore: entry.totalScore ?? 0,
        submissionCount: entry.submissionCount ?? 0,
        status: (solved ? 'SOLVED' : inProgress ? 'IN_PROGRESS' : 'NOT_STARTED') as Round3ProblemStatus['status'],
      };
    });
  }

  return {
    status: teamRound.status ?? TeamRoundStatus.NOT_STARTED,
    startedAt: teamRound.startedAt ? new Date(teamRound.startedAt).toISOString() : null,
    endsAt: teamRound.endsAt ? new Date(teamRound.endsAt).toISOString() : null,
    score: teamRound.score ?? 0,
    problems,
    roundConfig,
  };
}

/**
 * Compute Round 3 constraint bonuses from AST + submission count.
 * Pure function — no DB writes here; the caller persists results.
 */
export function computeRound3Result(
  astResult: any,
  isFirstAttempt: boolean,
  maxLines: number,
  basePoints: number,
  ouroborosPoints: number,
  shortAndSweetPoints: number,
  oneShotWonderPoints: number,
): Round3ConstraintResult {
  const constraintViolations: { constraintId: string; message: string }[] = [];
  let bonusScore = 0;

  // Ouroboros: recursion-only, no loops
  let ouroborosPassed = false;
  if (astResult?.analyzed) {
    if (!astResult.loopsDetected && astResult.recursionDetected) {
      ouroborosPassed = true;
      bonusScore += ouroborosPoints;
    } else {
      constraintViolations.push({
        constraintId: 'ouroboros',
        message: astResult.loopsDetected
          ? 'Loops detected in your code'
          : 'No recursion detected — recursion is required',
      });
    }
  } else {
    constraintViolations.push({
      constraintId: 'ouroboros',
      message: 'AST analysis unavailable — Ouroboros bonus not awarded',
    });
  }

  // Short & Sweet: line count ≤ maxLines
  let shortAndSweetPassed = false;
  if (astResult?.analyzed) {
    if (astResult.lineCount <= maxLines) {
      shortAndSweetPassed = true;
      bonusScore += shortAndSweetPoints;
    } else {
      constraintViolations.push({
        constraintId: 'shortAndSweet',
        message: `Code is ${astResult.lineCount} lines (limit: ${maxLines})`,
      });
    }
  } else {
    constraintViolations.push({
      constraintId: 'shortAndSweet',
      message: 'AST analysis unavailable — Short & Sweet bonus not awarded',
    });
  }

  // One-Shot Wonder: first submission only
  let oneShotWonderPassed = false;
  if (isFirstAttempt) {
    oneShotWonderPassed = true;
    bonusScore += oneShotWonderPoints;
  } else {
    constraintViolations.push({
      constraintId: 'oneShotWonder',
      message: 'This was not your first submission attempt',
    });
  }

  const totalScore = basePoints + bonusScore;

  return {
    baseSolvePassed: true,
    ouroborosPassed,
    shortAndSweetPassed,
    oneShotWonderPassed,
    baseScore: basePoints,
    bonusScore,
    totalScore,
    pointsEarned: totalScore,
    constraintViolations,
  };
}

/**
 * Persist Round 3 constraint results for a specific problem back to TeamRound.
 * Also updates the total round score.
 */
export async function persistRound3ProblemResult(
  teamId: Types.ObjectId | string,
  roundId: Types.ObjectId | string,
  problemId: string,
  result: Round3ConstraintResult,
): Promise<void> {
  await connectDB();

  const teamRound = await TeamRound.findOne({ teamId, roundId });
  if (!teamRound) return;

  const problems = teamRound.round3?.problems ?? [];
  const idx = problems.findIndex(
    (p: any) => p.problemId?.toString() === problemId,
  );

  if (idx === -1) return; // Problem not assigned to this team

  // Only update if not already solved (don't overwrite a better score)
  const existing = problems[idx] as any;
  if (existing.baseSolvePassed) return;

  teamRound.set(`round3.problems.${idx}.baseSolvePassed`, result.baseSolvePassed);
  teamRound.set(`round3.problems.${idx}.ouroborosPassed`, result.ouroborosPassed);
  teamRound.set(`round3.problems.${idx}.shortAndSweetPassed`, result.shortAndSweetPassed);
  teamRound.set(`round3.problems.${idx}.oneShotWonderPassed`, result.oneShotWonderPassed);
  teamRound.set(`round3.problems.${idx}.baseScore`, result.baseScore);
  teamRound.set(`round3.problems.${idx}.bonusScore`, result.bonusScore);
  teamRound.set(`round3.problems.${idx}.totalScore`, result.totalScore);
  teamRound.set(`round3.problems.${idx}.completedAt`, new Date());

  // Recalculate total round score from all problems
  const updatedProblems = teamRound.round3?.problems ?? [];
  const totalScore = updatedProblems.reduce(
    (sum: number, p: any, i: number) =>
      sum + (i === idx ? result.totalScore : (p.totalScore ?? 0)),
    0,
  );

  teamRound.set('score', totalScore);

  await teamRound.save();
}

/**
 * Increment submission count for a round3 problem (called on every submission, not just accepted).
 */
export async function incrementRound3SubmissionCount(
  teamId: Types.ObjectId | string,
  roundId: Types.ObjectId | string,
  problemId: string,
): Promise<number> {
  await connectDB();

  const teamRound = await TeamRound.findOne({ teamId, roundId });
  if (!teamRound) return 0;

  const problems = teamRound.round3?.problems ?? [];
  const idx = problems.findIndex(
    (p: any) => p.problemId?.toString() === problemId,
  );

  if (idx === -1) return 0;

  const current = (problems[idx] as any).submissionCount ?? 0;
  const next = current + 1;
  teamRound.set(`round3.problems.${idx}.submissionCount`, next);
  await teamRound.save();
  return next; // return the new count (1 = first attempt)
}
