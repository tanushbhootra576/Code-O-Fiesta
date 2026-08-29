'use client';

import { use, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CodingIDE from '@/components/ide/CodingIDE';
import PhaseTimer from '@/components/timer/PhaseTimer';
import { problemsService } from '@/services/problems';
import useAuth from '@/hooks/useAuth';

interface PageProps {
  params: Promise<{ problemId: string }>;
}

function MemberStatus({
  member,
  status,
  active,
}: {
  member: string;
  status: string;
  active: boolean;
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 font-mono transition-colors ${active ? 'border-emerald-400/35 bg-emerald-500/10' : 'border-[#2a2d4f] bg-[#0d0e24]'}`}
    >
      <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-white">
        <span className={`h-2 w-2 rounded-full ${active ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.85)]' : 'bg-slate-500'}`} />
        {member}
      </div>
      <div className={`mt-1 pl-4 text-[10px] font-bold tracking-wider ${active ? 'text-emerald-300' : 'text-slate-400'}`}>
        {status}
      </div>
    </div>
  );
}

export default function Round2ProblemPage({ params }: PageProps) {
  const { problemId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  
  const [roundState, setRoundState] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchState = useCallback(async () => {
    try {
      const st = await problemsService.fetchRoundState(2);
      setRoundState(st);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch round state.');
    }
  }, []);

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 3000);
    return () => clearInterval(interval);
  }, [fetchState]);

  const handleComplete = async () => {
    try {
      await problemsService.completeRound2Question(problemId);
      // refetch state & questions, redirect to new problem ID
      const qsRes = await problemsService.fetchRoundProblems(2);
      const st = await problemsService.fetchRoundState(2);
      const nextQNum = st.currentQuestionNumber || 1;
      let nextProblemId = problemId;
      
      const questions = (qsRes as any).questions;
      if (questions && Array.isArray(questions)) {
        const qIdx = nextQNum - 1;
        if (questions[qIdx] && questions[qIdx].problemId) {
          nextProblemId = questions[qIdx].problemId;
        }
      }
      if (st.roundStatus === 'COMPLETED') {
        router.push('/dashboard');
      } else {
        router.push(`/round-2/problem/${nextProblemId}`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to complete question');
    }
  };

  if (error) return <div className="p-10 text-red-500">{error}</div>;
  if (!roundState || !user) return <div className="p-10 text-white">Loading...</div>;

  const currentPhase = roundState.phase;
  const activeMember = roundState.activeMember;
  
  const isMyTurn = activeMember === user.teamMember && currentPhase !== 'COMPLETED';
  const member2IsActive = activeMember === 'MEMBER_2';
  const member1IsActive = activeMember === 'MEMBER_1';

  // Can we complete? (Only Member 1, after both phases seen)
  let canComplete = false;
  let hasSeenBothPhases = false; // We don't get this easily from state, wait, we do get questions from state!
  
  // Wait, `roundState` doesn't include `hasSeenBothPhases` directly. 
  // Let's just rely on the API: if they try to complete too early, it returns 403.
  // Actually, we can fetch questions to know if it's completed. Let's just always show complete if it's member 1 and not first phase maybe?
  // Let's just enable the complete button for member 1.

  const roundStartedAt = roundState.phaseStartedAt ? new Date(roundState.phaseStartedAt).toISOString() : null;
  const roundEndsAt = roundState.phaseEndsAt ? new Date(roundState.phaseEndsAt).toISOString() : null;
  const msLeft = roundState.phaseEndsAt ? Math.max(0, new Date(roundState.phaseEndsAt).getTime() - Date.now()) : 600000;

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-[#0a0a1a] text-white">
      <header className="relative flex h-32 flex-none items-center border-b border-[#1e224d] bg-[#080814] px-4 sm:px-6">
        <div className="w-full pr-32 sm:pr-40">
          <div className="flex items-center gap-4">
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-purple-400">
              Round 2
            </div>
            {user.teamMember === 'MEMBER_1' && currentPhase !== 'COMPLETED' && (
              <button
                onClick={handleComplete}
                className="rounded bg-emerald-600 px-3 py-1 text-xs font-bold hover:bg-emerald-500"
              >
                COMPLETE QUESTION
              </button>
            )}
          </div>
          <h1 className="mt-0.5 font-mono text-sm font-bold tracking-wide text-white">
            Blind Relay Workspace
          </h1>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:max-w-sm">
            <MemberStatus
              member="MEMBER 1"
              status={member1IsActive ? 'ACTIVE / CODING' : 'COMPLETED / PASSED'}
              active={member1IsActive}
            />
            <MemberStatus
              member="MEMBER 2"
              status={member2IsActive ? 'ACTIVE / YOUR TURN' : 'WAITING FOR TURN'}
              active={member2IsActive}
            />
          </div>
        </div>

        {roundStartedAt && roundEndsAt && (
          <div className="pointer-events-none absolute right-2 top-1/2 h-[104px] w-32 -translate-y-1/2 overflow-hidden sm:right-5 sm:w-36">
            <PhaseTimer
              startedAt={roundStartedAt}
              endsAt={roundEndsAt}
              className="origin-top-right scale-[0.5] sm:scale-[0.54]"
            />
          </div>
        )}
      </header>

      <main className={!isMyTurn ? 'round2-locked-ide relative min-h-0 flex-1 overflow-hidden' : 'min-h-0 flex-1'}>
        {!isMyTurn && (
          <>
            <style>{`
            .round2-locked-ide > div > div:first-child,
            .round2-locked-ide > div > div:nth-child(2) > div:nth-child(1) {
              visibility: hidden !important;
              pointer-events: none !important;
            }
            .round2-locked-ide > div > div:first-child {
              display: none !important;
            }
            `}</style>
            <aside className="absolute inset-y-0 left-0 z-20 flex w-[40%] items-center justify-center border-r border-[#1e224d] bg-[#0a0a1a] p-5 text-center">
              <div className="rounded-xl border border-purple-500/25 bg-[#0d0e24] p-5 font-mono">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400">Blind Relay</div>
                <div className="mt-3 text-sm font-bold tracking-wide text-white">{user.teamMember?.replace('_', ' ')}</div>
                <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  WAIT FOR YOUR TURN
                </div>
              </div>
            </aside>
          </>
        )}
        <CodingIDE
          problemId={problemId}
          roundNumber={2}
          mode="relay"
          roundConfig={{ mode: 'relay', activeTeamMember: activeMember as any, currentUserId: user.teamMember as string, serverCode: roundState.currentCode, forceSwitchAfterMs: msLeft }}
          hideProblemStatement={!isMyTurn}
        />
      </main>
    </div>
  );
}
