import { Types } from 'mongoose';
import connectDB from '@/lib/db';
import TeamRound from '@/models/TeamRound';
import Score from '@/models/Score';

export async function persistRound1And2Result(
  teamId: Types.ObjectId,
  roundId: Types.ObjectId,
  problemId: string,
  roundNumber: number,
  pointsEarned: number
) {
  await connectDB();

  const teamRound = await TeamRound.findOne({ teamId, roundId });
  if (!teamRound) return;

  let alreadySolved = false;

  if (roundNumber === 1 && teamRound.round1?.problems) {
    const pIndex = teamRound.round1.problems.findIndex((p: any) => p.problemId?.toString() === problemId);
    if (pIndex !== -1) {
      if (teamRound.round1.problems[pIndex].status === 'SOLVED') {
        alreadySolved = true;
      } else {
        teamRound.set(`round1.problems.${pIndex}.status`, 'SOLVED');
      }
    }
  } else if (roundNumber === 2 && teamRound.round2?.questions) {
    const qIndex = teamRound.round2.questions.findIndex((q: any) => q.problemId?.toString() === problemId);
    if (qIndex !== -1) {
      if (teamRound.round2.questions[qIndex].status === 'COMPLETED') {
        alreadySolved = true;
      } else {
        teamRound.set(`round2.questions.${qIndex}.status`, 'COMPLETED');
      }
    }
  }

  // If already solved, we don't add points again
  if (alreadySolved) {
    return;
  }

  // Accumulate points
  teamRound.score = (teamRound.score || 0) + pointsEarned;
  await teamRound.save();

  // Also update or create the Score document
  let scoreDoc = await Score.findOne({ teamId, roundId });
  if (!scoreDoc) {
    scoreDoc = new Score({
      teamId,
      roundId,
      baseScore: 0,
      bonusScore: 0,
      totalScore: 0,
    });
  }

  scoreDoc.baseScore = (scoreDoc.baseScore || 0) + pointsEarned;
  scoreDoc.totalScore = (scoreDoc.totalScore || 0) + pointsEarned;
  await scoreDoc.save();
}
