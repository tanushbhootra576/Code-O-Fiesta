'use client';

import React from 'react';
import Link from 'next/link';

export type ProblemStatus = 'locked' | 'available' | 'attempted' | 'solved';

export interface Round1Problem {
  id: string;
  title: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  maxScore: number;
  status: ProblemStatus;
  solvedAt?: string;
}

interface Round1ProblemListProps {
  problems: Round1Problem[];
  topic: string;
  pathLabel?: string;
}

const statusConfig: Record<
  ProblemStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  locked: {
    label: 'Locked',
    color: 'text-slate-500',
    bg: 'bg-slate-800/40',
    border: 'border-slate-700/50',
  },
  available: {
    label: 'Available',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  attempted: {
    label: 'Attempted',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
  },
  solved: {
    label: 'Solved',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
};

function StatusBadge({ status }: { status: ProblemStatus }) {
  const cfg = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg.color} ${cfg.bg} border ${cfg.border}`}
    >
      {status === 'solved' && (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {cfg.label}
    </span>
  );
}

export default function Round1ProblemList({
  problems,
  topic,
  pathLabel,
}: Round1ProblemListProps) {
  const solvedCount = problems.filter((p) => p.status === 'solved').length;
  const total = problems.length;

  return (
    <div className="flex flex-col gap-5">
      {/* Header strip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          {pathLabel && (
            <div className="text-[11px] font-mono text-purple-400 tracking-widest uppercase mb-1">
              {pathLabel}
            </div>
          )}
          <h2 className="text-xl font-bold text-white">{topic}</h2>
          <p className="text-xs text-slate-400 mt-1">
            Solve all {total} problems · Any order allowed
          </p>
        </div>

        {/* Progress pill */}
        <div className="flex items-center gap-3 rounded-xl border border-[#1e224d] bg-[#0d0e24] px-4 py-2.5">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">
              Progress
            </div>
            <div className="text-sm font-bold text-white">
              {solvedCount} / {total}
            </div>
          </div>
          <div className="w-20 h-2 rounded-full bg-[#1a1d42] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${total > 0 ? (solvedCount / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Problem cards */}
      <div className="grid gap-3">
        {problems.map((problem, idx) => {
          const isClickable = problem.status !== 'locked';
          const cfg = statusConfig[problem.status];

          const cardContent = (
            <div
              className={`
                group relative flex items-center gap-4 rounded-xl border p-4
                transition-all duration-200
                ${cfg.border} ${cfg.bg}
                ${isClickable ? 'hover:border-purple-500/50 hover:bg-[#131535] cursor-pointer' : 'opacity-60'}
              `}
            >
              {/* Index */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black/30 border border-white/5 font-mono text-sm font-bold text-slate-400 group-hover:text-purple-300">
                {String(idx + 1).padStart(2, '0')}
              </div>

              {/* Title + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-semibold text-white truncate">
                    {problem.title}
                  </h3>
                  {problem.difficulty && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                      {problem.difficulty}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>Max {problem.maxScore} pts</span>
                  {problem.solvedAt && (
                    <span className="text-emerald-500/80">
                      Solved {problem.solvedAt}
                    </span>
                  )}
                </div>
              </div>

              {/* Status + arrow */}
              <div className="flex items-center gap-3">
                <StatusBadge status={problem.status} />
                {isClickable && (
                  <svg
                    className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </div>
            </div>
          );

          if (!isClickable) {
            return <div key={problem.id}>{cardContent}</div>;
          }

          return (
            <Link key={problem.id} href={`/round-1/problem/${problem.id}`}>
              {cardContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}