import connectDB from '@/lib/db';
import Team from '@/models/Team';
import TeamRound from '@/models/TeamRound';
import Round from '@/models/Round';
import Score from '@/models/Score';
import { TeamStatus, RoundStatus, TeamRoundStatus } from '@/constants/event';

export async function getLeaderboard(adminView = false) {
  await connectDB();
  
  // Ensure Round is registered before population
  Round.init();

  // Find all teams
  const teams = await Team.find({ status: { $ne: TeamStatus.DISQUALIFIED } }).lean();
  
  // Aggregate scores and times
  const leaderboard = await Promise.all(
    teams.map(async (team) => {
      const teamRounds = await TeamRound.find({ teamId: team._id }).populate('roundId').lean();
      const scores = await Score.find({ teamId: team._id }).lean();
      
      let totalScore = 0;
      const roundScores: Record<number, number> = {};
      const roundStatus: Record<number, string> = {};
      
      teamRounds.forEach(tr => {
        const round = tr.roundId as any;
        if (round && round.roundNumber) {
          // Add TeamRound score if applicable
          const trScore = tr.score || 0;
          
          // Check if there's a detailed Score model for this round (Round 3)
          const detailedScore = scores.find(s => s.roundId.toString() === round._id.toString());
          const finalRoundScore = detailedScore ? detailedScore.totalScore : trScore;
          
          roundScores[round.roundNumber] = finalRoundScore;
          roundStatus[round.roundNumber] = tr.status;
          totalScore += finalRoundScore;
        }
      });
      
      return {
        teamId: team._id,
        teamName: team.name,
        totalScore,
        roundScores,
        completionInfo: roundStatus,
        ...(adminView ? { teamCode: team.teamCode, status: team.status } : {})
      };
    })
  );

  // Sort by total score descending
  leaderboard.sort((a, b) => b.totalScore - a.totalScore);
  
  // Add ranks
  return leaderboard.map((entry, index) => ({
    rank: index + 1,
    ...entry
  }));
}

export async function getTeamResults(teamId: string) {
  await connectDB();
  Round.init();
  
  const team = await Team.findById(teamId).lean();
  if (!team) throw new Error('Team not found');

  const teamRounds = await TeamRound.find({ teamId }).populate('roundId').lean();
  const scores = await Score.find({ teamId }).lean();
  
  let totalScore = 0;
  const roundDetails = teamRounds.map(tr => {
    const round = tr.roundId as any;
    const detailedScore = scores.find(s => s.roundId.toString() === round._id.toString());
    const finalRoundScore = detailedScore ? detailedScore.totalScore : (tr.score || 0);
    totalScore += finalRoundScore;
    
    return {
      roundNumber: round?.roundNumber,
      status: tr.status,
      score: finalRoundScore,
      achievements: detailedScore ? {
        baseSolve: (detailedScore.breakdown?.baseSolve || 0) > 0,
        ouroboros: (detailedScore.breakdown?.ouroboros || 0) > 0,
        shortAndSweet: (detailedScore.breakdown?.shortAndSweet || 0) > 0,
        oneShotWonder: (detailedScore.breakdown?.oneShotWonder || 0) > 0,
      } : null,
      completedAt: tr.completedAt
    };
  });
  
  return {
    teamName: team.name,
    totalScore,
    rounds: roundDetails,
    status: team.status
  };
}
