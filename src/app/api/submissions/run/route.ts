import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Problem from '@/models/Problem';
import { executeTestCases, calculateVerdict, ExecutionMode } from '../../_services/judge.service';

export async function POST(request: Request) {
  const t0 = performance.now();
  
  try {
    const body = await request.json();
    const { code, language, customInput, problemId, mode = 'custom' } = body;
    const tParsed = performance.now();

    let cpuTimeLimit = 2.0;
    let memoryLimit = 128000;
    let testCases: { input: string; expectedOutput?: string }[] = [];

    if (mode === 'custom') {
      testCases = [{ input: customInput || '' }];
    }

    let tDbStart = performance.now();
    let tDbEnd = tDbStart;

    if (problemId && process.env.MONGODB_URI) {
      try {
        tDbStart = performance.now();
        await connectDB();
        const problem = await Problem.findById(problemId);
        tDbEnd = performance.now();
        if (problem) {
          cpuTimeLimit = problem.cpuTimeLimit || 2.0;
          memoryLimit = problem.memoryLimit || 128000;
          
          if (mode === 'examples') {
            // Priority: visibleTestCases then examples
            const visible = problem.visibleTestCases || [];
            if (visible.length > 0) {
              testCases = visible;
            } else if (problem.examples && problem.examples.length > 0) {
              testCases = problem.examples.map(ex => ({
                input: ex.input,
                expectedOutput: ex.output,
              }));
            }
          }
        }
      } catch (e) {
        tDbEnd = performance.now();
        console.error('Error fetching problem details for run:', e);
      }
    }

    if (testCases.length === 0 && mode === 'examples') {
      // Fallback if DB failed or no examples exist
      testCases = [{ input: '4\nword\nlocalization\ninternationalization\npneumonoultramicroscopicsilicovolcanoconiosis', expectedOutput: 'word\nl10n\ni18n\np43s' }];
    }

    const tJudgeStart = performance.now();
    const results = await executeTestCases({
      sourceCode: code,
      language,
      testCases,
      cpuTimeLimit,
      memoryLimit,
      mode: mode as ExecutionMode,
    });
    const tJudgeEnd = performance.now();

    const _timings = {
      totalMs: Math.round(performance.now() - t0),
      parseMs: Math.round(tParsed - t0),
      mongoMs: Math.round(tDbEnd - tDbStart),
      judge0Ms: Math.round(tJudgeEnd - tJudgeStart),
      testCaseCount: testCases.length,
      language,
      mode,
    };

    console.log('[RUN TIMINGS]', JSON.stringify(_timings));

    if (mode === 'custom') {
      const res = results[0];
      return NextResponse.json({
        mode: 'custom',
        status: res.verdict === 'COMPILATION_ERROR' || res.verdict === 'RUNTIME_ERROR' || res.verdict === 'TIME_LIMIT_EXCEEDED' ? res.verdict : 'SUCCESS',
        verdict: res.verdict,
        stdout: res.actualOutput,
        stderr: res.stderr,
        compileOutput: res.compileOutput,
        executionTime: res.executionTime,
        memory: res.memory,
        _timings,
      });
    }

    const verdict = calculateVerdict(results);
    const passed = results.filter(r => r.verdict === 'ACCEPTED').length;

    return NextResponse.json({
      mode: 'examples',
      verdict,
      passed,
      total: results.length,
      cases: results,
      _timings,
    });

  } catch (err: any) {
    console.error('Judge0 Run Error:', err);
    return NextResponse.json({ error: err.message, _timings: { totalMs: Math.round(performance.now() - t0) } }, { status: 500 });
  }
}
