'use client';

import React, { useState } from 'react';
import { Problem, IDEMode, CodeConstraint } from '@/types/problem';
import ProblemStatement from './ProblemStatement';
import ProblemExamples from './ProblemExamples';
import ProblemConstraints from './ProblemConstraints';
import ProblemNavigation from './ProblemNavigation';
import ProblemHiddenOverlay from '@/components/round2/ProblemHiddenOverlay';

interface ProblemPanelProps {
  problem: Problem;
  mode: IDEMode;
  activeConstraints?: CodeConstraint[];
  hideProblemStatement?: boolean;
  prevProblemId: string | null;
  nextProblemId: string | null;
  onNavigate?: (id: string) => void;
  onUseAsInput?: (input: string) => void;
  submissionHistoryChild?: React.ReactNode;
}

export default function ProblemPanel({
  problem,
  mode,
  activeConstraints,
  hideProblemStatement = false,
  prevProblemId,
  nextProblemId,
  onNavigate,
  onUseAsInput,
  submissionHistoryChild,
}: ProblemPanelProps) {
  const [activeTab, setActiveTab] = useState<'statement' | 'examples' | 'constraints' | 'submissions'>('statement');

  const { title, difficulty, points, statement, examples, constraints, timeLimit, memoryLimit } = problem;
  const activeRoundNumber = mode === 'constraint' ? 3 : mode === 'relay' ? 2 : (problem.roundNumber || 1);

  const getDifficultyBadge = () => {
    switch (difficulty) {
      case 'easy':
        return (
          <span className="px-2.5 py-0.5 rounded border border-green-500/20 bg-green-500/5 text-green-400 text-[10px] font-mono font-bold uppercase select-none">
            Easy
          </span>
        );
      case 'hard':
        return (
          <span className="px-2.5 py-0.5 rounded border border-red-500/20 bg-red-500/5 text-red-400 text-[10px] font-mono font-bold uppercase select-none">
            Hard
          </span>
        );
      case 'medium':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded border border-amber-500/20 bg-amber-500/5 text-amber-400 text-[10px] font-mono font-bold uppercase select-none">
            Medium
          </span>
        );
    }
  };

  // Convert points to display text
  const pointsLabel = points ? `+${points} PTS` : '+50 PTS';

  return (
    <div className="flex flex-col h-full bg-[#060610] border-r border-[var(--border)] select-none">
      {/* Header Info */}
      <div className="p-5 border-b border-[var(--border-subtle)] flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center h-6 w-8 rounded bg-purple-500/10 border border-purple-500/30 text-xs font-mono font-bold text-purple-400">
              01
            </span>
            <h2 className="text-sm font-bold font-mono text-white tracking-wide select-text">
              {title}
            </h2>
          </div>
          <div className="flex gap-2">
            {getDifficultyBadge()}
            <span className="px-2.5 py-0.5 rounded border border-green-500/20 bg-green-500/5 text-green-400 text-[10px] font-mono font-bold uppercase">
              {pointsLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-subtle)] bg-[#080814] h-10 select-none">
        {([
          { id: 'statement', label: 'Statement' },
          { id: 'examples', label: 'Examples' },
          { id: 'constraints', label: 'Constraints' },
          { id: 'submissions', label: 'Submissions' },
        ] as const).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
              className={`flex-1 text-center font-mono text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
                isActive
                  ? 'border-purple-500 text-white bg-purple-500/5'
                  : 'border-transparent text-[var(--text-muted)] hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-grow p-5 overflow-y-auto custom-scrollbar">
        {activeTab === 'statement' && (
          hideProblemStatement ? (
            <ProblemHiddenOverlay />
          ) : (
            <ProblemStatement statement={statement} mode={mode} activeConstraints={activeConstraints} />
          )
        )}
        {activeTab === 'examples' && (
          <ProblemExamples examples={examples} onUseAsInput={onUseAsInput} />
        )}
        {activeTab === 'constraints' && (
          <ProblemConstraints
            timeLimit={timeLimit}
            memoryLimit={memoryLimit}
            constraints={constraints}
            mode={mode}
            activeConstraints={activeConstraints}
          />
        )}
        {activeTab === 'submissions' && submissionHistoryChild}
      </div>

      {/* Footer Navigation */}
      <ProblemNavigation
        roundNumber={activeRoundNumber}
        prevProblemId={prevProblemId}
        nextProblemId={nextProblemId}
        onNavigate={onNavigate}
      />
    </div>
  );
}
