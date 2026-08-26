'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ParticipantLayout from '@/components/layout/ParticipantLayout';
import RoundTimer from '@/components/timer/RoundTimer';

interface CrucibleProblem {
  id: string;
  numberStr: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  description: string;
  maxPoints: number;
  status: 'SOLVED' | 'IN_PROGRESS' | 'NOT_STARTED';
  constraintsMet: number;
  totalConstraints: number;
}

const PROBLEMS: CrucibleProblem[] = [
  {
    id: '01',
    numberStr: '01',
    title: 'String Mutation Matrix',
    difficulty: 'MEDIUM',
    description: 'Transform string pairs using recursive transitions and tight line budget.',
    maxPoints: 140,
    status: 'SOLVED',
    constraintsMet: 4,
    totalConstraints: 4,
  },
  {
    id: '02',
    numberStr: '02',
    title: 'Recursive Island Explorer',
    difficulty: 'MEDIUM',
    description: 'Traverse and count interconnected coordinate clusters without loops.',
    maxPoints: 140,
    status: 'IN_PROGRESS',
    constraintsMet: 2,
    totalConstraints: 4,
  },
  {
    id: '03',
    numberStr: '03',
    title: 'Crucible Path Optimizer',
    difficulty: 'HARD',
    description: 'Calculate the minimum cost path with recursion and line limit constraints.',
    maxPoints: 140,
    status: 'NOT_STARTED',
    constraintsMet: 0,
    totalConstraints: 4,
  },
];

export default function Round3DashboardPage() {
  const totalRoundScore = 140;
  const maxRoundScore = 420;
  const solvedCount = 1;
  const totalProblems = 3;

  // Round 3 active 60-minute duration window persisted across navigation
  const [timerEndAt, setTimerEndAt] = useState<number | null>(null);
  const [timerStartAt, setTimerStartAt] = useState<number | null>(null);

  useEffect(() => {
    try {
      const storedStart = typeof window !== 'undefined' ? localStorage.getItem('cof_round_3_start_at') : null;
      const storedEnd = typeof window !== 'undefined' ? localStorage.getItem('cof_round_3_end_at') : null;

      if (storedStart && storedEnd) {
        setTimerStartAt(Number(storedStart));
        setTimerEndAt(Number(storedEnd));
      } else {
        const now = Date.now();
        const end = now + 60 * 60 * 1000; // 60 minutes duration
        if (typeof window !== 'undefined') {
          localStorage.setItem('cof_round_3_start_at', String(now));
          localStorage.setItem('cof_round_3_end_at', String(end));
        }
        setTimerStartAt(now);
        setTimerEndAt(end);
      }
    } catch {
      const now = Date.now();
      setTimerStartAt(now);
      setTimerEndAt(now + 60 * 60 * 1000);
    }
  }, []);

  const rightSidebar = (
    <div className="flex flex-col gap-6">
      {/* 1. Round Timer Card using official RoundTimer component */}
      <div className="bg-[#0d0e24] border border-[#1e224d] rounded-xl p-5 shadow-sm relative overflow-hidden flex flex-col items-center">
        {/* Faded Background Clockwork Radial Watermark */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 opacity-15 pointer-events-none flex items-center justify-center">
          <svg className="w-full h-full text-cyan-400" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
            <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="1" />
            <line x1="50" y1="50" x2="50" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="50" y1="50" x2="72" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <div className="relative z-10 w-full flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-3 pb-2 border-b border-[#1e224d]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ROUND TIMER
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#121433] text-cyan-400 border border-[#212659] font-bold">
              60:00
            </span>
          </div>

          <RoundTimer
            startedAt={timerStartAt}
            endsAt={timerEndAt}
            label="ROUND TIME REMAINING"
          />
        </div>
      </div>

      {/* 2. Round Info Card */}
      <div className="bg-[#0d0e24] border border-[#1e224d] rounded-xl p-5 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1e224d]">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            ROUND INFO
          </h3>
        </div>

        <div className="flex flex-col gap-3 font-mono text-xs">
          <div className="flex items-center justify-between py-1">
            <span className="text-slate-400 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Round
            </span>
            <span className="font-bold text-white">3 / 3 (Final)</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-400 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Duration
            </span>
            <span className="font-bold text-white">60 Minutes</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-400 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Problems
            </span>
            <span className="font-bold text-white">3 Problems</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-400 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              Solve Order
            </span>
            <span className="font-bold text-cyan-400">Any Order</span>
          </div>

          <div className="flex items-center justify-between py-1 border-t border-[#1e224d] pt-2">
            <span className="text-slate-400 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9v2a6 6 0 006 6v3m0 0H8m4 0h4m-4-9a4 4 0 01-4-4V3h8v5a4 4 0 01-4 4zM6 5H4a2 2 0 00-2 2v1a4 4 0 004 4h2M18 5h2a2 2 0 012 2v1a4 4 0 01-4 4h-2" />
              </svg>
              Max Score
            </span>
            <span className="font-bold text-amber-300">420 Points</span>
          </div>
        </div>
      </div>

      {/* 3. Round Rules Card with Faded Crucible Target Background */}
      <div className="bg-[#0d0e24] border border-[#1e224d] rounded-xl p-5 shadow-sm relative overflow-hidden">
        {/* Faded Background Target Graphic */}
        <div className="absolute -right-3 -bottom-3 w-40 h-40 opacity-20 pointer-events-none flex items-center justify-center">
          <svg className="w-full h-full text-purple-400" viewBox="0 0 140 140" fill="none">
            {/* Concentric Crucible Target Rings */}
            <circle cx="70" cy="70" r="60" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" />
            <circle cx="70" cy="70" r="44" stroke="#06b6d4" strokeWidth="2" opacity="0.8" />
            <circle cx="70" cy="70" r="28" stroke="#a855f7" strokeWidth="2.5" />
            <circle cx="70" cy="70" r="12" fill="rgba(6, 182, 212, 0.4)" stroke="#06b6d4" strokeWidth="2" />
            {/* Angled Energy Arrow */}
            <path
              d="M 120 20 L 70 70"
              stroke="#c084fc"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Arrowhead */}
            <path
              d="M 106 18 L 122 18 L 122 34"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Crosshair Ticks */}
            <line x1="70" y1="6" x2="70" y2="16" stroke="#8b5cf6" strokeWidth="1.5" />
            <line x1="70" y1="124" x2="70" y2="134" stroke="#8b5cf6" strokeWidth="1.5" />
            <line x1="6" y1="70" x2="16" y2="70" stroke="#8b5cf6" strokeWidth="1.5" />
            <line x1="124" y1="70" x2="134" y2="70" stroke="#8b5cf6" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1e224d]">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              CRUCIBLE RULES
            </h3>
          </div>

          <ul className="flex flex-col gap-2 text-xs text-slate-300 font-sans max-w-[210px]">
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">•</span>
              <span>Solve all 3 problems in any order.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">•</span>
              <span>Base solve yields 50 points per problem.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">•</span>
              <span><strong>Ouroboros (+30 pts):</strong> Recursion only, strictly no loops.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">•</span>
              <span><strong>Short & Sweet (+20 pts):</strong> 30 lines of code or fewer.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">•</span>
              <span><strong>One-Shot Wonder (+40 pts):</strong> 1st attempt solve only.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">•</span>
              <span>Maximum potential: 140 pts/problem, 420 pts total.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <ParticipantLayout rightSidebar={rightSidebar}>
      <div className="flex flex-col gap-6">
        {/* Breadcrumb navigation */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Link href="/dashboard" className="hover:text-purple-300 transition-colors">
            Dashboard
          </Link>
          <span>&gt;</span>
          <span className="text-purple-400 font-semibold">Round 3</span>
        </div>

        {/* Hero Header Banner */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0d0e24] via-[#121438] to-[#0d0e24] border border-[#1e224d] p-6 lg:p-8">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-2 max-w-xl">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-purple-400">
                ROUND 3
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-mono tracking-tight text-white uppercase">
                THE CONSTRAINT CRUCIBLE
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                Conquer the crucible by solving challenges under restrictive modifiers. Stack constraints simultaneously to earn maximum points and surge up the leaderboard.
              </p>
            </div>

            {/* Neon Crucible Energy Core Graphic */}
            <div className="relative flex-shrink-0 w-44 h-36 flex items-center justify-center">
              {/* Outer Radiant Glow */}
              <div className="absolute inset-0 bg-purple-600/25 blur-2xl rounded-full" />

              {/* High-Tech Crucible Reactor Graphic */}
              <svg className="w-36 h-36 relative z-10" viewBox="0 0 160 160" fill="none">
                <defs>
                  <linearGradient id="reactorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                  <linearGradient id="flameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="50%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#ffffff" />
                  </linearGradient>
                  <filter id="reactorGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Outer Hexagonal Shield */}
                <polygon
                  points="80,15 135,45 135,115 80,145 25,115 25,45"
                  stroke="#212659"
                  strokeWidth="2"
                  fill="rgba(13, 14, 36, 0.7)"
                />

                {/* Outer Orbiting Energy Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="56"
                  stroke="url(#reactorGrad)"
                  strokeWidth="2"
                  strokeDasharray="8 6"
                  className="animate-spin-slow"
                  filter="url(#reactorGlow)"
                  opacity="0.85"
                />

                {/* Inner Hexagon Core */}
                <polygon
                  points="80,34 118,56 118,104 80,126 42,104 42,56"
                  stroke="#a855f7"
                  strokeWidth="2"
                  fill="rgba(139, 92, 246, 0.12)"
                  filter="url(#reactorGlow)"
                />

                {/* Inner Rotating Diamond Grid */}
                <polygon
                  points="80,48 108,80 80,112 52,80"
                  stroke="#06b6d4"
                  strokeWidth="1.5"
                  fill="none"
                />

                {/* Central Crucible Plasma Flame */}
                <path
                  d="M 80 52 C 86 64 96 74 94 88 C 92 100 82 108 80 108 C 78 108 68 100 66 88 C 64 74 74 64 80 52 Z"
                  fill="url(#flameGrad)"
                  filter="url(#reactorGlow)"
                />

                {/* Core Spark Node */}
                <circle cx="80" cy="84" r="4.5" fill="#ffffff" filter="url(#reactorGlow)" />

                {/* Orbital Particle Nodes */}
                <circle cx="80" cy="24" r="3" fill="#06b6d4" filter="url(#reactorGlow)" />
                <circle cx="136" cy="80" r="3" fill="#c084fc" filter="url(#reactorGlow)" />
                <circle cx="80" cy="136" r="3" fill="#06b6d4" filter="url(#reactorGlow)" />
                <circle cx="24" cy="80" r="3" fill="#c084fc" filter="url(#reactorGlow)" />
              </svg>
            </div>
          </div>
        </div>

        {/* Crucible Protocol & Active Modifiers Card with Faded Background Matrix */}
        <div className="bg-[#0d0e24] border border-[#1e224d] rounded-xl p-6 shadow-sm relative overflow-hidden">
          {/* Faded Background Blueprint Watermark */}
          <div className="absolute right-0 top-0 bottom-0 w-64 opacity-10 pointer-events-none flex items-center justify-end overflow-hidden">
            <svg className="w-64 h-64 text-purple-400" viewBox="0 0 200 200" fill="none">
              <polygon points="100,20 180,60 180,140 100,180 20,140 20,60" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 6" />
              <polygon points="100,45 155,75 155,125 100,155 45,125 45,75" stroke="#06b6d4" strokeWidth="1.5" />
              <circle cx="100" cy="100" r="35" stroke="currentColor" strokeWidth="1" />
              <circle cx="100" cy="100" r="15" fill="currentColor" opacity="0.3" />
            </svg>
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Active Protocol Badge */}
            <div className="lg:col-span-4 flex items-center gap-4 lg:border-r lg:border-[#1e224d] lg:pr-6">
              <div className="p-3.5 rounded-xl bg-purple-600/10 border border-purple-500/30 flex-shrink-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                  ACTIVE MODE
                </span>
                <h3 className="text-lg font-mono font-extrabold text-white tracking-wide">
                  CRUCIBLE PROTOCOL
                </h3>
                <span className="inline-block mt-0.5 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                  ALL MODIFIERS ACTIVE
                </span>
              </div>
            </div>

            {/* Right: 4 Modifier Badges Summary */}
            <div className="lg:col-span-8">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2">
                CRUCIBLE MODIFIERS STACK
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* 1. Base Solve */}
                <div className="p-2.5 rounded-lg bg-[#121433] border border-[#1f2452]">
                  <div className="text-[10px] font-mono text-emerald-400 font-bold">Base Solve</div>
                  <div className="text-sm font-mono font-extrabold text-white mt-0.5">+50 PTS</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Solve problem</div>
                </div>

                {/* 2. The Ouroboros */}
                <div className="p-2.5 rounded-lg bg-[#121433] border border-[#1f2452]">
                  <div className="text-[10px] font-mono text-purple-400 font-bold">The Ouroboros</div>
                  <div className="text-sm font-mono font-extrabold text-white mt-0.5">+30 PTS</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Recursion only</div>
                </div>

                {/* 3. Short & Sweet */}
                <div className="p-2.5 rounded-lg bg-[#121433] border border-[#1f2452]">
                  <div className="text-[10px] font-mono text-cyan-400 font-bold">Short & Sweet</div>
                  <div className="text-sm font-mono font-extrabold text-white mt-0.5">+20 PTS</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">≤ 30 lines</div>
                </div>

                {/* 4. One-Shot Wonder */}
                <div className="p-2.5 rounded-lg bg-[#121433] border border-[#1f2452]">
                  <div className="text-[10px] font-mono text-amber-400 font-bold">One-Shot</div>
                  <div className="text-sm font-mono font-extrabold text-white mt-0.5">+40 PTS</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">1st attempt only</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Problems Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              PROBLEMS (Solve in any order)
            </h2>
            <span className="text-[11px] font-mono text-slate-400">
              Max potential: 140 PTS / problem
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {PROBLEMS.map((problem) => {
              const isSolved = problem.status === 'SOLVED';
              const isInProgress = problem.status === 'IN_PROGRESS';

              return (
                <Link
                  key={problem.id}
                  href={`/round-3/problem/${problem.id}`}
                  className="bg-[#0d0e24] hover:bg-[#121435] border border-[#1e224d] hover:border-purple-500/50 rounded-xl p-4 sm:p-5 transition-all shadow-sm group flex items-center justify-between gap-4"
                >
                  {/* Left: Problem Number & Title */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#121433] border border-[#212659] flex items-center justify-center font-mono font-extrabold text-sm text-purple-300 flex-shrink-0 group-hover:border-purple-400/50 group-hover:text-white transition-colors">
                      {problem.numberStr}
                    </div>

                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm text-white group-hover:text-purple-300 transition-colors truncate">
                          {problem.title}
                        </span>
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${problem.difficulty === 'EASY'
                              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                              : problem.difficulty === 'MEDIUM'
                                ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
                                : 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                            }`}
                        >
                          {problem.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-sans truncate">
                        {problem.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Point Value & Status Badge */}
                  <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
                    <div className="hidden sm:flex flex-col items-end text-right">
                      <span className="text-xs font-mono font-extrabold text-emerald-400">
                        +{problem.maxPoints} PTS MAX
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {problem.constraintsMet}/{problem.totalConstraints} constraints
                      </span>
                    </div>

                    {/* Status Pill */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${isSolved
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : isInProgress
                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                              : 'bg-[#121433] text-slate-400 border-[#212659]'
                          }`}
                      >
                        {isSolved && (
                          <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {isInProgress && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        )}
                        {problem.status.replace('_', ' ')}
                      </span>

                      {/* Arrow */}
                      <span className="text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Score & Progress Status Bar with Faded Trophy Emblem */}
        <div className="bg-[#0d0e24] border border-[#1e224d] rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
          {/* Faded Background Trophy Watermark */}
          <div className="absolute right-36 -top-4 w-28 h-28 opacity-10 pointer-events-none flex items-center justify-center">
            <svg className="w-full h-full text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 9v2a6 6 0 006 6v3m0 0H8m4 0h4m-4-9a4 4 0 01-4-4V3h8v5a4 4 0 01-4 4zM6 5H4a2 2 0 00-2 2v1a4 4 0 004 4h2M18 5h2a2 2 0 012 2v1a4 4 0 01-4 4h-2" />
            </svg>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-600/10 border border-purple-500/30 text-purple-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9v2a6 6 0 006 6v3m0 0H8m4 0h4m-4-9a4 4 0 01-4-4V3h8v5a4 4 0 01-4 4zM6 5H4a2 2 0 00-2 2v1a4 4 0 004 4h2M18 5h2a2 2 0 012 2v1a4 4 0 01-4 4h-2" />
              </svg>
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                SCORE IN THIS ROUND
              </div>
              <div className="text-lg font-mono font-extrabold text-white">
                <span className="text-purple-400">{totalRoundScore}</span> / {maxRoundScore} PTS
              </div>
            </div>
          </div>

          {/* Progress bar & constraints metric */}
          <div className="relative z-10 flex flex-col sm:items-end gap-1.5 w-full sm:w-auto min-w-[220px]">
            <div className="flex items-center justify-between sm:justify-end gap-3 text-xs font-mono">
              <span className="text-slate-400 uppercase text-[10px]">PROGRESS</span>
              <span className="font-extrabold text-white">{solvedCount} / {totalProblems} SOLVED</span>
            </div>
            <div className="w-full sm:w-48 h-2 bg-[#090a1a] rounded-full overflow-hidden border border-[#212659]">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-cyan-400 rounded-full"
                style={{ width: `${Math.round((solvedCount / totalProblems) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-4 pt-4 border-t border-[#141738] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-slate-500">
          <div>© 2025 Code-O-Fiesta | VIT Chennai - CodeChef Student Chapter</div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>|</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Use</span>
            <span>|</span>
            <span className="hover:text-slate-400 cursor-pointer">Contact Us</span>
          </div>
        </footer>
      </div>
    </ParticipantLayout>
  );
}
