import { NextRequest } from 'next/server';
import { overrideRoundState } from '@/app/api/_services/admin.service';
import { successResponse, errorResponse } from '@/app/api/_lib/response';
import { requireAdmin } from '@/app/api/_lib/authorization';
import { overrideRoundStateSchema } from '@/app/api/_validators/admin';

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
    
    const body = await req.json();
    const payload = overrideRoundStateSchema.parse(body);
    
    const result = await overrideRoundState(roundNumber, payload);
    return successResponse(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors, 400);
    }
    return errorResponse(error.message, error.status || 500);
  }
}
