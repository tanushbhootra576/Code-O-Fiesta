import { NextRequest, NextResponse } from 'next/server';
import {
  getProblemById,
  buildSafeProblem,
} from '@/app/api/_services/problem.service';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ problemId: string }> }
) {
  try {
    const { problemId } = await params;

    const problem = await getProblemById(problemId);
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    return NextResponse.json(buildSafeProblem(problem));
  } catch (err: unknown) {
    console.error('[GET /api/problems/[problemId]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
