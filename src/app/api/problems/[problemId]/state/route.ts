import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Submission from '@/models/Submission';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ problemId: string }> }
) {
  try {
    const { problemId } = await params;
    
    if (process.env.MONGODB_URI) {
      try {
        await connectDB();
        // Check if there is any accepted submission for this problem
        const solvedSubmission = await Submission.findOne({
          problemId,
          verdict: 'ACCEPTED'
        });
        return NextResponse.json({ solved: !!solvedSubmission });
      } catch (dbErr) {
        console.error('Failed to query problem solve state:', dbErr);
      }
    }

    return NextResponse.json({ solved: false });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
