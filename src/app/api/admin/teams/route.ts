import { NextRequest } from 'next/server';
import { getAllTeams } from '@/app/api/_services/admin.service';
import { successResponse, errorResponse } from '@/app/api/_lib/response';
import { requireAdmin } from '@/app/api/_lib/authorization';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const teams = await getAllTeams();
    return successResponse(teams);
  } catch (error: any) {
    return errorResponse(error.message, error.status || 500);
  }
}
