import { requireAuthentication } from '../../_lib/authorization';
import {
  errorResponse,
  successResponse,
} from '../../_lib/response';

import { getTeamState } from '../../_services/team.service';

export async function GET(request: Request) {
  try {
    const session =
      await requireAuthentication(request);

    if (!session.teamId) {
      return successResponse({
        team: null,
        currentRound: null,
        progress: null,
      });
    }

    const teamState = await getTeamState(
      session.teamId,
    );

    return successResponse(teamState);
  } catch (error) {
    return errorResponse(error);
  }
}