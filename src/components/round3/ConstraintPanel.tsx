import React from 'react';
import { SubmissionResult } from '@/types/submission';

interface ConstraintPanelProps {
  isSolved: boolean;
  submitResult: SubmissionResult | null;
  submissionCount: number;
}

export default function ConstraintPanel({ isSolved, submitResult, submissionCount }: ConstraintPanelProps) {
  const violations = submitResult?.constraintViolations || [];

  // Determine if each bonus is earned/missed
  const isAccepted = submitResult?.status === 'accepted';

  // 1. Ouroboros (30 PTS): Solve using recursion (no loops)
  const ouroborosViolated = violations.some(v => 
    v.constraintId === 'ouroboros' || 
    v.constraintId === 'no-loops' || 
    v.constraintId === 'recursion-required'
  );
  const ouroborosStatus = !isSolved 
    ? 'pending' 
    : (isAccepted && !ouroborosViolated) ? 'earned' : 'missed';

  // 2. Short & Sweet (20 PTS): Solution under line/char threshold
  const shortViolated = violations.some(v => 
    v.constraintId === 'shortAndSweet' || 
    v.constraintId === 'max-lines' || 
    v.constraintId === 'line-count'
  );
  const shortStatus = !isSolved 
    ? 'pending' 
    : (isAccepted && !shortViolated) ? 'earned' : 'missed';

  // 3. One Shot Wonder (40 PTS): Accepted on first submission attempt
  // submissionCount is the count of submissions before this one
  const oneShotStatus = !isSolved 
    ? 'pending' 
    : (isAccepted && submissionCount <= 1) ? 'earned' : 'missed';

  const bonuses = [
    {
      id: 'ouroboros',
      title: 'Ouroboros',
      points: 30,
      description: 'Solve using recursion (no loops allowed).',
      status: ouroborosStatus,
      message: ouroborosViolated ? (violations.find(v => v.constraintId === 'ouroboros' || v.constraintId === 'no-loops' || v.constraintId === 'recursion-required')?.message || 'Loops detected or recursion missing') : ''
    },
    {
      id: 'shortAndSweet',
      title: 'Short & Sweet',
      points: 20,
      description: 'Solve within the character/line threshold.',
      status: shortStatus,
      message: shortViolated ? (violations.find(v => v.constraintId === 'shortAndSweet' || v.constraintId === 'max-lines' || v.constraintId === 'line-count')?.message || 'Code exceeds length threshold') : ''
    },
    {
      id: 'oneShotWonder',
      title: 'One Shot Wonder',
      points: 40,
      description: 'Get the problem accepted on your first attempt.',
      status: oneShotStatus,
      message: submissionCount > 1 ? 'Missed — solved in multiple attempts' : ''
    }
  ];

  return (
    <div className="flex flex-col gap-4 mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
          {isSolved ? 'Bonus Summary' : 'Earn these bonuses'}
        </h3>
        <span className="text-[10px] font-mono text-slate-500 uppercase">
          Crucible Modifiers
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bonuses.map((b) => {
          let cardStyles = 'border-cyan-500/20 bg-cyan-950/5 shadow-[0_0_10px_rgba(6,182,212,0.05)]';
          let statusIndicator = (
            <span className="text-cyan-400 font-mono font-bold text-xs">
              +{b.points} PTS
            </span>
          );

          if (b.status === 'earned') {
            cardStyles = 'border-green-500/30 bg-green-950/10 shadow-[0_0_15px_rgba(34,197,94,0.1)]';
            statusIndicator = (
              <span className="text-green-400 font-mono font-bold text-xs flex items-center gap-1">
                ✓ +{b.points} PTS
              </span>
            );
          } else if (b.status === 'missed') {
            cardStyles = 'border-red-500/20 bg-red-950/5 opacity-60';
            statusIndicator = (
              <span className="text-red-400 font-mono font-bold text-xs flex items-center gap-1 line-through">
                ✗ +{b.points} PTS
              </span>
            );
          }

          return (
            <div
              key={b.id}
              className={`flex flex-col justify-between p-4 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 ${cardStyles}`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-xs font-mono font-bold text-white tracking-wide">
                    {b.title}
                  </h4>
                  {statusIndicator}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                  {b.description}
                </p>
              </div>
              {b.status === 'missed' && b.message && (
                <div className="mt-3 text-[10px] font-mono text-red-400 bg-red-950/20 border border-red-500/10 px-2 py-1 rounded">
                  {b.message}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
