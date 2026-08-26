'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ParticipantLayout from '@/components/layout/ParticipantLayout';
import TopicReveal from '@/components/round1/TopicReveal';
import Round1ProblemList, { Round1Problem } from '@/components/round1/Round1ProblemList';
import { ShapeType } from '@/components/round1/ShapeCard';

// ── Mock data (replace with real service later) ──────────────────────────────
const PATH_TOPICS: Record<number, { shape: ShapeType; topic: string; description: string }> = {
  1: {
    shape: 'triangle',
    topic: 'Basic Math & Numbers',
    description: 'Three problems focused on number theory and arithmetic. Solve them in any order.',
  },
  2: {
    shape: 'circle',
    topic: 'String Manipulation',
    description: 'Three problems focused on strings and character processing. Solve them in any order.',
  },
  3: {
    shape: 'square',
    topic: '1D Arrays & Logic',
    description: 'Three problems focused on arrays and basic algorithmic thinking. Solve them in any order.',
  },
  4: {
    shape: 'star',
    topic: 'Loops & Patterns',
    description: 'Three problems focused on loops and pattern printing. Solve them in any order.',
  },
};

// Temporary mock problems – swap with real data from your service
const MOCK_PROBLEMS: Round1Problem[] = [
  { id: 'r1-p1', title: 'Happy Number',          maxScore: 50, status: 'available', difficulty: 'Easy' },
  { id: 'r1-p2', title: 'First Non-Repeating',   maxScore: 50, status: 'available', difficulty: 'Easy' },
  { id: 'r1-p3', title: 'Move Zeroes',           maxScore: 50, status: 'available', difficulty: 'Medium' },
];

// ── Right sidebar ────────────────────────────────────────────────────────────
function Round1Sidebar({
  topic,
  solvedCount,
  total,
}: {
  topic: string;
  solvedCount: number;
  total: number;
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Overview */}
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
              <div className="text-white font-medium">{total} Problems</div>
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

      {/* Selected domain */}
      <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-5">
        <h3 className="text-xs font-mono tracking-widest text-purple-400 uppercase mb-2">
          YOUR DOMAIN
        </h3>
        <p className="text-white font-semibold">{topic}</p>
        <p className="text-xs text-slate-400 mt-1">
          {solvedCount} of {total} solved
        </p>
      </div>

      {/* Tips */}
      <div className="rounded-2xl border border-[#1e224d] bg-[#0d0e24] p-5">
        <h3 className="text-xs font-mono tracking-widest text-purple-400 uppercase mb-3 flex items-center gap-2">
          💡 TIPS
        </h3>
        <ul className="space-y-2 text-xs text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5">•</span>
            You can solve the problems in any order.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5">•</span>
            Partial progress is saved automatically.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5">•</span>
            Focus on correctness first, then speed.
          </li>
        </ul>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function Round1Page() {
  const router = useRouter();

  // In real app these come from team state / API
  const [selectedPath, setSelectedPath] = useState<number | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  const [problems, setProblems] = useState<Round1Problem[]>(MOCK_PROBLEMS);

  // Simulate loading the team’s locked path (replace with real fetch)
  useEffect(() => {
    // Example: read from localStorage for now so maze → dashboard works
    const stored = localStorage.getItem('cof-round1-path');
    if (stored) {
      const pathId = Number(stored);
      setSelectedPath(pathId);

      // Show reveal only once per session
      const alreadyRevealed = sessionStorage.getItem('cof-round1-revealed');
      if (!alreadyRevealed) {
        setShowReveal(true);
      }
    } else {
      // No path locked yet → send them to the maze
      router.replace('/round-1/maze');
    }
  }, [router]);

  const handleRevealContinue = () => {
    sessionStorage.setItem('cof-round1-revealed', '1');
    setShowReveal(false);
  };

  // Still loading path decision
  if (selectedPath === null) {
    return (
      <ParticipantLayout>
        <div className="flex items-center justify-center min-h-[40vh] text-slate-400 text-sm">
          Loading your path…
        </div>
      </ParticipantLayout>
    );
  }

  const pathInfo = PATH_TOPICS[selectedPath];
  const solvedCount = problems.filter((p) => p.status === 'solved').length;

  return (
    <>
      {/* Topic reveal overlay (shown once after path is locked) */}
      {showReveal && pathInfo && (
        <TopicReveal
          pathId={selectedPath}
          shape={pathInfo.shape}
          topic={pathInfo.topic}
          description={pathInfo.description}
          onContinue={handleRevealContinue}
        />
      )}

      <ParticipantLayout
        rightSidebar={
          <Round1Sidebar
            topic={pathInfo.topic}
            solvedCount={solvedCount}
            total={problems.length}
          />
        }
      >
        {/* Breadcrumb */}
        <div className="mb-5 text-xs text-slate-500 font-mono">
          Dashboard <span className="mx-1.5 text-slate-600">›</span>
          <span className="text-purple-400">Round 1</span>
        </div>

        {/* Round header */}
        <div className="mb-6">
          <div className="text-[11px] font-mono text-purple-400 tracking-widest uppercase mb-1">
            ROUND 1
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            The Maze of Fate
          </h1>
        </div>

        {/* Problem list */}
        <Round1ProblemList
          pathLabel={`PATH ${selectedPath.toString().padStart(2, '0')} · ${pathInfo.shape.toUpperCase()}`}
          topic={pathInfo.topic}
          problems={problems}
        />
      </ParticipantLayout>
    </>
  );
}