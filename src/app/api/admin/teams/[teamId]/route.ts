import { NextRequest } from 'next/server';
import { getTeamDetail } from '@/app/api/_services/admin.service';
import { successResponse, errorResponse } from '@/app/api/_lib/response';
import { requireAdmin } from '@/app/api/_lib/authorization';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    await requireAdmin(req);
    const resolvedParams = await params;
    const detail = await getTeamDetail(resolvedParams.teamId);
    return successResponse(detail);
  } catch (error: any) {
    return errorResponse(error.message, error.status || 500);
  }
}
