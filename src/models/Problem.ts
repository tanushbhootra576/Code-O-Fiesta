import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

import { ProblemDifficulty, ProblemTopic } from '@/constants/event';

const ExampleSchema = new Schema(
  {
    input: {
      type: String,
      required: true,
    },
    output: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
      required: true,
    },
  },
  { _id: false, strict: true },
);

const TestCaseSchema = new Schema(
  {
    input: {
      type: String,
      required: true,
    },
    expectedOutput: {
      type: String,
      required: true,
    },
  },
  { _id: false, strict: true },
);

const ProblemSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: Object.values(ProblemDifficulty),
      required: true,
    },
    roundNumber: {
      type: Number,
      enum: [1, 2, 3],
      required: true,
    },
    topic: {
      type: String,
      enum: Object.values(ProblemTopic),
      required: true,
    },
    constraints: {
      type: String,
      required: true,
    },
    inputFormat: {
      type: String,
      required: true,
    },
    outputFormat: {
      type: String,
      required: true,
    },
    examples: {
      type: [ExampleSchema],
      default: [],
    },
    visibleTestCases: {
      type: [TestCaseSchema],
      default: [],
    },
    hiddenTestCases: {
      type: [TestCaseSchema],
      default: [],
    },
    allowedLanguages: {
      type: [String],
      default: ['cpp'],
    },
    round3Constraints: {
      recursionRequired: {
        type: Boolean,
        default: false,
      },
      noLoops: {
        type: Boolean,
        default: false,
      },
      maxLines: {
        type: Number,
        default: null,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: 'problems',
    strict: true,
    timestamps: true,
  },
);

ProblemSchema.index({ roundNumber: 1, isActive: 1 });
ProblemSchema.index({ roundNumber: 1, topic: 1, isActive: 1 });

export type ProblemDocument = InferSchemaType<typeof ProblemSchema>;

const Problem =
  (mongoose.models.Problem as Model<ProblemDocument> | undefined) ||
  mongoose.model<ProblemDocument>('Problem', ProblemSchema);

export default Problem;
