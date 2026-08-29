'use client';

import React, { useEffect, useState } from 'react';
import AuthGuard from '@/app/guards/AuthGuard';
import ParticipantLayout from '@/components/layout/ParticipantLayout';
import EventProgress from '@/components/event/EventProgress';
import Leaderboard from '@/components/results/Leaderboard';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import { leaderboardService } from '@/services/leaderboard';
import { authService } from '@/services/auth';

interface RoundDetail {
  roundNumber: number;
  roundName: string;
  status: string;
  score: number;
  completedAt: string | null;
}

interface StandingTeam {
  rank: number;
  teamId: string;
  name: string;
  status: string;
  totalScore: number;
  completedRoundsCount: number;
  roundDetails: RoundDetail[];
}

function LeaderboardPageContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [standings, setStandings] = useState<StandingTeam[]>([]);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const fetchAuth = async () => {
    try {
      const authRes = await authService.getMe();
      if (authRes.authenticated && authRes.team) {
        setCurrentTeamId(authRes.team.id);
      }
    } catch (err) {
      console.warn('User is browsing anonymously:', err);
    }
  };

  const fetchStandings = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const res = await leaderboardService.getLeaderboard();
      if (res.error) {
        setError(res.error);
        return;
      }

      setStandings(res);
    } catch (err: any) {
      console.error('Error fetching standings:', err);
      setError('Could not establish database connection or load leaderboard.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    const init = async () => {
      await fetchAuth();
      await fetchStandings(true);
    };
    init();

    // Set up auto-polling every 10 seconds
    setIsPolling(true);
    const interval = setInterval(() => {
      fetchStandings(false); // poll silently without full-screen loading spinner
    }, 10000);

    return () => {
      clearInterval(interval);
      setIsPolling(false);
    };
  }, []);

  return (
    <ParticipantLayout>
      <div className="flex flex-col gap-6">
        <EventProgress />

        {/* Live Standings Telemetry Banner */}
        <div className="flex justify-between items-center bg-[#0d0e24] border border-[#1e224d] rounded-xl px-5 py-3 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
              Scoreboard Sync: ACTIVE
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            {isPolling ? 'Auto-syncing standings in real-time...' : 'Standings locked.'}
          </div>
        </div>

        {/* Content Display */}
        {loading ? (
          <LoadingState message="Fetching live event standings..." mode="full-page" />
        ) : error ? (
          <ErrorState
            title="Telemetry Sync Failed"
            message={error}
            onRetry={() => fetchStandings(true)}
            variant="connection"
          />
        ) : (
          <Leaderboard standings={standings} currentUserTeamId={currentTeamId} />
        )}
      </div>
    </ParticipantLayout>
  );
}

export default function LeaderboardPage() {
  return (
    <AuthGuard requiredRole="PARTICIPANT">
      <LeaderboardPageContent />
    </AuthGuard>
  );
}
