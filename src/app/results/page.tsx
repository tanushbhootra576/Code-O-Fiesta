'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/app/guards/AuthGuard';
import ParticipantLayout from '@/components/layout/ParticipantLayout';
import EventProgress from '@/components/event/EventProgress';
import CompletionScreen from '@/components/results/CompletionScreen';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import { leaderboardService } from '@/services/leaderboard';
import { authService } from '@/services/auth';
import { adminService } from '@/services/admin';

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

interface TeamData {
  id: string;
  name: string;
  status: string;
  members: string[];
}

interface ResultsData {
  rank: number;
  grandTotalScore: number;
  roundBreakdowns: RoundBreakdown[];
}

function ResultsPageContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ResultsData | null>(null);
  const [team, setTeam] = useState<TeamData | null>(null);
  const [eventFinished, setEventFinished] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Verify authentication first
      const authRes = await authService.getMe();
      if (!authRes.authenticated) {
        router.push('/login');
        return;
      }

      // Fetch results
      const res = await leaderboardService.getResults();
      if (res.error) {
        setError(res.error);
        return;
      }

      setResults(res.results);
      setTeam(res.team);

      // Fetch overall event state to see if all rounds are completed
      const stateData = await adminService.getAdminState();
      if (stateData && stateData.status === 'ended') {
        setEventFinished(true);
      }
    } catch (err: any) {
      console.error('Error fetching results:', err);
      setError('Could not establish database connection or load results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <ParticipantLayout>
        <div className="flex flex-col gap-6">
          <EventProgress />
          <LoadingState message="Connecting to scoreboard telemetry..." mode="full-page" />
        </div>
      </ParticipantLayout>
    );
  }

  if (error) {
    return (
      <ParticipantLayout>
        <div className="flex flex-col gap-6">
          <EventProgress />
          <ErrorState
            title="Scoreboard Connection Failed"
            message={error}
            onRetry={fetchData}
            variant="connection"
          />
        </div>
      </ParticipantLayout>
    );
  }

  if (!results || !team) {
    return (
      <ParticipantLayout>
        <div className="flex flex-col gap-6">
          <EventProgress />
          <ErrorState
            title="No Data Available"
            message="No results are currently registered for your team."
            onRetry={fetchData}
          />
        </div>
      </ParticipantLayout>
    );
  }

  return (
    <ParticipantLayout>
      <div className="flex flex-col gap-6">
        <EventProgress />

        {/* Live event warning bar if event is not finished yet */}
        {!eventFinished && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-4 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="text-xs font-mono">
              <strong className="uppercase">Competition Live:</strong> Rankings and scores are live-updating and subject to change until the final round concludes.
            </div>
          </div>
        )}

        <CompletionScreen
          teamName={team.name}
          members={team.members}
          grandTotalScore={results.grandTotalScore}
          rank={results.rank}
          roundBreakdowns={results.roundBreakdowns}
        />
      </div>
    </ParticipantLayout>
  );
}

export default function ResultsPage() {
  return (
    <AuthGuard requiredRole="PARTICIPANT">
      <ResultsPageContent />
    </AuthGuard>
  );
}
