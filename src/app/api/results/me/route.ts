import { NextRequest } from 'next/server';
import { getTeamResults } from '@/app/api/_services/leaderboard.service';
import { successResponse, errorResponse } from '@/app/api/_lib/response';
import { requireAuthentication } from '@/app/api/_lib/authorization';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuthentication(req);
    if (!user.teamId) {
      return errorResponse('User is not part of a team', 400);
    }
    const results = await getTeamResults(user.teamId);
    return successResponse(results);
  } catch (error: any) {
    return errorResponse(error.message, error.status || 500);
  }
}
