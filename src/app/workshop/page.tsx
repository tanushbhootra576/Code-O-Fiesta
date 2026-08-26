'use client';

import React from 'react';
import ParticipantLayout from '@/components/layout/ParticipantLayout';
import EventProgress from '@/components/event/EventProgress';
import EventWaitingScreen from '@/components/event/EventWaitingScreen';
import TeamMembersCard from '@/components/dashboard/TeamMembersCard';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import { useEventState } from '@/hooks/useEventState';
import { buildEventProgressSteps } from '@/lib/eventProgress';

interface GuidelineTopic {
  id: string;
  title: string;
  description: string;
}

const GUIDELINE_TOPICS: GuidelineTopic[] = [
  { id: 'problem-solving', title: 'Problem-Solving Approach', description: 'How to break down a problem before writing any code.' },
  { id: 'io', title: 'Input / Output Handling', description: 'Reading input and formatting output correctly for the judge.' },
  { id: 'math', title: 'Basic Math & Numbers', description: 'Core numeric techniques you’ll need across every round.' },
  { id: 'strings', title: 'String Manipulation', description: 'Working with and transforming text-based input.' },
  { id: 'arrays', title: '1D Arrays & Logic', description: 'Storing, scanning, and reasoning about sequences of values.' },
  { id: 'loops', title: 'Loops & Patterns', description: 'Using iteration to build up repeated structures and results.' },
];

export default function WorkshopPage() {
  const eventState = useEventState();
  const { loading, error, roundEndsAt, refresh } = eventState;

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
        <ErrorState
          variant="connection"
          title="Connection Interrupted"
          message={error}
          onRetry={refresh}
        />
      </ParticipantLayout>
    );
  }

  return (
    <ParticipantLayout>
      <div className="flex flex-col gap-6">
        <EventProgress steps={buildEventProgressSteps(eventState)} />

        {/* Next-round start countdown */}
        <EventWaitingScreen endsAt={roundEndsAt} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Workshop guidelines view */}
          <div className="lg:col-span-8 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-4">
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Workshop Guidelines
              </h2>
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
                45 min kickoff session
              </span>
            </div>

            <p className="text-xs text-[var(--text-secondary)] mb-5 leading-relaxed">
              Before Round 1 begins, the Technical Leads will walk through the fundamentals below.
              No prior competitive programming experience is required.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GUIDELINE_TOPICS.map((topic, index) => (
                <div
                  key={topic.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border-subtle)]"
                >
                  <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--accent-subtle)] border border-[var(--accent-border)] text-[var(--accent)] text-[10px] font-mono font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
                      {topic.title}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)] leading-snug mt-0.5">
                      {topic.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Waiting room */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Waiting Room
                </h3>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                Your whole team should stay on this page. Round 1 unlocks automatically for everyone
                once the workshop timer ends &mdash; no need to refresh.
              </p>
            </div>

            <TeamMembersCard />
          </div>
        </div>
      </div>
    </ParticipantLayout>
  );
}
