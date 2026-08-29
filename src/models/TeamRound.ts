import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

import {
  Round1Path,
  Round1Topic,
  Round2Phase,
  TeamMember,
  TeamRoundStatus,
} from '@/constants/event';

const RoundProblemStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  SOLVED: 'SOLVED',
  FAILED: 'FAILED',
} as const;

const Round2QuestionStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const;

const Round1ProblemSchema = new Schema(
  {
    problemId: {
      type: Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(RoundProblemStatus),
      default: RoundProblemStatus.PENDING,
    },
  },
  { _id: false, strict: true },
);

const Round2QuestionSchema = new Schema(
  {
    questionNumber: {
      type: Number,
      required: true,
    },
    problemId: {
      type: Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
    },
    activeMember: {
      type: String,
      enum: [...Object.values(TeamMember), null],
      default: null,
    },
    phase: {
      type: String,
      enum: Object.values(Round2Phase),
      default: Round2Phase.MEMBER_1,
    },
    member1StartedAt: {
      type: Date,
      default: null,
    },
    member1EndsAt: {
      type: Date,
      default: null,
    },
    member2StartedAt: {
      type: Date,
      default: null,
    },
    member2EndsAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(Round2QuestionStatus),
      default: Round2QuestionStatus.PENDING,
    },
    code: {
      type: String,
      default: '',
    },
    hasSeenBothPhases: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false, strict: true },
);

const Round3ProblemSchema = new Schema(
  {
    problemId: {
      type: Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
    },
    baseSolvePassed: {
      type: Boolean,
      default: false,
    },
    ouroborosPassed: {
      type: Boolean,
      default: false,
    },
    shortAndSweetPassed: {
      type: Boolean,
      default: false,
    },
    oneShotWonderPassed: {
      type: Boolean,
      default: false,
    },
    baseScore: {
      type: Number,
      default: 0,
    },
    bonusScore: {
      type: Number,
      default: 0,
    },
    totalScore: {
      type: Number,
      default: 0,
    },
    submissionCount: {
      type: Number,
      default: 0,
    },
    wrongSubmissionCount: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false, strict: true },
);

const TeamRoundSchema = new Schema(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    roundId: {
      type: Schema.Types.ObjectId,
      ref: 'Round',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TeamRoundStatus),
      default: TeamRoundStatus.NOT_STARTED,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    endsAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    currentProblemId: {
      type: Schema.Types.ObjectId,
      ref: 'Problem',
      default: null,
    },
    score: {
      type: Number,
      default: 0,
    },
    round1: {
      selectedPath: {
        type: String,
        enum: [...Object.values(Round1Path), null],
        default: null,
      },
      revealedTopic: {
        type: String,
        enum: [...Object.values(Round1Topic), null],
        default: null,
      },
      selectedAt: {
        type: Date,
        default: null,
      },
      problems: {
        type: [Round1ProblemSchema],
        default: [],
      },
    },
    round2: {
      currentQuestionNumber: {
        type: Number,
        default: 1,
      },
      activeMember: {
        type: String,
        enum: Object.values(TeamMember),
        default: TeamMember.MEMBER_1,
      },
      phase: {
        type: String,
        enum: Object.values(Round2Phase),
        default: Round2Phase.MEMBER_1,
      },
      phaseStartedAt: {
        type: Date,
        default: null,
      },
      phaseEndsAt: {
        type: Date,
        default: null,
      },
      questions: {
        type: [Round2QuestionSchema],
        default: [],
      },
    },
    round3: {
      currentProblemId: {
        type: Schema.Types.ObjectId,
        ref: 'Problem',
        default: null,
      },
      problems: {
        type: [Round3ProblemSchema],
        default: [],
      },
    },
  },
  {
    collection: 'teamRounds',
    strict: true,
    timestamps: true,
  },
);

TeamRoundSchema.index({ teamId: 1, roundId: 1 }, { unique: true });
TeamRoundSchema.index({ teamId: 1, status: 1 });
TeamRoundSchema.index({ roundId: 1, status: 1 });

export type TeamRoundDocument = InferSchemaType<typeof TeamRoundSchema>;

const TeamRound =
  (mongoose.models.TeamRound as Model<TeamRoundDocument> | undefined) ||
  mongoose.model<TeamRoundDocument>('TeamRound', TeamRoundSchema);

export default TeamRound;
