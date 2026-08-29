import connectDB from '@/lib/db';
import Team from '@/models/Team';
import Round from '@/models/Round';
import TeamRound from '@/models/TeamRound';
import Submission from '@/models/Submission';
import { RoundStatus, TeamRoundStatus } from '@/constants/event';

export async function getAdminState() {
  await connectDB();
  const activeRound = await Round.findOne({ status: RoundStatus.ACTIVE }).lean();
  const allRounds = await Round.find().lean();
  
  const totalTeams = await Team.countDocuments();
  const activeTeams = await Team.countDocuments({ status: 'ACTIVE' });
  
  const totalSubmissions = await Submission.countDocuments();
  const recentSubmissions = await Submission.find().sort({ createdAt: -1 }).limit(10).populate('teamId problemId').lean();

  return {
    eventState: activeRound ? 'IN_PROGRESS' : 'PENDING_OR_COMPLETED',
    currentRound: activeRound || null,
    allRounds,
    statistics: {
      totalTeams,
      activeTeams,
      totalSubmissions,
    },
    recentSubmissions
  };
}

export async function getAllTeams() {
  await connectDB();
  return Team.find().populate('members').lean();
}

export async function getTeamDetail(teamId: string) {
  await connectDB();
  const team = await Team.findById(teamId).populate('members').lean();
  if (!team) throw new Error('Team not found');
  
  const teamRounds = await TeamRound.find({ teamId }).populate('roundId').lean();
  const submissions = await Submission.find({ teamId }).sort({ createdAt: -1 }).limit(50).populate('problemId').lean();
  
  return {
    team,
    teamRounds,
    submissions
  };
}

export async function startRoundGlobally(roundNumber: number) {
  await connectDB();
  const round = await Round.findOne({ roundNumber });
  if (!round) throw new Error('Round not found');
  
  await Round.updateMany({ roundNumber: { $ne: roundNumber } }, { status: RoundStatus.COMPLETED });
  
  round.status = RoundStatus.ACTIVE;
  await round.save();

  await TeamRound.updateMany(
    { roundId: round._id, status: TeamRoundStatus.NOT_STARTED },
    { status: TeamRoundStatus.IN_PROGRESS, startedAt: new Date() }
  );
  
  return round;
}

export async function completeRoundGlobally(roundNumber: number) {
  await connectDB();
  const round = await Round.findOne({ roundNumber });
  if (!round) throw new Error('Round not found');
  
  round.status = RoundStatus.COMPLETED;
  await round.save();

  await TeamRound.updateMany(
    { roundId: round._id, status: TeamRoundStatus.IN_PROGRESS },
    { status: TeamRoundStatus.COMPLETED, completedAt: new Date() }
  );
  
  return round;
}

export async function overrideRoundState(roundNumber: number, payload: any) {
  await connectDB();
  const round = await Round.findOne({ roundNumber });
  if (!round) throw new Error('Round not found');
  
  if (payload.status) {
    round.status = payload.status;
    let trStatus;
    if (payload.status === RoundStatus.ACTIVE) trStatus = TeamRoundStatus.IN_PROGRESS;
    if (payload.status === RoundStatus.COMPLETED) trStatus = TeamRoundStatus.COMPLETED;
    
    if (trStatus) {
      await TeamRound.updateMany(
        { roundId: round._id },
        { status: trStatus }
      );
    }
  }
  if (payload.durationSeconds) round.durationSeconds = payload.durationSeconds;
  
  await round.save();
  return round;
}

export async function getOrganizerSubmissions() {
  await connectDB();
  return Submission.find().sort({ createdAt: -1 }).limit(100).populate('teamId problemId').lean();
}
