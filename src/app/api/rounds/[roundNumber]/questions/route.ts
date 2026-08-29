import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';

import connectDB from '@/lib/db';
import Problem from '@/models/Problem';
import Round from '@/models/Round';
import TeamRound from '@/models/TeamRound';
import { requireAuthentication } from '@/app/api/_lib/authorization';
import {
  getAuthenticatedUser,
  getUserTeam,
} from '@/app/api/_services/problem.service';
import { RoundStatus } from '@/constants/event';

import { roundErrorResponse, roundService } from '../../../_services/round.service';
import { parseRound2Params } from '../../../_validators/round';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roundNumber: string }> },
) {
  try {
    const { roundNumber } = await params;
    const parsedRoundNumber = Number(roundNumber);

    // ── Round 2 ────────────────────────────────────────────────────────────
    if (parsedRoundNumber === 2) {
      const actor = await roundService.resolveActor(request);
      const scoped = { roundNumber: 2 as const, actor };

      await roundService.applyLazyPhaseHandover(scoped);
      const questions = await roundService.getQuestions(scoped);

      return NextResponse.json(questions);
    }

    // ── Round 1 ────────────────────────────────────────────────────────────
    if (parsedRoundNumber === 1) {
      const user = await getAuthenticatedUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
      }

      const team = await getUserTeam((user as any)._id as Types.ObjectId);
      if (!team) {
        return NextResponse.json({ error: 'No team found for this user' }, { status: 404 });
      }

      const round = await Round.findOne({ roundNumber: 1 }).select('_id').lean();
      if (!round) {
        return NextResponse.json({ error: 'Round 1 not found' }, { status: 404 });
      }

      const teamRound = await TeamRound.findOne({
        teamId: (team as any)._id as Types.ObjectId,
        roundId: (round as any)._id as Types.ObjectId,
      }).lean();

      const assignedEntries = (teamRound as any)?.round1?.problems ?? [];
      if (!assignedEntries.length) {
        return NextResponse.json([]);
      }

      const objectIds = assignedEntries
        .map((entry: any) => entry?.problemId)
        .filter(Boolean)
        .map((problemId: Types.ObjectId | string) => new Types.ObjectId(problemId));

      const problems = await Problem.find({ _id: { $in: objectIds } }).lean();
      const problemMap = new Map(
        problems.map((problem: any) => [problem._id.toString(), problem]),
      );

      const normalizedProblems = assignedEntries
        .map((entry: any) => {
          const problem = problemMap.get(entry?.problemId?.toString());
          if (!problem) return null;

          return {
            id: (problem as any)._id.toString(),
            title: (problem as any).title,
            difficulty: String((problem as any).difficulty ?? 'easy').toLowerCase(),
            points: 50,
            statement: (problem as any).description,
            examples: (problem as any).examples ?? [],
            constraints: Array.isArray((problem as any).constraints)
              ? (problem as any).constraints
              : typeof (problem as any).constraints === 'string'
                ? [(problem as any).constraints]
                : [],
            timeLimit: 1000,
            memoryLimit: 256000,
            roundNumber: (problem as any).roundNumber,
            status: entry?.status ?? 'PENDING',
          };
        })
        .filter(Boolean);

      return NextResponse.json(normalizedProblems);
    }

    // ── Round 3 ────────────────────────────────────────────────────────────
    if (parsedRoundNumber === 3) {
      const session = await requireAuthentication(request);
      const teamId = session.teamId;
      if (!teamId) {
        return NextResponse.json({ error: 'User is not part of a team' }, { status: 403 });
      }

      await connectDB();

      const round = await Round.findOne({ roundNumber: 3 }).lean();
      if (!round) {
        return NextResponse.json({ error: 'Round 3 not found' }, { status: 404 });
      }

      const teamRound = await TeamRound.findOne({
        teamId: new Types.ObjectId(teamId),
        roundId: (round as any)._id,
      }).lean();

      const assignedEntries = (teamRound as any)?.round3?.problems ?? [];
      if (!assignedEntries.length) {
        return NextResponse.json([]);
      }

      const objectIds = assignedEntries
        .map((entry: any) => entry?.problemId)
        .filter(Boolean)
        .map((pid: Types.ObjectId | string) => new Types.ObjectId(pid));

      const problems = await Problem.find({ _id: { $in: objectIds } }).lean();
      const problemMap = new Map(
        problems.map((p: any) => [p._id.toString(), p]),
      );

      const normalizedProblems = assignedEntries
        .map((entry: any, idx: number) => {
          const problem = problemMap.get(entry?.problemId?.toString()) as any;
          if (!problem) return null;

          const solved = entry?.baseSolvePassed ?? false;
          const inProgress = (entry?.submissionCount ?? 0) > 0 && !solved;

          return {
            id: problem._id.toString(),
            title: problem.title,
            difficulty: String(problem.difficulty ?? 'medium').toLowerCase(),
            points: 50, // base; max is 140
            maxPoints: 140,
            statement: problem.description,
            examples: problem.examples ?? [],
            constraints: Array.isArray(problem.constraints)
              ? problem.constraints
              : typeof problem.constraints === 'string'
                ? [problem.constraints]
                : [],
            timeLimit: 1000,
            memoryLimit: 256000,
            roundNumber: 3,
            // Round 3 specific
            numberStr: String(idx + 1).padStart(2, '0'),
            status: solved ? 'SOLVED' : inProgress ? 'IN_PROGRESS' : 'NOT_STARTED',
            constraintsMet:
              (entry?.ouroborosPassed ? 1 : 0) +
              (entry?.shortAndSweetPassed ? 1 : 0) +
              (entry?.oneShotWonderPassed ? 1 : 0) +
              (solved ? 1 : 0),
            totalConstraints: 4,
            totalScore: entry?.totalScore ?? 0,
          };
        })
        .filter(Boolean);

      return NextResponse.json(normalizedProblems);
    }

    return NextResponse.json({ error: 'Unsupported round' }, { status: 400 });
  } catch (error: unknown) {
    console.error('[GET /api/rounds/[roundNumber]/questions]', error);
    const status = (error as any)?.status ?? 500;
    const message = (error as any)?.message ?? 'Internal server error';
    return NextResponse.json({ error: message }, { status });
  }
}
