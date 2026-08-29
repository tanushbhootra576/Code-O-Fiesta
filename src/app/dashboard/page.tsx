'use client';

import React from 'react';
import Link from 'next/link';
import AuthGuard from '@/app/guards/AuthGuard';
import ParticipantLayout from '@/components/layout/ParticipantLayout';
import SummaryCard from '@/components/dashboard/SummaryCard';
import TeamOverviewCard from '@/components/dashboard/TeamOverviewCard';
import TeamMembersCard from '@/components/dashboard/TeamMembersCard';
import EventProgress from '@/components/event/EventProgress';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import { useEventState } from '@/hooks/useEventState';
import { buildEventProgressSteps } from '@/lib/eventProgress';

const ROUND_ROUTES: Record<0 | 1 | 2 | 3, string> = {
  0: '/workshop',
  1: '/round-1',
  2: '/round-2',
  3: '/round-3',
};

function DashboardContent() {
  const eventState = useEventState();
  const { loading, error, refresh, currentRound, teamScore, eventStatus } = eventState;

  if (loading) {
    return (
      <ParticipantLayout>
        <LoadingState message="Connecting to event server..." mode="full-page" />
      </ParticipantLayout>
    );
  }

  if (error) {
    return (
      <ParticipantLayout>
        <ErrorState variant="connection" title="Connection Interrupted" message={error} onRetry={refresh} />
      </ParticipantLayout>
    );
  }

  const enterHref = eventStatus === 'COMPLETED' ? '/results' : (ROUND_ROUTES[currentRound] || '/workshop');
  const stageLabel =
    eventStatus === 'COMPLETED' ? 'COMPLETED' : currentRound === 0 ? 'WORKSHOP' : `ROUND 0${currentRound}`;

  return (
    <ParticipantLayout>
      <div className="flex flex-col gap-6">
        {/* Two-column split built locally (not via ParticipantLayout's rightSidebar slot)
            so the Enter Event button below can span full-width under both columns,
            landing at the true bottom of the page regardless of which column is taller. */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <div className="xl:col-span-8 flex flex-col gap-6 min-w-0">
            {/* Header — trophy icon floats freely, no boxed background */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col gap-1 max-w-xl">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
                  Welcome back!
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Team Dashboard</h1>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mt-1">
                  Track your progress, check event status and enter the arena when you&apos;re ready.
                </p>
              </div>

              <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center shrink-0">
                <div className="absolute inset-0 bg-purple-600/20 rounded-full blur-xl animate-pulse" />
                <svg
                  className="relative w-20 h-20 drop-shadow-[0_10px_20px_rgba(139,92,246,0.5)]"
                  viewBox="0 0 100 110"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Big closed loop handles, echoing the classic trophy silhouette */}
                  <path
                    d="M 30 22 C 10 22, 6 42, 16 52 C 21 57, 28 58, 33 55"
                    stroke="#06b6d4"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 70 22 C 90 22, 94 42, 84 52 C 79 57, 72 58, 67 55"
                    stroke="#06b6d4"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Cup body — rounded shoulders tapering to the neck */}
                  <path
                    d="M 26 16 L 74 16 C 74 30, 72 44, 62 54 C 58 58, 54 60, 50 60 C 46 60, 42 58, 38 54 C 28 44, 26 30, 26 16 Z"
                    fill="#8b5cf6"
                  />

                  {/* Star emblem */}
                  <path
                    d="M 50 28 L 53.5 36 L 62 37 L 55.5 42.5 L 57.5 51 L 50 46.5 L 42.5 51 L 44.5 42.5 L 38 37 L 46.5 36 Z"
                    fill="#00f5d4"
                  />

                  {/* Neck */}
                  <rect x="45" y="60" width="10" height="10" fill="#8b5cf6" />

                  {/* Two-tier pedestal base */}
                  <rect x="36" y="70" width="28" height="9" rx="2" fill="#8b5cf6" stroke="#06b6d4" strokeWidth="1.5" />
                  <rect x="26" y="79" width="48" height="11" rx="2" fill="none" stroke="#06b6d4" strokeWidth="2.5" />
                </svg>
              </div>
            </div>

            {/* Current round stage + score */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SummaryCard
                title="CURRENT STAGE"
                value={stageLabel}
                accentColor="purple"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2 1m0 0l-2-1m2 1v2.5M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1m2 1l2-1m-2 1v-2.5M18 18l-2-1m2 1l2-1m-2 1v-2.5"
                    />
                  </svg>
                }
              />

              <SummaryCard
                title="CURRENT SCORE"
                value={`${teamScore} PTS`}
                accentColor="purple"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                }
              />
            </div>

            {/* Progress bar — shared component, driven by real event state */}
            <EventProgress steps={buildEventProgressSteps(eventState)} />
          </div>

          <div className="xl:col-span-4 flex flex-col gap-6">
            <TeamOverviewCard teamId="TEAM_014" joinedAt="10:05:21 PM" rank="—" activityStatus="ACTIVE NOW" />
            <TeamMembersCard />
          </div>
        </div>

        {/* Enter Event action button — full-width, spans below both columns */}
        <Link
          href={enterHref}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-mono font-extrabold uppercase tracking-[0.15em] rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.01] transition-all border border-purple-400/40"
        >
          <span>ENTER EVENT</span>
          <svg className="w-4 h-4 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </ParticipantLayout>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard requiredRole="PARTICIPANT">
      <DashboardContent />
    </AuthGuard>
  );
}
