import { Types } from 'mongoose';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Team from '@/models/Team';
import Round from '@/models/Round';
import TeamRound from '@/models/TeamRound';
import Problem from '@/models/Problem';
import Submission from '@/models/Submission';
import { verifySession } from '@/app/api/_lib/auth';
import { Round1Path, Round1Topic, RoundStatus, SubmissionVerdict } from '@/constants/event';

export const PATH_TO_TOPIC: Record<Round1Path, Round1Topic> = {
  [Round1Path.TRIANGLE]: Round1Topic.BASIC_MATH_NUMBERS,
  [Round1Path.CIRCLE]: Round1Topic.STRING_MANIPULATION,
  [Round1Path.SQUARE]: Round1Topic.ARRAYS_LOGIC,
  [Round1Path.STAR]: Round1Topic.LOOPS_PATTERNS,
};

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;
  if (!sessionToken) return null;

  try {
    await connectDB();
    const session = await verifySession(sessionToken);
    const user = await User.findById(session.userId).lean();
    return user ?? null;
  } catch {
    return null;
  }
}

export async function getUserTeam(userId: Types.ObjectId | string) {
  await connectDB();
  const team = await Team.findOne({ members: userId }).lean();
  return team ?? null;
}

export async function getActiveRound(roundNumber: number) {
  await connectDB();
  const round = await Round.findOne({ roundNumber, status: RoundStatus.ACTIVE }).lean();
  return round ?? null;
}

export async function getTeamRound(teamId: Types.ObjectId | string, roundId: Types.ObjectId | string) {
  await connectDB();
  const teamRound = await TeamRound.findOne({ teamId, roundId }).lean();
  return teamRound ?? null;
}

export async function getProblemById(problemId: string) {
  if (!Types.ObjectId.isValid(problemId)) return null;
  await connectDB();
  const problem = await Problem.findById(problemId).lean();
  return problem ?? null;
}

export function buildSafeProblem(problem: any) {
  return {
    id: problem._id.toString(),
    title: problem.title,
    description: problem.description,
    difficulty: String(problem.difficulty ?? 'easy').toLowerCase(),
    inputFormat: problem.inputFormat,
    outputFormat: problem.outputFormat,
    examples: problem.examples ?? [],
    constraints: problem.constraints,
    allowedLanguages: problem.allowedLanguages ?? [],
    roundNumber: problem.roundNumber,
  };
}

export function normalizeRound1Difficulty(value?: string | null): 'Easy' | 'Medium' | 'Hard' {
  switch ((value ?? '').toUpperCase()) {
    case 'MEDIUM':
      return 'Medium';
    case 'HARD':
      return 'Hard';
    case 'EASY':
    default:
      return 'Easy';
  }
}

export function normalizeRound1ProblemStatus(value?: string | null): 'locked' | 'available' | 'attempted' | 'solved' {
  switch (value) {
    case 'SOLVED':
      return 'solved';
    case 'IN_PROGRESS':
      return 'attempted';
    case 'PENDING':
    default:
      return 'available';
  }
}

export async function getAssignedRound1ProblemsForTeam(teamId: Types.ObjectId | string, roundId: Types.ObjectId | string) {
  await connectDB();

  const teamRound = await TeamRound.findOne({ teamId, roundId }).lean();
  const assignedProblems = teamRound?.round1?.problems ?? [];

  if (!assignedProblems.length) {
    return [];
  }

  const problemIds = assignedProblems
    .map((entry: any) => entry?.problemId)
    .filter(Boolean)
    .map((problemId: Types.ObjectId | string) => new Types.ObjectId(problemId));

  const problems = await Problem.find({ _id: { $in: problemIds } }).lean();
  const problemMap = new Map(
    problems.map((problem: any) => [problem._id.toString(), problem]),
  );

  return assignedProblems
    .map((entry: any) => {
      const problem = problemMap.get(entry?.problemId?.toString());
      if (!problem) return null;

      return {
        id: problem._id.toString(),
        title: problem.title,
        difficulty: normalizeRound1Difficulty(problem.difficulty),
        maxScore: 50,
        status: normalizeRound1ProblemStatus(entry?.status),
        solvedAt: entry?.status === 'SOLVED' ? new Date().toISOString() : undefined,
      };
    })
    .filter(Boolean);
}

export async function selectProblemsForTopic(topic: Round1Topic, count = 3) {
  await connectDB();
  const problems = await Problem.aggregate([
    { $match: { topic, roundNumber: 1, isActive: true } },
    { $sample: { size: count } },
  ]);
  return problems;
}

export async function getProblemStateForTeam(problemId: string, teamId: Types.ObjectId | string) {
  if (!Types.ObjectId.isValid(problemId)) return null;
  await connectDB();

  const [teamRound, latestSubmission, acceptedSubmission] = await Promise.all([
    TeamRound.findOne({ teamId }).lean(),
    Submission.findOne({ teamId, problemId: new Types.ObjectId(problemId) })
      .sort({ createdAt: -1 })
      .lean(),
    Submission.findOne({
      teamId,
      problemId: new Types.ObjectId(problemId),
      verdict: SubmissionVerdict.ACCEPTED,
    }).lean(),
  ]);

  const solved = !!acceptedSubmission;

  let round1ProblemStatus: string | null = null;
  if (teamRound?.round1?.problems) {
    const entry = teamRound.round1.problems.find(
      (p: any) => p.problemId?.toString() === problemId
    );
    round1ProblemStatus = entry?.status ?? null;
  }

  return {
    problemId,
    solved,
    round1ProblemStatus,
    latestVerdict: latestSubmission?.verdict ?? null,
    latestSubmissionId: latestSubmission?._id?.toString() ?? null,
    canSubmit: !solved,
  };
}
