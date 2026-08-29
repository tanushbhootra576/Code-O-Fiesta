import connectDB from '@/lib/db';
import Round from '@/models/Round';

export async function getEventState() {
  await connectDB();

  const rounds = await Round.find()
    .select(
      'roundNumber name status durationSeconds startedAt endsAt',
    )
    .sort({ roundNumber: 1 })
    .lean();

  const activeRound =
    rounds.find((round) => round.status === 'ACTIVE') ??
    null;

  let eventStatus: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';

  if (rounds.some((round) => round.status === 'ACTIVE')) {
    eventStatus = 'ACTIVE';
  } else if (
    rounds.length > 0 &&
    rounds.every(
      (round) => round.status === 'COMPLETED',
    )
  ) {
    eventStatus = 'COMPLETED';
  } else {
    eventStatus = 'UPCOMING';
  }

  return {
    eventStatus,

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
  };
}