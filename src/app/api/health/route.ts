import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/app/api/_lib/response';
import connectDB from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    return successResponse({ status: 'ok', database: 'connected' });
  } catch (error: any) {
    return errorResponse('Service unavailable', 503);
  }
}
