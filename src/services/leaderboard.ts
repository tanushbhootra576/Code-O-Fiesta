import { authService } from './auth';

// Standings interface
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

function getSortedStandings(): StandingTeam[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const stateStr = window.localStorage.getItem('cof_admin_state');
  if (!stateStr) {
    return [];
  }

  try {
    const state = JSON.parse(stateStr);
    const teams = state.teams || [];

    const leaderboardData = teams.map((team: any) => {
      let completedRoundsCount = 0;
      let latestCompletionTime = 0;

      const roundDetails = team.roundProgress.map((rp: any) => {
        if (rp.status === 'COMPLETED') {
          completedRoundsCount++;
          // For mocking tie-break timestamps, default to round completion order
          latestCompletionTime += rp.roundNumber * 10000;
        }
        return {
          roundNumber: rp.roundNumber,
          roundName: rp.roundName,
          status: rp.status,
          score: rp.score || 0,
          completedAt: rp.status === 'COMPLETED' ? new Date().toISOString() : null,
        };
      });

      return {
        teamId: team.id,
        name: team.name,
        status: team.status,
        totalScore: team.totalScore,
        completedRoundsCount,
        latestCompletionTime: latestCompletionTime || Infinity,
        roundDetails,
      };
    });

    // Sort:
    // 1. ACTIVE/COMPLETED first, DISQUALIFIED last
    // 2. Score desc
    // 3. Completed rounds count desc
    // 4. completion time asc
    leaderboardData.sort((a: any, b: any) => {
      const statusA = a.status === 'DISQUALIFIED' ? 1 : 0;
      const statusB = b.status === 'DISQUALIFIED' ? 1 : 0;
      if (statusA !== statusB) return statusA - statusB;

      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (b.completedRoundsCount !== a.completedRoundsCount) return b.completedRoundsCount - a.completedRoundsCount;
      return a.latestCompletionTime - b.latestCompletionTime;
    });

    return leaderboardData.map((team: any, index: number) => ({
      rank: index + 1,
      ...team,
    }));
  } catch {
    return [];
  }
}

export const leaderboardService = {
  getLeaderboard: async (): Promise<any> => {
    // Simulate slight delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return getSortedStandings();
  },

  getResults: async (): Promise<any> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    // Get current logged in team name
    const me = await authService.getMe();
    const activeTeamName = me.authenticated && me.team ? me.team.name : 'TEAM_014';

    const standings = getSortedStandings();
    const matchedStanding = standings.find((s) => s.name === activeTeamName);
    const rank = matchedStanding ? matchedStanding.rank : 4;

    const stateStr = typeof window !== 'undefined' ? window.localStorage.getItem('cof_admin_state') : null;
    let teamData: any = null;

    if (stateStr) {
      const state = JSON.parse(stateStr);
      teamData = state.teams.find((t: any) => t.name === activeTeamName);
    }

    // Default mock results if state not initialized
    const scoreVal = teamData ? teamData.totalScore : 120;
    const progress = teamData ? teamData.roundProgress : [
      { roundNumber: 1, roundName: 'Maze of Fate', status: 'COMPLETED', score: 120 },
      { roundNumber: 2, roundName: 'Blind Relay', status: 'IN_PROGRESS', score: 0 },
      { roundNumber: 3, roundName: 'Constraint Crucible', status: 'NOT_STARTED', score: 0 },
    ];

    const roundBreakdowns = progress.map((rp: any) => {
      let achievements: string[] = [];
      if (rp.roundNumber === 1 && rp.status === 'COMPLETED') {
        achievements.push('Path Chosen: CIRCLE');
        achievements.push('Topic: STRING MANIPULATION');
      } else if (rp.roundNumber === 2 && rp.status === 'COMPLETED') {
        achievements.push('Questions Solved: 2/2');
      } else if (rp.roundNumber === 3 && rp.status === 'COMPLETED') {
        achievements.push('Ouroboros Mod Passed');
        achievements.push('Short & Sweet Passed');
      }

      return {
        roundNumber: rp.roundNumber,
        roundName: rp.roundName,
        status: rp.status,
        baseScore: rp.score > 50 ? rp.score - 30 : rp.score,
        bonusScore: rp.score > 50 ? 30 : 0,
        totalScore: rp.score,
        completedAt: rp.status === 'COMPLETED' ? new Date().toISOString() : null,
        achievements,
      };
    });

    return {
      authenticated: true,
      team: {
        id: teamData ? teamData.id : 'team_team_014',
        name: activeTeamName,
        status: teamData ? teamData.status : 'ACTIVE',
        members: teamData ? teamData.members.map((m: any) => m.name) : ['TEAM_014 Captain', 'TEAM_014 Member'],
      },
      results: {
        rank,
        grandTotalScore: scoreVal,
        roundBreakdowns,
      },
    };
  },
};
