import {
  errorResponse,
  successResponse,
} from '../../_lib/response';

import { getEventState } from '../../_services/event.service';

export async function GET() {
  try {
    const eventState = await getEventState();

    return successResponse(eventState);
  } catch (error) {
    return errorResponse(error);
  }
}