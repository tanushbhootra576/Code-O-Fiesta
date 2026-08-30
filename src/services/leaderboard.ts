import { authService } from './auth';

export const leaderboardService = {
  getLeaderboard: async (): Promise<any> => {
    try {
      const response = await fetch('/api/leaderboard', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch leaderboard');
      }
      
      const backendStandings = Array.isArray(data) ? data : (data.data || []);
      return backendStandings.map((item: any) => {
        let completedRoundsCount = 0;
        const roundDetails = [];
        
        for (let i = 1; i <= 3; i++) {
          const status = item.completionInfo?.[i] || 'NOT_STARTED';
          if (status === 'COMPLETED' || status === 'SOLVED') completedRoundsCount++;
          roundDetails.push({
            roundNumber: i,
            roundName: `Round ${i}`, // fallback, not provided by backend summary
            status: status,
            score: item.roundScores?.[i] || 0,
            completedAt: null
          });
        }
        
        return {
          rank: item.rank,
          teamId: item.teamId,
          name: item.teamName,
          status: item.status || 'ACTIVE',
          totalScore: item.totalScore,
          completedRoundsCount,
          roundDetails
        };
      });
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  },

  getResults: async (): Promise<any> => {
    try {
      // Get current logged in team name
      const me = await authService.getMe();
      if (!me.authenticated || !me.team) {
        return { error: 'Not authenticated or not part of a team' };
      }

      // Fetch from API
      const response = await fetch('/api/results/me', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch results');
      }

      const teamResults = Array.isArray(data) ? data[0] : (data.data || data);

      // We need rank, so let's fetch leaderboard too
      const leaderboard = await leaderboardService.getLeaderboard();
      const matchedStanding = leaderboard.find((s: any) => s.teamId === me.team.id);
      const rank = matchedStanding ? matchedStanding.rank : 0;

      const roundNames = {
        1: 'Maze of Fate',
        2: 'Blind Relay',
        3: 'Constraint Crucible'
      };

      const roundBreakdowns = teamResults.rounds.map((rp: any) => {
        let achievements: string[] = [];
        if (rp.achievements) {
          if (rp.achievements.baseSolve) achievements.push('Problem Solved');
          if (rp.achievements.ouroboros) achievements.push('Ouroboros Mod Passed');
          if (rp.achievements.shortAndSweet) achievements.push('Short & Sweet Passed');
          if (rp.achievements.oneShotWonder) achievements.push('One Shot Wonder');
        }

        return {
          roundNumber: rp.roundNumber,
          roundName: roundNames[rp.roundNumber as keyof typeof roundNames] || `Round ${rp.roundNumber}`,
          status: rp.status || 'PENDING',
          baseScore: rp.score || 0, // Simplified since backend doesn't split base/bonus yet for R1/R2
          bonusScore: 0,
          totalScore: rp.score || 0,
          completedAt: rp.completedAt || null,
          achievements,
        };
      });

      return {
        authenticated: true,
        team: {
          id: me.team.id,
          name: me.team.name,
          status: teamResults.status || 'ACTIVE',
          members: me.team.members, // Return all members since teamMember isn't available
        },
        results: {
          rank,
          grandTotalScore: teamResults.totalScore || 0,
          roundBreakdowns,
        },
      };
    } catch (error: any) {
      console.error('Error fetching results:', error);
      return { error: error.message };
    }
  },
};
