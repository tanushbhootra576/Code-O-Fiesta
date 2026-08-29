import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

import { Round1Path, Round1Topic, RoundStatus } from '@/constants/event';

const Round1PathSchema = new Schema(
  {
    shape: {
      type: String,
      enum: Object.values(Round1Path),
      required: true,
    },
    topic: {
      type: String,
      enum: Object.values(Round1Topic),
      required: true,
    },
  },
  { _id: false, strict: true },
);

const RoundSchema = new Schema(
  {
    roundNumber: {
      type: Number,
      enum: [1, 2, 3],
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(RoundStatus),
      default: RoundStatus.UPCOMING,
    },
    durationSeconds: {
      type: Number,
      required: true,
    },
    startedAt: {
  type: Date,
  default: null,
},

endsAt: {
  type: Date,
  default: null,
},
    configuration: {
      problemCount: {
        type: Number,
        required: true,
      },
      round1: {
        paths: {
          type: [Round1PathSchema],
          default: undefined,
        },
      },
      round2: {
        questionCount: Number,
        member1Seconds: Number,
        member2Seconds: Number,
        overallDurationSeconds: Number,
      },
      round3: {
        basePoints: Number,
        ouroborosPoints: Number,
        shortAndSweetPoints: Number,
        oneShotWonderPoints: Number,
        maxLines: Number,
      },
    },
  },
  {
    collection: 'rounds',
    strict: true,
    timestamps: true,
  },
);

RoundSchema.index({ roundNumber: 1 }, { unique: true });

export type RoundDocument = InferSchemaType<typeof RoundSchema>;

const Round =
  (mongoose.models.Round as Model<RoundDocument> | undefined) ||
  mongoose.model<RoundDocument>('Round', RoundSchema);

export default Round;
