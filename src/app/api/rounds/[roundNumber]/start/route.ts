import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';

import connectDB from '@/lib/db';
import TeamRound from '@/models/TeamRound';
import { requireAuthentication } from '@/app/api/_lib/authorization';
import { TeamRoundStatus } from '@/constants/event';
import {
  getActiveRound3,
  assignRound3Problems,
  getRound3StateForTeam,
} from '@/app/api/_services/round3.service';

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

    const round = await getActiveRound3();
    if (!round) {
      return NextResponse.json({ error: 'Round 3 is not currently active' }, { status: 403 });
    }

    const roundId = (round as any)._id as Types.ObjectId;
    const teamObjectId = new Types.ObjectId(teamId);

    await connectDB();

    // Upsert TeamRound — create if missing
    let teamRound = await TeamRound.findOne({ teamId: teamObjectId, roundId });

    if (!teamRound) {
      const now = new Date();
      const endsAt = new Date(now.getTime() + (round as any).durationSeconds * 1000);
      try {
        teamRound = await TeamRound.create({
          teamId: teamObjectId,
          roundId,
          status: TeamRoundStatus.IN_PROGRESS,
          startedAt: now,
          endsAt,
          score: 0,
        });
      } catch (createErr: any) {
        if (createErr.code === 11000) {
          teamRound = await TeamRound.findOne({ teamId: teamObjectId, roundId });
          if (!teamRound) throw createErr;
        } else {
          throw createErr;
        }
      }
    } else if (teamRound.status === TeamRoundStatus.NOT_STARTED) {
      const now = new Date();
      const endsAt = new Date(now.getTime() + (round as any).durationSeconds * 1000);
      teamRound.set('status', TeamRoundStatus.IN_PROGRESS);
      teamRound.set('startedAt', now);
      teamRound.set('endsAt', endsAt);
      await teamRound.save();
    }
    // If already IN_PROGRESS or COMPLETED — idempotent, just return current state

    // Assign problems (idempotent — no-op if already assigned)
    await assignRound3Problems(teamObjectId, roundId);

    // Return full state
    const state = await getRound3StateForTeam(teamObjectId, roundId);

    return NextResponse.json(state, { status: 200 });
  } catch (err: unknown) {
    console.error('[POST /api/rounds/[roundNumber]/start]', err);
    const status = (err as any)?.status ?? 500;
    const message = (err as any)?.message ?? 'Internal server error';
    return NextResponse.json({ error: message }, { status });
  }
}
