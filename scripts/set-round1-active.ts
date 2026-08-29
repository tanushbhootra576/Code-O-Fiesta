import connectDB from '../src/lib/db';
import Round from '../src/models/Round';
import { Round1Path, Round1Topic, RoundStatus } from '../src/constants/event';

async function main() {
  await connectDB();

  const existing = await Round.findOne({ roundNumber: 1 });
  console.log('Current Round 1 in DB:', existing ? {
    id: existing._id,
    name: existing.name,
    status: existing.status,
    startedAt: existing.startedAt,
    endsAt: existing.endsAt,
  } : 'NOT FOUND');

  const now = new Date();
  const endsAt = new Date(now.getTime() + 3600 * 1000);

  const updated = await Round.findOneAndUpdate(
    { roundNumber: 1 },
    {
      $set: {
        status: RoundStatus.ACTIVE,
        startedAt: existing?.startedAt || now,
        endsAt: existing?.endsAt || endsAt,
        durationSeconds: existing?.durationSeconds || 3600,
        name: existing?.name || 'Round 1',
        'configuration.problemCount': existing?.configuration?.problemCount || 3,
        'configuration.round1.paths': existing?.configuration?.round1?.paths || [
          { shape: Round1Path.TRIANGLE, topic: Round1Topic.BASIC_MATH_NUMBERS },
          { shape: Round1Path.CIRCLE, topic: Round1Topic.STRING_MANIPULATION },
          { shape: Round1Path.SQUARE, topic: Round1Topic.ARRAYS_LOGIC },
          { shape: Round1Path.STAR, topic: Round1Topic.LOOPS_PATTERNS },
        ],
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  console.log('\nSuccessfully set Round 1 to ACTIVE:');
  console.log(JSON.stringify({
    id: updated._id,
    roundNumber: updated.roundNumber,
    name: updated.name,
    status: updated.status,
    startedAt: updated.startedAt,
    endsAt: updated.endsAt,
    durationSeconds: updated.durationSeconds,
  }, null, 2));

  process.exit(0);
}

main().catch((err) => {
  console.error('Error updating Round 1 status:', err);
  process.exit(1);
});
