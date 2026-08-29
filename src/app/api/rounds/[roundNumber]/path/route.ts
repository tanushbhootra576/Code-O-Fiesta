import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import connectDB from '@/lib/db';
import TeamRound from '@/models/TeamRound';
import { validateRound1Path, PathValidationError } from '@/app/api/_validators/problem';
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

    const teamRound = await TeamRound.findOne({ teamId, roundId });
    if (!teamRound) {
      return NextResponse.json({ error: 'TeamRound record not found for this team' }, { status: 404 });
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

    const problems = await selectProblemsForTopic(topic, 3);
    if (problems.length < 3) {
      return NextResponse.json(
        { error: 'Not enough problems available for the selected topic. Please contact an admin.' },
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
