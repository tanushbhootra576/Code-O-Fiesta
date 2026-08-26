import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Problem from '@/models/Problem';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ problemId: string }> }
) {
  try {
    const { problemId } = await params;
    
    // Connect DB if URI is available
    if (process.env.MONGODB_URI) {
      try {
        await connectDB();
        const problem = await Problem.findById(problemId);
        if (problem) {
          return NextResponse.json({
            id: problem._id.toString(),
            title: problem.title,
            difficulty: problem.difficulty.toLowerCase(),
            points: 50,
            statement: problem.description,
            examples: problem.examples || [],
            constraints: Array.isArray(problem.constraints) ? problem.constraints : [problem.constraints],
            timeLimit: 1000,
            memoryLimit: 256000,
            roundNumber: problem.roundNumber,
          });
        }
      } catch (dbErr) {
        console.error('Database connection / query failed, using mock:', dbErr);
      }
    }

    // Default Mock Problem Fallback
    const isRound3 = problemId.includes('crucible') || problemId.includes('round3') || problemId === '3';
    const isRound2 = problemId.includes('relay') || problemId.includes('round2') || problemId === '2';
    
    return NextResponse.json({
      id: problemId,
      title: isRound3 
        ? 'Compute Fibonacci' 
        : isRound2 
          ? 'Blind Path Solver' 
          : 'Way Too Long Words',
      difficulty: isRound3 ? 'hard' : 'medium',
      points: 50,
      statement: `### Description\nSometimes some words like "localization" or "internationalization" are so long that writing them many times in one text is quite tiresome.\n\nLet's consider a word too long, if its length is strictly more than 10 characters. All too long words should be replaced with a special abbreviation.\n\nThis abbreviation is made like this: we write down the first and the last letter of a word and between them we write the number of letters between the first and the last letters. That number is in decimal system and doesn't contain any leading zeroes.\n\n### Input\nThe first line contains an integer $n$ ($1 \\le n \\le 100$). Each of the following $n$ lines contains one word. All words consist of lowercase English letters and have lengths from 1 to 100 characters.\n\n### Output\nPrint $n$ lines. The $i$-th line should contain the result of the abbreviation of the $i$-th word from the input.`,
      examples: [
        { 
          input: 'word\nlocalization\ninternationalization\npneumonoultramicroscopicsilicovolcanoconiosis', 
          output: 'word\nl10n\ni18n\np43s',
          explanation: '"word" is not too long. "localization" has 12 letters, first is "l", last is "n", 10 letters in between.'
        }
      ],
      constraints: [
        'Time Limit: 1000ms',
        'Memory Limit: 256MB',
        '1 <= n <= 100',
        'Length of each word is between 1 and 100.'
      ],
      timeLimit: 1000,
      memoryLimit: 256000,
      roundNumber: isRound3 ? 3 : isRound2 ? 2 : 1,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
