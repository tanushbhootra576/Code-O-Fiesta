import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Submission from '@/models/Submission';
import { getBatchSubmissions, Judge0Result } from '@/lib/judge0';
import { SubmissionVerdict } from '@/constants/event';

declare global {
  var submissionCache: Map<string, { code: string; language: string; problemId: string; tokens?: string[] }> | undefined;
}

function mapJudge0StatusToIDEStatus(statusId: number): string {
  if (statusId <= 2) return 'processing';
  if (statusId === 3) return 'accepted';
  if (statusId === 4) return 'wrong_answer';
  if (statusId === 5) return 'time_limit_exceeded';
  if (statusId === 6) return 'compilation_error';
  if (statusId >= 7 && statusId <= 12) return 'runtime_error';
  return 'wrong_answer';
}

function mapToVerdictEnum(status: string): SubmissionVerdict {
  switch (status) {
    case 'accepted': return SubmissionVerdict.ACCEPTED;
    case 'wrong_answer': return SubmissionVerdict.WRONG_ANSWER;
    case 'time_limit_exceeded': return SubmissionVerdict.TIME_LIMIT;
    case 'memory_limit_exceeded': return SubmissionVerdict.MEMORY_LIMIT;
    case 'compilation_error': return SubmissionVerdict.COMPILATION_ERROR;
    case 'runtime_error': return SubmissionVerdict.RUNTIME_ERROR;
    default: return SubmissionVerdict.PENDING;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const { submissionId } = await params;
    
    let tokens: string[] = [];
    let dbSubmission: any = null;
    let isDb = false;

    // 1. Fetch from Database
    if (process.env.MONGODB_URI) {
      try {
        await connectDB();
        if (submissionId.length === 24) {
          dbSubmission = await Submission.findById(submissionId);
          if (dbSubmission && dbSubmission.judge0 && dbSubmission.judge0.token) {
            tokens = dbSubmission.judge0.token.split(',');
            isDb = true;
          }
        }
      } catch (dbErr) {
        console.error('Failed to query submission details from DB:', dbErr);
      }
    }

    // 2. Fallback to memory cache
    if (tokens.length === 0 && globalThis.submissionCache) {
      const cached = globalThis.submissionCache.get(submissionId);
      if (cached && cached.tokens) {
        tokens = cached.tokens;
      }
    }

    if (tokens.length === 0) {
      return NextResponse.json({ error: 'Submission not found or has no tokens' }, { status: 404 });
    }

    // Check if the submission is already fully processed in DB (optional optimization)
    if (isDb && dbSubmission.verdict && dbSubmission.verdict !== SubmissionVerdict.PENDING) {
       // It's already graded, but we need to return in IDE format
       // For this simple implementation, we can just re-fetch from Judge0 or 
       // construct the response from DB.
       // Let's just always poll Judge0 for now to guarantee full data.
    }

    // Fetch batch submissions from Judge0
    const { submissions } = await getBatchSubmissions(tokens);

    let status = 'accepted';
    let testsPassed = 0;
    const totalTests = submissions.length;
    let maxTimeMs = 0;
    let maxMemoryKb = 0;
    let compilerError: string | undefined = undefined;
    let failedTest: any = null;

    const decodeBase64 = (str: string | null) => str ? Buffer.from(str, 'base64').toString('utf-8') : '';

    for (let i = 0; i < submissions.length; i++) {
      const sub = submissions[i];
      const subStatus = mapJudge0StatusToIDEStatus(sub.status.id);
      
      const timeMs = parseFloat(sub.time || '0') * 1000;
      const memKb = sub.memory || 0;
      if (timeMs > maxTimeMs) maxTimeMs = timeMs;
      if (memKb > maxMemoryKb) maxMemoryKb = memKb;

      if (subStatus === 'processing') {
        return NextResponse.json({
          id: submissionId,
          status: 'processing',
          testsPassed: 0,
          totalTests: 0,
          timeMs: 0,
          memoryKb: 0,
          pointsEarned: 0,
          constraintViolations: [],
        });
      }

      if (subStatus === 'accepted') {
        testsPassed++;
      } else if (status === 'accepted') {
        // First failure encountered
        status = subStatus;
        if (subStatus === 'compilation_error') {
          compilerError = decodeBase64(sub.compile_output || sub.stderr || sub.message) || 'Compilation Error';
        } else if (subStatus === 'runtime_error') {
          compilerError = decodeBase64(sub.stderr || sub.message) || 'Runtime Error';
        } else if (subStatus === 'wrong_answer') {
          failedTest = {
             index: i + 1,
             input: 'Hidden Test Case', // We don't echo back hidden test cases
             expected: 'Expected Output',
             actual: decodeBase64(sub.stdout) || '(empty)'
          };
        }
      }
    }

    // If we've finished processing, update DB
    if (isDb && dbSubmission && dbSubmission.verdict === SubmissionVerdict.PENDING) {
       dbSubmission.verdict = mapToVerdictEnum(status);
       dbSubmission.judge0 = {
         ...dbSubmission.judge0,
         statusId: submissions[0].status.id,
         status: status,
         executionTime: maxTimeMs,
         memory: maxMemoryKb,
         compileOutput: compilerError
       };
       await dbSubmission.save();
    }

    // Return final IDE result format
    return NextResponse.json({
      id: submissionId,
      status,
      testsPassed,
      totalTests,
      timeMs: maxTimeMs,
      memoryKb: maxMemoryKb,
      pointsEarned: status === 'accepted' ? 50 : 0,
      compilerError,
      failedTest,
      constraintViolations: []
    });

  } catch (err: any) {
    console.error('Judge0 polling error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
