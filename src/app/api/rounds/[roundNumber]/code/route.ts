import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { roundErrorResponse, roundService } from '../../../_services/round.service';
import {
  parsePatchRound2CodeBody,
  parseRound2Params,
  readJsonBody,
} from '../../../_validators/round';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ roundNumber: string }> },
) {
  try {
    const roundNumber = await parseRound2Params(context.params);
    const body = parsePatchRound2CodeBody(await readJsonBody(request));
    const actor = await roundService.resolveActor(request);
    const scoped = { roundNumber, actor };

    await roundService.applyLazyPhaseHandover(scoped);
    const result = await roundService.patchCode({ ...scoped, body });

    return NextResponse.json(result);
  } catch (error) {
    return roundErrorResponse(error);
  }
}
