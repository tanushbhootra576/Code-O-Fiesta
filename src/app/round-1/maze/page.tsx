'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ParticipantLayout from '@/components/layout/ParticipantLayout';
import Maze from '@/components/round1/Maze';

// Right sidebar content matching the screenshot
function Round1Overview() {
  return (
    <div className="flex flex-col gap-5">
      {/* Overview card */}
      <div className="rounded-2xl border border-[#1e224d] bg-[#0d0e24] p-5">
        <h3 className="text-xs font-mono tracking-widest text-purple-400 uppercase mb-4">
          ROUND 1 OVERVIEW
        </h3>
        <ul className="space-y-3 text-sm">
          <li className="flex items-center gap-3">
            <span className="text-purple-400">📋</span>
            <div>
              <div className="text-slate-400 text-xs">Round Name</div>
              <div className="text-white font-medium">The Maze of Fate</div>
            </div>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-cyan-400">⏱</span>
            <div>
              <div className="text-slate-400 text-xs">Duration</div>
              <div className="text-white font-medium">60 Minutes</div>
            </div>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-yellow-400">★</span>
            <div>
              <div className="text-slate-400 text-xs">Problems</div>
              <div className="text-white font-medium">3 Problems</div>
            </div>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-pink-400">↕</span>
            <div>
              <div className="text-slate-400 text-xs">Solve Order</div>
              <div className="text-white font-medium">Any Order</div>
            </div>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-emerald-400">★</span>
            <div>
              <div className="text-slate-400 text-xs">Max Score</div>
              <div className="text-white font-medium">150 Points</div>
            </div>
          </li>
        </ul>
      </div>

      {/* How it works */}
      <div className="rounded-2xl border border-[#1e224d] bg-[#0d0e24] p-5">
        <h3 className="text-xs font-mono tracking-widest text-purple-400 uppercase mb-4">
          HOW IT WORKS
        </h3>
        <ol className="space-y-3 text-sm text-slate-300">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs font-bold text-purple-300">1</span>
            <span>Choose one of the four paths.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs font-bold text-purple-300">2</span>
            <span>Confirm your choice to reveal the domain/topic.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs font-bold text-purple-300">3</span>
            <span>Solve 3 problems in any order.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs font-bold text-purple-300">4</span>
            <span>Maximize your score and complete the round!</span>
          </li>
        </ol>
      </div>

      {/* Tips */}
      <div className="rounded-2xl border border-[#1e224d] bg-[#0d0e24] p-5">
        <h3 className="text-xs font-mono tracking-widest text-purple-400 uppercase mb-3 flex items-center gap-2">
          <span>💡</span> TIPS
        </h3>
        <ul className="space-y-2 text-xs text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5">•</span>
            Think before you choose.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5">•</span>
            Every path is unique.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5">•</span>
            All paths are challenging.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5">•</span>
            Do your best and conquer!
          </li>
        </ul>
      </div>
    </div>
  );
}

export default function Round1MazePage() {
  const router = useRouter();

  const handlePathConfirmed = (pathId: number) => {
  // Persist the choice (later this becomes an API call)
  localStorage.setItem('cof-round1-path', String(pathId));
  sessionStorage.removeItem('cof-round1-revealed'); // so reveal shows again
  router.push('/round-1');
};

  return (
    <ParticipantLayout rightSidebar={<Round1Overview />}>
      {/* Breadcrumb */}
      <div className="mb-4 text-xs text-slate-500 font-mono">
        Dashboard <span className="mx-1.5 text-slate-600">›</span>
        Round 1 <span className="mx-1.5 text-slate-600">›</span>
        <span className="text-purple-400">Maze of Fate</span>
      </div>

      <Maze onPathConfirmed={handlePathConfirmed} />
    </ParticipantLayout>
  );
}