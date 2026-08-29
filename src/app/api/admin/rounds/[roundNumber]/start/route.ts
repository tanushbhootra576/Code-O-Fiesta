import { NextRequest } from 'next/server';
import { startRoundGlobally } from '@/app/api/_services/admin.service';
import { successResponse, errorResponse } from '@/app/api/_lib/response';
import { requireAdmin } from '@/app/api/_lib/authorization';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roundNumber: string }> }
) {
  try {
    await requireAdmin(req);
    const resolvedParams = await params;
    const roundNumber = parseInt(resolvedParams.roundNumber, 10);
    if (isNaN(roundNumber)) {
      return errorResponse('Invalid round number', 400);
    }
    const result = await startRoundGlobally(roundNumber);
    return successResponse(result);
  } catch (error: any) {
    return errorResponse(error.message, error.status || 500);
  }
}
