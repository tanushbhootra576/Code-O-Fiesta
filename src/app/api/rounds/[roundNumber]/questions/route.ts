import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Problem from '@/models/Problem';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roundNumber: string }> }
) {
  try {
    const { roundNumber } = await params;
    const rNum = parseInt(roundNumber, 10);

    if (process.env.MONGODB_URI) {
      try {
        await connectDB();
        const problems = await Problem.find({ roundNumber: rNum, isActive: true });
        if (problems && problems.length > 0) {
          return NextResponse.json(problems.map(p => ({
            id: p._id.toString(),
            title: p.title,
            difficulty: p.difficulty.toLowerCase(),
            points: 50,
            statement: p.description,
            examples: p.examples || [],
            constraints: Array.isArray(p.constraints) ? p.constraints : [p.constraints],
            timeLimit: 1000,
            memoryLimit: 256000,
            roundNumber: p.roundNumber,
          })));
        }
      } catch (dbErr) {
        console.error('Failed to query round problems:', dbErr);
      }
    }

    // Default mocks if DB query fails or has no entries
    return NextResponse.json([
      {
        id: 'prob-1',
        title: 'Way Too Long Words',
        difficulty: 'easy',
        points: 50,
        statement: 'Abbreviate long words.',
        examples: [],
        constraints: [],
        timeLimit: 1000,
        memoryLimit: 256000,
        roundNumber: rNum,
      },
      {
        id: 'prob-2',
        title: 'Paint House',
        difficulty: 'medium',
        points: 50,
        statement: 'Minimize paint cost with DP.',
        examples: [],
        constraints: [],
        timeLimit: 1000,
        memoryLimit: 256000,
        roundNumber: rNum,
      },
      {
        id: 'prob-3',
        title: 'Matrix Chain Multiplication',
        difficulty: 'hard',
        points: 50,
        statement: 'Optimize chain multiplication order.',
        examples: [],
        constraints: [],
        timeLimit: 1000,
        memoryLimit: 256000,
        roundNumber: rNum,
      }
    ]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
