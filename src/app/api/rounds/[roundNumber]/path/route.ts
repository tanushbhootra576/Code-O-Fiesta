import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import connectDB from '@/lib/db';
import Problem from '@/models/Problem';
import TeamRound from '@/models/TeamRound';
import { validateRound1Path, PathValidationError } from '@/app/api/_validators/problem';
import { TeamRoundStatus } from '@/constants/event';
import {
  getAuthenticatedUser,
  getUserTeam,
  getActiveRound,
  selectProblemsForTopic,
  buildSafeProblem,
  PATH_TO_TOPIC,
} from '@/app/api/_services/problem.service';

// ── GET /api/rounds/1/path ─────────────────────────────────────────────────
// Returns whether the authenticated team has already locked a Round 1 path.
// The maze page calls this on mount so the backend — not localStorage — is
// the single source of truth for the path-lock guard.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ roundNumber: string }> }
) {
  try {
    const { roundNumber } = await params;

    if (roundNumber !== '1') {
      return NextResponse.json({ error: 'This endpoint only supports Round 1' }, { status: 400 });
    }

    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const team = await getUserTeam((user as any)._id as Types.ObjectId);
    if (!team) {
      return NextResponse.json({ error: 'No team found for this user' }, { status: 404 });
    }

    const round = await getActiveRound(1);
    if (!round) {
      return NextResponse.json({ locked: false });
    }

    await connectDB();

    const teamRound = await TeamRound.findOne({
      teamId: (team as any)._id as Types.ObjectId,
      roundId: (round as any)._id as Types.ObjectId,
    })
      .select('round1.selectedPath')
      .lean();

    const selectedPath = (teamRound as any)?.round1?.selectedPath ?? null;

    return NextResponse.json({
      locked: !!selectedPath,
      path: selectedPath,
    });
  } catch (err: unknown) {
    console.error('[GET /api/rounds/[roundNumber]/path]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── POST /api/rounds/1/path ────────────────────────────────────────────────
// Locks the selected path for the team. Returns 409 if already locked.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ roundNumber: string }> }
) {
  try {
    const { roundNumber } = await params;

    if (roundNumber !== '1') {
      return NextResponse.json({ error: 'This endpoint only supports Round 1' }, { status: 400 });
    }

    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const userId = (user as any)._id as Types.ObjectId;

    const team = await getUserTeam(userId);
    if (!team) {
      return NextResponse.json({ error: 'No team found for this user' }, { status: 404 });
    }

    const teamId = (team as any)._id as Types.ObjectId;

    const round = await getActiveRound(1);
    if (!round) {
      return NextResponse.json({ error: 'Round 1 is not currently active' }, { status: 403 });
    }

    const roundId = (round as any)._id as Types.ObjectId;

    await connectDB();

    let teamRound = await TeamRound.findOne({ teamId, roundId });
    if (!teamRound) {
      const now = new Date();
      const durationSeconds = (round as any).durationSeconds || 3600;
      const endsAt = new Date(now.getTime() + durationSeconds * 1000);
      try {
        teamRound = await TeamRound.create({
          teamId,
          roundId,
          status: TeamRoundStatus.IN_PROGRESS,
          startedAt: now,
          endsAt,
          score: 0,
        });
      } catch (createErr: any) {
        if (createErr.code === 11000) {
          teamRound = await TeamRound.findOne({ teamId, roundId });
          if (!teamRound) throw createErr;
        } else {
          throw createErr;
        }
      }
    } else if (teamRound.status === TeamRoundStatus.NOT_STARTED) {
      teamRound.set('status', TeamRoundStatus.IN_PROGRESS);
      if (!teamRound.startedAt) teamRound.set('startedAt', new Date());
      if (!teamRound.endsAt) {
        const durationSeconds = (round as any).durationSeconds || 3600;
        teamRound.set('endsAt', new Date(Date.now() + durationSeconds * 1000));
      }
    }

    if (teamRound.round1?.selectedPath) {
      return NextResponse.json(
        {
          error: 'Path already locked',
          lockedPath: teamRound.round1.selectedPath,
        },
        { status: 409 }
      );
    }

    const body = await _req.json().catch(() => ({}));
    let selectedPath;
    try {
      selectedPath = validateRound1Path(body?.path);
    } catch (err) {
      if (err instanceof PathValidationError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }

    const topic = PATH_TO_TOPIC[selectedPath];

    let problems = await selectProblemsForTopic(topic, 3);
    if (problems.length < 3) {
      const existingIds = problems.map((p: any) => p._id);
      const fallbackProblems = await Problem.aggregate([
        { $match: { roundNumber: 1, isActive: true, _id: { $nin: existingIds } } },
        { $sample: { size: 3 - problems.length } },
      ]);
      problems = [...problems, ...fallbackProblems];
    }

    if (problems.length === 0) {
      return NextResponse.json(
        { error: 'No problems available for Round 1. Please contact an admin.' },
        { status: 500 }
      );
    }

    teamRound.set('round1.selectedPath', selectedPath);
    teamRound.set('round1.revealedTopic', topic);
    teamRound.set('round1.selectedAt', new Date());
    teamRound.set(
      'round1.problems',
      problems.map((p: any) => ({
        problemId: new Types.ObjectId(p._id.toString()),
        status: 'PENDING' as const,
      }))
    );

    await teamRound.save();

    const safeProblems = problems.map(buildSafeProblem);

    return NextResponse.json({
      path: selectedPath,
      topic,
      problems: safeProblems,
    });
  } catch (err: unknown) {
    console.error('[POST /api/rounds/[roundNumber]/path]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
