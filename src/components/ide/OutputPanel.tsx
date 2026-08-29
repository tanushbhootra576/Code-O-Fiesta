'use client';

import React from 'react';
import { RunResult } from '@/types/submission';

interface OutputPanelProps {
  runResult: RunResult | null;
  isRunning: boolean;
  errorMsg?: string | null;
}

export default function OutputPanel({ runResult, isRunning, errorMsg }: OutputPanelProps) {
  if (isRunning) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-[var(--text-secondary)] font-mono text-xs gap-3">
        <svg className="animate-spin h-5 w-5 text-cyan-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span>Running your code...</span>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex flex-col h-full gap-3 font-mono text-xs">
        <div className="flex items-center gap-3 px-3 py-2 rounded bg-red-950/20 border border-red-500/20">
          <span className="text-[10px] text-red-400 uppercase font-bold">Execution Error:</span>
          <span className="text-red-300">{errorMsg}</span>
        </div>
      </div>
    );
  }

  if (!runResult) {
    return (
      <div className="flex items-center justify-center h-full min-h-[120px] text-[var(--text-muted)] font-mono text-xs">
        No output to display. Run code to see results.
      </div>
    );
  }

  const { stdout, stderr, exitCode, timeMs, memoryKb, matchesExpected } = runResult;
  const isSuccess = exitCode === 0;

  return (
    <div className="flex flex-col h-full gap-3 font-mono text-xs">
      {/* Execution Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 rounded bg-[#0a0a18] border border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[var(--text-muted)] uppercase">Status:</span>
          <span className={`font-bold ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
            {isSuccess ? 'Success (0)' : `Error (${exitCode})`}
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-[var(--text-secondary)]">
          <div>Time: <span className="text-white font-bold">{timeMs} ms</span></div>
          <div>Memory: <span className="text-white font-bold">{memoryKb} KB</span></div>
          {matchesExpected && (
            <div className="flex items-center gap-1 text-green-400 font-bold bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded">
              ✓ Matches expected
            </div>
          )}
        </div>
      </div>

      {/* Output Logs */}
      <div className="flex-grow flex flex-col gap-2.5">
        {stderr && (
          <div className="flex flex-col flex-grow">
            <span className="text-[10px] text-red-400 uppercase font-bold mb-1">Standard Error</span>
            <pre className="flex-grow p-3 rounded-lg bg-red-950/10 border border-red-500/10 text-red-300 overflow-auto max-h-[200px] whitespace-pre-wrap">
              {stderr}
            </pre>
          </div>
        )}

        <div className="flex flex-col flex-grow">
          <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold mb-1">Standard Output</span>
          <pre className="flex-grow p-3 rounded-lg bg-[#060612] border border-[var(--border-subtle)] text-slate-100 overflow-auto max-h-[200px] whitespace-pre-wrap">
            {stdout || (isSuccess ? '(no stdout output)' : '')}
          </pre>
        </div>
      </div>
    </div>
  );
}
