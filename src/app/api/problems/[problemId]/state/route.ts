import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import {
  getAuthenticatedUser,
  getUserTeam,
  getProblemStateForTeam,
  getProblemById,
} from '@/app/api/_services/problem.service';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ problemId: string }> }
) {
  try {
    const { problemId } = await params;

    if (!Types.ObjectId.isValid(problemId)) {
      return NextResponse.json({ error: 'Invalid problemId' }, { status: 400 });
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

    const problem = await getProblemById(problemId);
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    const state = await getProblemStateForTeam(problemId, teamId);

    return NextResponse.json(state);
  } catch (err: unknown) {
    console.error('[GET /api/problems/[problemId]/state]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
