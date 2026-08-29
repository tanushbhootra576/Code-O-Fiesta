import React from 'react';
import Link from 'next/link';
import FinalScore from './FinalScore';

interface RoundBreakdown {
  roundNumber: number;
  roundName: string;
  status: string;
  baseScore: number;
  bonusScore: number;
  totalScore: number;
  completedAt: string | null;
  achievements: string[];
}

interface CompletionScreenProps {
  teamName: string;
  members: string[];
  grandTotalScore: number;
  rank: number;
  roundBreakdowns: RoundBreakdown[];
}

export default function CompletionScreen({
  teamName,
  members,
  grandTotalScore,
  rank,
  roundBreakdowns,
}: CompletionScreenProps) {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-4">
      {/* Cinematic Esports Header */}
      <div className="text-center relative py-8 px-4 bg-gradient-to-b from-purple-900/10 via-indigo-950/10 to-transparent border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[#0d0e24]/40 backdrop-blur-sm z-0" />
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center gap-3">
          {/* Trophy Graphic */}
          <div className="w-16 h-16 bg-gradient-to-b from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg relative animate-bounce [animation-duration:3s]">
            <div className="absolute inset-0 bg-yellow-400/30 rounded-2xl blur-lg animate-pulse" />
            <svg className="w-9 h-9 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
          </div>

          <div className="flex flex-col gap-1 mt-2">
            <span className="text-xs font-mono font-black text-purple-400 uppercase tracking-widest animate-pulse">
              — EVENT COMPLETE —
            </span>
            <h1 className="text-4xl sm:text-5xl font-black font-mono tracking-tighter text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-cyan-300">
              CODE-O-FIESTA
            </h1>
          </div>

          {/* Team profile summary */}
          <div className="mt-4 px-6 py-2.5 rounded-full bg-[var(--surface-secondary)] border border-[var(--border)] text-xs font-mono">
            <span className="text-[var(--text-secondary)]">TEAM: </span>
            <strong className="text-white font-extrabold tracking-wide uppercase">{teamName}</strong>
            <span className="text-[var(--text-muted)] mx-2">|</span>
            <span className="text-[var(--text-secondary)]">MEMBERS: </span>
            <strong className="text-white font-extrabold uppercase">{members.join(', ')}</strong>
          </div>
        </div>
      </div>

      {/* Embedded Final Score Section */}
      <FinalScore
        grandTotalScore={grandTotalScore}
        rank={rank}
        roundBreakdowns={roundBreakdowns}
      />

      {/* Big Action Redirect Button */}
      <div className="flex justify-center mt-2">
        <Link
          href="/leaderboard"
          className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg font-mono font-bold text-xs uppercase tracking-widest border border-purple-400/30 hover:border-purple-300/40 shadow-lg shadow-purple-600/20 hover:shadow-purple-600/30 transition-all cursor-pointer flex items-center gap-2 group"
        >
          <span>VIEW LEADERBOARD</span>
          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
