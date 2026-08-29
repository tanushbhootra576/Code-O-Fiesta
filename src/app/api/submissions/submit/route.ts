import { NextResponse } from 'next/server';
import { Types } from 'mongoose';

import connectDB from '@/lib/db';
import Submission from '@/models/Submission';
import Problem from '@/models/Problem';
import Round from '@/models/Round';
import TeamRound from '@/models/TeamRound';
import { submitBatch, LANGUAGE_IDS, Judge0Submission } from '@/lib/judge0';
import { analyzeSourceCode } from '../../_services/ast.service';
import { requireAuthentication } from '../../_lib/authorization';
import {
  incrementRound3SubmissionCount,
} from '../../_services/round3.service';
import { RoundStatus } from '@/constants/event';

declare global {
  var submissionCache:
    | Map<
        string,
        {
          code: string;
          language: string;
          problemId: string;
          roundNumber?: number;
          tokens?: string[];
          astResult?: any;
          teamId?: string;
          userId?: string;
          roundId?: string;
          isFirstAttempt?: boolean;
        }
      >
    | undefined;
}

export async function POST(request: Request) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────
    const session = await requireAuthentication(request);
    const userId = session.userId;
    const teamId = session.teamId;

    if (!teamId) {
      return NextResponse.json({ error: 'User is not part of a team' }, { status: 403 });
    }

    // ── Parse body ────────────────────────────────────────────────────────
    const body = await request.json();
    const { problemId, code, language, roundNumber } = body;

    if (!problemId || !code || !language) {
      return NextResponse.json({ error: 'Missing required fields: problemId, code, language' }, { status: 400 });
    }

    const languageId = LANGUAGE_IDS[language];
    if (!languageId) {
      return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
    }

    let submissionId = `sub_${Date.now()}`;
    let tokens: string[] = [];
    let problemDetails: any = null;
    let roundId: string | undefined;

    // ── AST Analysis (Round 3 only) ────────────────────────────────────────
    let astResult: any = undefined;
    if (roundNumber === 3) {
      try {
        astResult = await analyzeSourceCode(code, language);
      } catch (astErr) {
        console.error('AST Analysis failed during submission:', astErr);
      }
    }

    // ── DB Submission ──────────────────────────────────────────────────────
    await connectDB();

    // Resolve roundId from the active round
    const round = await Round.findOne({
      roundNumber: roundNumber ?? 1,
      status: RoundStatus.ACTIVE,
    }).lean();

    if (round) {
      roundId = (round as any)._id.toString();
    } else {
      // Fall back to any round matching the number (e.g. if round is COMPLETED)
      const anyRound = await Round.findOne({ roundNumber: roundNumber ?? 1 }).lean();
      if (anyRound) roundId = (anyRound as any)._id.toString();
    }

    // Fetch test cases
    if (Types.ObjectId.isValid(problemId)) {
      const problem = await Problem.findById(problemId);
      if (problem) {
        problemDetails = problem;
        const testCases = [
          ...(problem.visibleTestCases || []),
          ...(problem.hiddenTestCases || []),
        ];
        const testsToRun =
          testCases.length > 0
            ? testCases
            : (problem.examples || []).map((ex: any) => ({
                input: ex.input,
                expectedOutput: ex.output,
              }));

        if (testsToRun.length > 0) {
          const submissions: Judge0Submission[] = testsToRun.map((tc: any) => ({
            source_code: code,
            language_id: languageId,
            stdin: tc.input || '',
            expected_output: tc.expectedOutput || '',
          }));

          const batchResult = await submitBatch(submissions);
          tokens = batchResult.map((res) => res.token);
        }
      }
    }

    // For round 3: determine if this is the first attempt BEFORE creating the submission
    let isFirstAttempt = true;
    if (roundNumber === 3 && roundId && teamId) {
      try {
        const teamRound = await TeamRound.findOne({
          teamId: new Types.ObjectId(teamId),
          roundId: new Types.ObjectId(roundId),
        }).lean() as any;

        if (teamRound?.round3?.problems) {
          const entry = teamRound.round3.problems.find(
            (p: any) => p.problemId?.toString() === problemId,
          );
          // isFirstAttempt if no previous submissions for this problem
          isFirstAttempt = (entry?.submissionCount ?? 0) === 0;
        }
      } catch (e) {
        console.error('Failed to check submission count:', e);
      }
    }

    // Count existing submissions for submissionNumber
    const count = await Submission.countDocuments({
      problemId: Types.ObjectId.isValid(problemId) ? new Types.ObjectId(problemId) : undefined,
      teamId: new Types.ObjectId(teamId),
    });

    const sub = await Submission.create({
      teamId: new Types.ObjectId(teamId),
      userId: new Types.ObjectId(userId),
      roundId: roundId ? new Types.ObjectId(roundId) : new Types.ObjectId(),
      problemId: Types.ObjectId.isValid(problemId)
        ? new Types.ObjectId(problemId)
        : new Types.ObjectId(),
      sourceCode: code,
      language,
      submissionNumber: count + 1,
      verdict: 'PENDING',
      judge0: {
        token: tokens.join(','),
      },
      ...(astResult && { astAnalysis: astResult }),
    });

    submissionId = sub._id.toString();

    // For round 3: increment submission count in TeamRound
    if (roundNumber === 3 && roundId && teamId) {
      try {
        await incrementRound3SubmissionCount(
          new Types.ObjectId(teamId),
          new Types.ObjectId(roundId),
          problemId,
        );
      } catch (e) {
        console.error('Failed to increment round3 submission count:', e);
      }
    }

    // Fallback tokens if no test cases found
    if (tokens.length === 0) {
      const mockInputs = ['4\nword\nlocalization\ninternationalization\npneumonoultramicroscopicsilicovolcanoconiosis'];
      const mockOutputs = ['word\nl10n\ni18n\np43s'];
      const submissions: Judge0Submission[] = mockInputs.map((input, idx) => ({
        source_code: code,
        language_id: languageId,
        stdin: input,
        expected_output: mockOutputs[idx],
      }));
      const batchResult = await submitBatch(submissions);
      tokens = batchResult.map((res) => res.token);

      // Update submission with tokens
      await Submission.findByIdAndUpdate(sub._id, { 'judge0.token': tokens.join(',') });
    }

    // Cache for polling
    if (!globalThis.submissionCache) {
      globalThis.submissionCache = new Map();
    }
    globalThis.submissionCache.set(submissionId, {
      code,
      language,
      problemId,
      roundNumber,
      tokens,
      astResult,
      teamId,
      userId,
      roundId,
      isFirstAttempt,
    });

    return NextResponse.json({ submissionId });
  } catch (err: any) {
    console.error('Submit error:', err);
    const status = err?.status ?? 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
