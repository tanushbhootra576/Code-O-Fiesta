'use client';

import { use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import CodingIDE from '@/components/ide/CodingIDE';
import PhaseTimer from '@/components/timer/PhaseTimer';
import { useEventState } from '@/hooks/useEventState';

interface PageProps {
  params: Promise<{ problemId: string }>;
}

function MemberStatus({
  member,
  status,
  active,
  href,
}: {
  member: string;
  status: string;
  active: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-lg border px-3 py-2 font-mono transition-colors hover:border-purple-400/60 focus:outline-none focus:ring-1 focus:ring-purple-400 ${active ? 'border-emerald-400/35 bg-emerald-500/10' : 'border-[#2a2d4f] bg-[#0d0e24]'}`}
    >
      <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-white">
        <span className={`h-2 w-2 rounded-full ${active ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.85)]' : 'bg-slate-500'}`} />
        {member}
      </div>
      <div className={`mt-1 pl-4 text-[10px] font-bold tracking-wider ${active ? 'text-emerald-300' : 'text-slate-400'}`}>
        {status}
      </div>
    </Link>
  );
}

export default function Round2ProblemPage({ params }: PageProps) {
  const { problemId } = use(params);
  const searchParams = useSearchParams();
  const isMember2View = searchParams.get('member')?.toLowerCase() === 'member2';
  const { currentRound, currentPhase, activeMember, roundStartedAt, roundEndsAt } = useEventState();
  const member2IsActive = currentRound === 2 && currentPhase === 'MEMBER_2' && activeMember === 'MEMBER_2';

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-[#0a0a1a] text-white">
      <header className="relative flex h-32 flex-none items-center border-b border-[#1e224d] bg-[#080814] px-4 sm:px-6">
        <div className="w-full pr-32 sm:pr-40">
          <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-purple-400">
            Round 2
          </div>
          <h1 className="mt-0.5 font-mono text-sm font-bold tracking-wide text-white">
            Blind Relay Workspace
          </h1>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:max-w-sm">
            <MemberStatus
              member="MEMBER 1"
              status={member2IsActive ? 'COMPLETED / PASSED' : 'ACTIVE / CODING'}
              active={!member2IsActive}
              href={`/round-2/problem/${problemId}?member=member1`}
            />
            <MemberStatus
              member="MEMBER 2"
              status={member2IsActive ? 'ACTIVE / YOUR TURN' : 'WAITING FOR TURN'}
              active={member2IsActive}
              href={`/round-2/problem/${problemId}?member=member2`}
            />
          </div>
        </div>

        <div className="pointer-events-none absolute right-2 top-1/2 h-[104px] w-32 -translate-y-1/2 overflow-hidden sm:right-5 sm:w-36">
          <PhaseTimer
            startedAt={roundStartedAt}
            endsAt={roundEndsAt}
            className="origin-top-right scale-[0.5] sm:scale-[0.54]"
          />
        </div>
      </header>

      <main className={isMember2View ? 'round2-member2-ide relative min-h-0 flex-1 overflow-hidden' : 'min-h-0 flex-1'}>
        {isMember2View && (
          <>
            <style>{`
            .round2-member2-ide > div > div:first-child,
            .round2-member2-ide > div > div:nth-child(2) > div:nth-child(1) {
              visibility: hidden !important;
              pointer-events: none !important;
            }
            .round2-member2-ide > div > div:first-child {
              display: none !important;
            }
            `}</style>
            <aside className="absolute inset-y-0 left-0 z-20 flex w-[40%] items-center justify-center border-r border-[#1e224d] bg-[#0a0a1a] p-5 text-center">
              <div className="rounded-xl border border-purple-500/25 bg-[#0d0e24] p-5 font-mono">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400">Blind Relay</div>
                <div className="mt-3 text-sm font-bold tracking-wide text-white">MEMBER 2</div>
                <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  {member2IsActive ? 'YOUR TURN' : 'WAIT FOR YOUR TURN'}
                </div>
              </div>
            </aside>
          </>
        )}
        <CodingIDE
          problemId={problemId}
          roundNumber={2}
          mode="relay"
          roundConfig={{ mode: 'relay' }}
          hideProblemStatement={isMember2View}
        />
      </main>
    </div>
  );
}
