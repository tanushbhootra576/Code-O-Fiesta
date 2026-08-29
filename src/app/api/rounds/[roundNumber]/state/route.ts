import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';

import connectDB from '@/lib/db';
import TeamRound from '@/models/TeamRound';
import { requireAuthentication } from '@/app/api/_lib/authorization';
import { getRound3, getRound3StateForTeam } from '@/app/api/_services/round3.service';

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
      const state = await roundService.getState(scoped);

      return NextResponse.json(state);
    }

    // ── Round 3 ────────────────────────────────────────────────────────────
    if (roundNumber !== '3') {
      return NextResponse.json({ error: 'This endpoint only supports Round 2 and Round 3' }, { status: 400 });
    }

    const session = await requireAuthentication(request);
    const teamId = session.teamId;
    if (!teamId) {
      return NextResponse.json({ error: 'User is not part of a team' }, { status: 403 });
    }

    const round = await getRound3();
    if (!round) {
      return NextResponse.json(
        { status: 'NOT_STARTED', startedAt: null, endsAt: null, score: 0, problems: [], roundConfig: null },
        { status: 200 },
      );
    }

    await connectDB();
    const teamRound = await TeamRound.findOne({
      teamId: new Types.ObjectId(teamId),
      roundId: (round as any)._id,
    }).lean();

    if (!teamRound) {
      return NextResponse.json(
        { status: 'NOT_STARTED', startedAt: null, endsAt: null, score: 0, problems: [], roundConfig: null },
        { status: 200 },
      );
    }

    const state = await getRound3StateForTeam(
      new Types.ObjectId(teamId),
      (round as any)._id,
    );

    return NextResponse.json(state);
  } catch (err: unknown) {
    console.error('[GET /api/rounds/[roundNumber]/state]', err);
    const status = (err as any)?.status ?? 500;
    const message = (err as any)?.message ?? 'Internal server error';
    return NextResponse.json({ error: message }, { status });
  }
}
