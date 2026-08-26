'use client';

import React, { useState, use } from 'react';
import CodingIDE from '@/components/ide/CodingIDE';

interface PageProps {
  params: Promise<{ problemId: string }>;
}

export default function Round2ProblemPage({ params }: PageProps) {
  const { problemId } = use(params);
  
  // Interactive Simulator Controls for Testing
  const [currentUser, setCurrentUser] = useState<'member1' | 'member2'>('member1');
  const [activeDriver, setActiveDriver] = useState<'member1' | 'member2'>('member1');

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Simulation Controls Header */}
      <div className="bg-[#0f1026] border-b border-purple-500/30 px-6 py-2.5 flex items-center justify-between text-xs font-mono select-none">
        <div className="flex items-center gap-3">
          <span className="text-purple-400 font-bold uppercase tracking-wider">Simulator Role:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentUser('member1')}
              type="button"
              className={`px-3 py-1 rounded-full border transition-all duration-300 font-bold cursor-pointer ${
                currentUser === 'member1' 
                  ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_8px_rgba(139,92,246,0.3)]' 
                  : 'bg-[#060612] border-purple-500/20 text-purple-300 hover:border-purple-500/40'
              }`}
            >
              I am Member 1
            </button>
            <button
              onClick={() => setCurrentUser('member2')}
              type="button"
              className={`px-3 py-1 rounded-full border transition-all duration-300 font-bold cursor-pointer ${
                currentUser === 'member2' 
                  ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_8px_rgba(139,92,246,0.3)]' 
                  : 'bg-[#060612] border-purple-500/20 text-purple-300 hover:border-purple-500/40'
              }`}
            >
              I am Member 2
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-cyan-400 font-bold uppercase tracking-wider">Active Turn:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveDriver('member1')}
              type="button"
              className={`px-3 py-1 rounded-full border transition-all duration-300 font-bold cursor-pointer ${
                activeDriver === 'member1' 
                  ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_8px_rgba(6,182,212,0.3)]' 
                  : 'bg-[#060612] border-cyan-500/20 text-cyan-300 hover:border-cyan-500/40'
              }`}
            >
              Member 1 Turn
            </button>
            <button
              onClick={() => setActiveDriver('member2')}
              type="button"
              className={`px-3 py-1 rounded-full border transition-all duration-300 font-bold cursor-pointer ${
                activeDriver === 'member2' 
                  ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_8px_rgba(6,182,212,0.3)]' 
                  : 'bg-[#060612] border-cyan-500/20 text-cyan-300 hover:border-cyan-500/40'
              }`}
            >
              Member 2 Turn
            </button>
          </div>
        </div>
      </div>

      {/* Reusable CodingIDE Integration */}
      <div className="flex-grow overflow-hidden">
        <CodingIDE
          problemId={problemId}
          roundNumber={2}
          mode="relay"
          roundConfig={{
            mode: 'relay',
            activeTeamMember: activeDriver,
            currentUserId: currentUser,
            forceSwitchAfterMs: 600_000, // 10 min slot duration
          }}
          hideProblemStatement={currentUser === 'member2'}
          onSolve={(subId) => console.log('Round 2 Solve Callback:', subId)}
        />
      </div>
    </div>
  );
}
