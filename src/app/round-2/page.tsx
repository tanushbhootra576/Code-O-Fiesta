'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/app/guards/AuthGuard';
import ParticipantLayout from '@/components/layout/ParticipantLayout';
import RelayInstructions from '@/components/round2/RelayInstructions';
import { problemsService } from '@/services/problems';

function Round2PageContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleEnterRound = async () => {
    try {
      setLoading(true);
      // Start the round
      await problemsService.startRound(2);
      
      // Fetch current state
      const stateRes = await problemsService.fetchRoundState(2);
      const qNum = stateRes.currentQuestionNumber || 1;
      
      // Fetch questions
      const qsRes = await problemsService.fetchRoundProblems(2);
      let problemId = 'prob-1'; // fallback
      
      const questions = (qsRes as any).questions;
      if (questions && Array.isArray(questions)) {
        const qIdx = qNum - 1;
        if (questions[qIdx] && questions[qIdx].problemId) {
          problemId = questions[qIdx].problemId;
        } else if (questions[0] && questions[0].problemId) {
          problemId = questions[0].problemId;
        }
      }
      
      router.push(`/round-2/problem/${problemId}`);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <ParticipantLayout>
      <style>{`
        a[href="/round-2"] > span:last-child {
          background: rgba(16, 185, 129, 0.2) !important;
          border: 1px solid rgba(16, 185, 129, 0.3) !important;
          color: transparent !important;
          font-size: 0 !important;
        }
        a[href="/round-2"] > span:last-child::after {
          content: 'ACTIVE';
          color: rgb(52, 211, 153);
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 9px;
        }
        .round2-instructions > div {
          box-shadow: none !important;
        }
      `}</style>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="text-xs font-mono text-slate-500">
          Dashboard <span className="mx-1.5 text-slate-700">›</span>
          <span className="text-purple-400">Round 2</span>
        </div>

        <section className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-[#0d0e24] px-6 py-8 sm:px-9 sm:py-10">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-purple-600/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-[10px] font-mono font-bold tracking-[0.2em] text-purple-300">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
              ROUND 2
            </div>
            <h1 className="font-mono text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Blind Relay
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
              Build a solution together in a fast-paced relay challenge. Open the workspace to view the assigned problem and use the existing coding environment.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3 text-xs font-mono">
              <span className="rounded-lg border border-cyan-500/25 bg-cyan-500/10 px-3 py-2 text-cyan-300">
                Shared workspace
              </span>
              <span className="rounded-lg border border-purple-500/25 bg-purple-500/10 px-3 py-2 text-purple-300">
                Problem + editor
              </span>
            </div>

            <button
              onClick={handleEnterRound}
              disabled={loading}
              className="mt-8 inline-flex items-center gap-2 rounded-lg border border-purple-400/50 bg-purple-600 px-5 py-3 text-xs font-mono font-bold tracking-wider text-white shadow-lg shadow-purple-900/30 transition hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-[#0d0e24] disabled:opacity-50"
            >
              {loading ? 'STARTING...' : 'ENTER ROUND 2'}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>

        <div className="round2-instructions">
          <RelayInstructions />
        </div>
      </div>
    </ParticipantLayout>
  );
}

export default function Round2Page() {
  return (
    <AuthGuard requiredRole="PARTICIPANT">
      <Round2PageContent />
    </AuthGuard>
  );
}

