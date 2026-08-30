import { NextRequest } from 'next/server';
import { getLeaderboard } from '@/app/api/_services/leaderboard.service';
import { successResponse, errorResponse } from '@/app/api/_lib/response';

export async function GET(req: NextRequest) {
  try {
    const leaderboard = await getLeaderboard(false);
    return successResponse(leaderboard);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
