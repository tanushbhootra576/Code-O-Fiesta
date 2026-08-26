import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Submission from '@/models/Submission';
import Problem from '@/models/Problem';
import { submitBatch, LANGUAGE_IDS, Judge0Submission } from '@/lib/judge0';

declare global {
  var submissionCache: Map<string, { code: string; language: string; problemId: string; tokens?: string[] }> | undefined;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { problemId, code, language } = body;

    const languageId = LANGUAGE_IDS[language];
    if (!languageId) {
      return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
    }

    let submissionId = `sub_${Date.now()}`;
    let tokens: string[] = [];
    let problemDetails: any = null;

    if (process.env.MONGODB_URI) {
      try {
        await connectDB();
        
        // Fetch test cases from problem
        if (problemId.length === 24) {
          const problem = await Problem.findById(problemId);
          if (problem) {
            problemDetails = problem;
            const testCases = [...(problem.visibleTestCases || []), ...(problem.hiddenTestCases || [])];
            
            // If no test cases are defined, fallback to examples
            const testsToRun = testCases.length > 0 ? testCases : (problem.examples || []).map(ex => ({
              input: ex.input,
              expectedOutput: ex.output
            }));

            if (testsToRun.length > 0) {
              const submissions: Judge0Submission[] = testsToRun.map(tc => ({
                source_code: code,
                language_id: languageId,
                stdin: tc.input || '',
                expected_output: tc.expectedOutput || ''
              }));
              
              const batchResult = await submitBatch(submissions);
              tokens = batchResult.map(res => res.token);
            }
          }
        }
        
        // Mock teamId, userId, roundId since auth is mock
        const mongoose = require('mongoose');
        const teamId = new mongoose.Types.ObjectId();
        const userId = new mongoose.Types.ObjectId();
        const roundId = new mongoose.Types.ObjectId();
        
        const count = await Submission.countDocuments({ problemId });

        const sub = await Submission.create({
          teamId,
          userId,
          roundId,
          problemId: new mongoose.Types.ObjectId(problemId.length === 24 ? problemId : undefined),
          sourceCode: code,
          language,
          submissionNumber: count + 1,
          verdict: 'PENDING',
          judge0: {
            token: tokens.join(','),
          },
        });

        submissionId = sub._id.toString();
      } catch (dbErr) {
        console.error('Failed to save submission to DB, using mock ID:', dbErr);
      }
    }

    // Fallback if DB failed or isn't configured, submit just example test case if we don't have problem details
    if (tokens.length === 0) {
       // A mock problem's test cases
       const mockInputs = ['word\nlocalization\ninternationalization\npneumonoultramicroscopicsilicovolcanoconiosis'];
       const mockOutputs = ['word\nl10n\ni18n\np43s'];
       const submissions = mockInputs.map((input, idx) => ({
         source_code: code,
         language_id: languageId,
         stdin: input,
         expected_output: mockOutputs[idx]
       }));
       const batchResult = await submitBatch(submissions);
       tokens = batchResult.map(res => res.token);
    }

    // Cache the submission code, metadata, and tokens for dynamic judging during polling
    if (!globalThis.submissionCache) {
      globalThis.submissionCache = new Map();
    }
    globalThis.submissionCache.set(submissionId, { code, language, problemId, tokens });

    return NextResponse.json({ submissionId });
  } catch (err: any) {
    console.error('Submit error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
