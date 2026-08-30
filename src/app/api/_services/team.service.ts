import type { Types } from 'mongoose';

import connectDB from '@/lib/db';
import Round from '@/models/Round';
import Team from '@/models/Team';
import TeamRound from '@/models/TeamRound';

import { NotFoundError } from '../_lib/errors';

type PopulatedMember = {
  _id: Types.ObjectId;
  name: string;
  email: string;
  role: string;
  teamMember?: string | null;
};

export async function getTeamState(teamId: string) {
  await connectDB();

  const team = await Team.findById(teamId)
    .populate('members', 'name email role teamMember')
    .lean();

  if (!team) {
    throw new NotFoundError('Team not found');
  }

  const activeRound = await Round.findOne({
    status: 'ACTIVE',
  })
    .select(
      'roundNumber name status durationSeconds startedAt endsAt',
    )
    .lean();

  let progress = null;

  if (activeRound) {
    progress = await TeamRound.findOne({
      teamId: team._id,
      roundId: activeRound._id,
    })
      .select(
        'status startedAt endsAt completedAt currentProblemId score',
      )
      .lean();
  }

  const members =
    team.members as unknown as PopulatedMember[];

  return {
    team: {
      id: team._id.toString(),
      teamCode: team.teamCode,
      name: team.name,
      status: team.status,
      captainId: team.captainId?.toString() ?? null,

      members: members.map((member) => ({
        id: member._id.toString(),
        name: member.name,
        email: member.email,
        role: member.role,
        teamMember: member.teamMember ?? null,
      })),
    },

    currentRound: activeRound
      ? {
          id: activeRound._id.toString(),
          roundNumber: activeRound.roundNumber,
          name: activeRound.name,
          status: activeRound.status,
          durationSeconds: activeRound.durationSeconds,
          startedAt: activeRound.startedAt ?? null,
          endsAt: activeRound.endsAt ?? null,
        }
      : null,

    progress: progress
      ? {
          status: progress.status,
          startedAt: progress.startedAt ?? null,
          endsAt: progress.endsAt ?? null,
          completedAt: progress.completedAt ?? null,

          currentProblemId:
            progress.currentProblemId?.toString() ?? null,

          score: progress.score ?? 0,
        }
      : null,
  };
}