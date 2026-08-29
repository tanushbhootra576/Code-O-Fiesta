'use client';

import React, { useEffect, useState } from 'react';
import AuthGuard from '@/app/guards/AuthGuard';
import AdminLayout from '@/components/layout/AdminLayout';
import EventStatus from '@/components/event/EventStatus';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminEventControls from '@/components/admin/AdminEventControls';
import AdminRoundStatus from '@/components/admin/AdminRoundStatus';
import AdminTeamTable from '@/components/admin/AdminTeamTable';
import AdminSubmissionTable from '@/components/admin/AdminSubmissionTable';
import AdminLeaderboard from '@/components/admin/AdminLeaderboard';
import AdminNav from '@/components/admin/AdminNav';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import { adminService } from '@/services/admin';
import { leaderboardService } from '@/services/leaderboard';

function AdminContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States
  const [eventStatus, setEventStatus] = useState<'waiting' | 'started' | 'ended'>('waiting');
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [rounds, setRounds] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);

  const fetchAdminData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      // Fetch state
      const stateRes = await adminService.getAdminState();
      setEventStatus(stateRes.status);
      setCurrentRound(stateRes.currentRound);
      setRounds(stateRes.rounds || []);

      // Fetch teams
      const teamsRes = await adminService.getTeams();
      setTeams(teamsRes || []);

      // Fetch submissions
      const subsRes = await adminService.getSubmissions();
      setSubmissions(subsRes || []);

      // Fetch standings
      const standingsRes = await leaderboardService.getLeaderboard();
      setStandings(standingsRes || []);
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      setError('Could not connect to database or fetch administrative telemetry.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData(true);

    // Set up auto-polling every 5 seconds for the admin cockpit
    const interval = setInterval(() => {
      fetchAdminData(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleStartRound = async (roundNumber: number) => {
    try {
      const res = await adminService.startRound(roundNumber);
      if (res.error) alert(res.error);
      await fetchAdminData(false);
    } catch (err) {
      console.error('Error starting round:', err);
    }
  };

  const handleCompleteRound = async (roundNumber: number) => {
    try {
      const res = await adminService.completeRound(roundNumber);
      if (res.error) alert(res.error);
      await fetchAdminData(false);
    } catch (err) {
      console.error('Error completing round:', err);
    }
  };

  const handleAdjustTime = async (roundNumber: number, durationSeconds: number) => {
    try {
      const res = await adminService.overrideRoundDuration(roundNumber, durationSeconds);
      if (res.error) alert(res.error);
      await fetchAdminData(false);
    } catch (err) {
      console.error('Error adjusting duration:', err);
    }
  };

  const handleUpdateStatus = async (teamId: string, status: string) => {
    try {
      const res = await adminService.updateTeamStatus(teamId, status);
      if (res.error) alert(res.error);
      await fetchAdminData(false);
    } catch (err) {
      console.error('Error updating team status:', err);
    }
  };

  const handleOverrideScore = async (teamId: string, roundNumber: number, score: number) => {
    try {
      const res = await adminService.overrideTeamScore(teamId, roundNumber, score);
      if (res.error) alert(res.error);
      await fetchAdminData(false);
    } catch (err) {
      console.error('Error overriding score:', err);
    }
  };

  // Get active round detail
  const activeRound = rounds.find((r) => r.status === 'ACTIVE') || null;
  const activeTeamsCount = teams.filter((t) => t.status === 'ACTIVE').length;

  if (loading) {
    return (
      <AdminLayout title="Organizer Control Panel" nav={<AdminNav />}>
        <LoadingState message="Loading administrative data feeds..." mode="full-page" />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Organizer Control Panel" nav={<AdminNav />}>
        <ErrorState
          title="Administrative Sync Failed"
          message={error}
          onRetry={() => fetchAdminData(true)}
          variant="connection"
        />
      </AdminLayout>
    );
  }

  const isLive = eventStatus === 'started';
  const statusLabel = isLive ? 'Live Event' : eventStatus === 'ended' ? 'Event Ended' : 'Pre-Event Setup';
  const statusType = isLive ? 'ACTIVE' : eventStatus === 'ended' ? 'COMPLETED' : 'READY';

  return (
    <AdminLayout
      title="Organizer Control Panel"
      subtitle="VITC Code-O-Fiesta Live Event Operations"
      nav={<AdminNav />}
      actions={<EventStatus status={statusType} label={statusLabel} />}
    >
      <div className="flex flex-col gap-6">

        {/* Quick telemetry metrics */}
        <AdminDashboard
          totalTeams={teams.length}
          activeTeams={activeTeamsCount}
          totalSubmissions={submissions.length}
          activeRoundNumber={activeRound ? activeRound.roundNumber : currentRound}
          activeRoundName={activeRound ? activeRound.name : 'None'}
        />

        {/* Round execution controls */}
        <AdminEventControls
          rounds={rounds}
          onStartRound={handleStartRound}
          onCompleteRound={handleCompleteRound}
        />

        {/* Timer status if a round is active */}
        <AdminRoundStatus
          activeRound={activeRound}
          activeTeamsCount={activeTeamsCount}
          onAdjustTime={handleAdjustTime}
        />

        {/* Main interactive grids */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

          {/* Teams Directory Table */}
          <div className="xl:col-span-8">
            <AdminTeamTable
              teams={teams}
              onUpdateStatus={handleUpdateStatus}
              onOverrideScore={handleOverrideScore}
            />
          </div>

          {/* Standings list and submissions log queue */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            <AdminLeaderboard standings={standings} />
            <AdminSubmissionTable submissions={submissions} />
          </div>

        </div>

      </div>
    </AdminLayout>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard requiredRole="ADMIN">
      <AdminContent />
    </AuthGuard>
  );
}
