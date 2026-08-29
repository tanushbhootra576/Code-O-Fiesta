'use client';

import React, { useState } from 'react';
import { RunResult, TestCaseResult, Verdict } from '@/types/submission';

interface OutputPanelProps {
  runResult: RunResult | null;
  isRunning: boolean;
  errorMsg?: string | null;
}

const VERDICT_STYLES: Record<Verdict, { color: string; bg: string; text: string }> = {
  ACCEPTED: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'Accepted' },
  WRONG_ANSWER: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', text: 'Wrong Answer' },
  TIME_LIMIT_EXCEEDED: { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', text: 'Time Limit Exceeded' },
  COMPILATION_ERROR: { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', text: 'Compilation Error' },
  RUNTIME_ERROR: { color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/20', text: 'Runtime Error' },
  PENDING: { color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20', text: 'Pending' },
  EXECUTED: { color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', text: 'Executed' },
};

export default function OutputPanel({ runResult, isRunning, errorMsg }: OutputPanelProps) {
  const [activeCaseIdx, setActiveCaseIdx] = useState(0);

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

  if (runResult.mode === 'custom') {
    const { status, verdict, stdout, stderr, compileOutput, executionTime, memory } = runResult;
    const style = VERDICT_STYLES[verdict] || VERDICT_STYLES.EXECUTED;

    return (
      <div className="flex flex-col h-full gap-3 font-mono text-xs">
        <div className={`flex flex-wrap items-center justify-between gap-3 px-3 py-2 rounded border ${style.bg}`}>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-[var(--text-muted)] uppercase">Status:</span>
            <span className={`font-bold ${style.color}`}>{style.text}</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-[var(--text-secondary)]">
            <div>Time: <span className="text-white font-bold">{executionTime} ms</span></div>
            <div>Memory: <span className="text-white font-bold">{memory} KB</span></div>
          </div>
        </div>

        <div className="flex-grow flex flex-col gap-2.5 overflow-auto">
          {compileOutput && (
            <div className="flex flex-col flex-grow shrink-0">
              <span className="text-[10px] text-orange-400 uppercase font-bold mb-1">Compilation Output</span>
              <pre className="p-3 rounded-lg bg-orange-950/10 border border-orange-500/10 text-orange-300 whitespace-pre-wrap">
                {compileOutput}
              </pre>
            </div>
          )}
          {stderr && (
            <div className="flex flex-col flex-grow shrink-0">
              <span className="text-[10px] text-red-400 uppercase font-bold mb-1">Standard Error</span>
              <pre className="p-3 rounded-lg bg-red-950/10 border border-red-500/10 text-red-300 whitespace-pre-wrap">
                {stderr}
              </pre>
            </div>
          )}
          <div className="flex flex-col flex-grow shrink-0">
            <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold mb-1">Standard Output</span>
            <pre className="p-3 rounded-lg bg-[#060612] border border-[var(--border-subtle)] text-slate-100 whitespace-pre-wrap min-h-[60px]">
              {stdout || '(no stdout output)'}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  // mode === 'examples'
  const { verdict, passed, total, cases } = runResult;
  const overallStyle = VERDICT_STYLES[verdict] || VERDICT_STYLES.PENDING;
  const activeCase = cases[activeCaseIdx] || cases[0];

  return (
    <div className="flex flex-col h-full font-mono text-xs overflow-hidden">
      {/* Overall Verdict */}
      <div className={`flex flex-wrap items-center justify-between gap-3 px-3 py-2 rounded-t-lg border-b-0 border ${overallStyle.bg}`}>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[var(--text-muted)] uppercase">Overall:</span>
          <span className={`font-bold ${overallStyle.color}`}>{overallStyle.text}</span>
        </div>
        <div className="flex items-center gap-4 text-[10px]">
          <span className="text-slate-300">
            Passed <span className={passed === total ? 'text-emerald-400 font-bold' : 'text-white font-bold'}>{passed}/{total}</span>
          </span>
        </div>
      </div>

      {/* Case Tabs */}
      <div className="flex gap-1 px-2 pt-2 bg-[#0c0d21] border border-b-0 border-[#1e1e3a]">
        {cases.map((c, idx) => {
          const isAC = c.verdict === 'ACCEPTED';
          const isActive = idx === activeCaseIdx;
          return (
            <button
              key={idx}
              onClick={() => setActiveCaseIdx(idx)}
              className={`px-3 py-1.5 rounded-t-lg border-t border-x transition-colors flex items-center gap-2 ${
                isActive 
                  ? 'bg-[#151632] border-[#2a2b52] text-white' 
                  : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              {isAC ? (
                <span className="text-emerald-400 text-[10px]">●</span>
              ) : (
                <span className="text-red-400 text-[10px]">●</span>
              )}
              Case {c.caseNumber}
            </button>
          );
        })}
      </div>

      {/* Active Case Details */}
      <div className="flex-grow flex flex-col gap-3 p-3 bg-[#151632] border border-[#1e1e3a] rounded-b-lg overflow-auto">
        {activeCase && (
          <>
            <div className="flex items-center gap-4 text-[10px] text-[var(--text-secondary)] mb-1">
              <div>Verdict: <span className={`font-bold ${VERDICT_STYLES[activeCase.verdict]?.color}`}>{VERDICT_STYLES[activeCase.verdict]?.text}</span></div>
              <div>Time: <span className="text-white font-bold">{activeCase.executionTime} ms</span></div>
              <div>Memory: <span className="text-white font-bold">{activeCase.memory} KB</span></div>
            </div>

            {activeCase.compileOutput && (
              <div className="flex flex-col shrink-0">
                <span className="text-[10px] text-orange-400 uppercase font-bold mb-1">Compilation Error</span>
                <pre className="p-3 rounded-lg bg-orange-950/20 border border-orange-500/20 text-orange-300 whitespace-pre-wrap text-[11px]">
                  {activeCase.compileOutput}
                </pre>
              </div>
            )}
            
            {activeCase.stderr && (
              <div className="flex flex-col shrink-0">
                <span className="text-[10px] text-red-400 uppercase font-bold mb-1">Standard Error</span>
                <pre className="p-3 rounded-lg bg-red-950/20 border border-red-500/20 text-red-300 whitespace-pre-wrap text-[11px]">
                  {activeCase.stderr}
                </pre>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0">
              <div className="flex flex-col">
                <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold mb-1">Input</span>
                <pre className="p-2.5 rounded bg-[#0a0a1a] border border-[#1e1e3a] text-slate-300 whitespace-pre-wrap min-h-[40px] text-[11px]">
                  {activeCase.input || '(empty)'}
                </pre>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold mb-1">Expected Output</span>
                <pre className="p-2.5 rounded bg-[#0a0a1a] border border-[#1e1e3a] text-slate-300 whitespace-pre-wrap min-h-[40px] text-[11px]">
                  {activeCase.expectedOutput || '(empty)'}
                </pre>
              </div>
            </div>

            <div className="flex flex-col shrink-0">
              <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold mb-1">Your Output</span>
              <pre className={`p-2.5 rounded border whitespace-pre-wrap min-h-[40px] text-[11px] ${
                activeCase.matchesExpected 
                  ? 'bg-emerald-950/10 border-emerald-500/20 text-emerald-100'
                  : 'bg-red-950/10 border-red-500/20 text-red-100'
              }`}>
                {activeCase.actualOutput || '(no stdout output)'}
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
