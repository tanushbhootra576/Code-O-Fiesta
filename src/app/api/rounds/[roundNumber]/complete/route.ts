import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';

import connectDB from '@/lib/db';
import TeamRound from '@/models/TeamRound';
import { requireAuthentication } from '@/app/api/_lib/authorization';
import { TeamRoundStatus } from '@/constants/event';
import { getRound3 } from '@/app/api/_services/round3.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roundNumber: string }> },
) {
  try {
    const { roundNumber } = await params;
    if (roundNumber !== '3') {
      return NextResponse.json({ error: 'This endpoint only supports Round 3' }, { status: 400 });
    }

    const session = await requireAuthentication(request);
    const teamId = session.teamId;
    if (!teamId) {
      return NextResponse.json({ error: 'User is not part of a team' }, { status: 403 });
    }

    const round = await getRound3();
    if (!round) {
      return NextResponse.json({ error: 'Round 3 not found' }, { status: 404 });
    }

    await connectDB();

    const teamRound = await TeamRound.findOne({
      teamId: new Types.ObjectId(teamId),
      roundId: (round as any)._id,
    });

    if (!teamRound) {
      return NextResponse.json({ error: 'No active round for this team' }, { status: 404 });
    }

    if (teamRound.status === TeamRoundStatus.COMPLETED) {
      return NextResponse.json({ error: 'Round already completed' }, { status: 409 });
    }

    teamRound.set('status', TeamRoundStatus.COMPLETED);
    teamRound.set('completedAt', new Date());
    await teamRound.save();

    return NextResponse.json({
      status: 'COMPLETED',
      score: teamRound.score ?? 0,
      completedAt: teamRound.completedAt,
    });
  } catch (err: unknown) {
    console.error('[POST /api/rounds/[roundNumber]/complete]', err);
    const status = (err as any)?.status ?? 500;
    const message = (err as any)?.message ?? 'Internal server error';
    return NextResponse.json({ error: message }, { status });
  }
}
