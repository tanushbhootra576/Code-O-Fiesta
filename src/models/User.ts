import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

import { TeamMember, UserRole } from '@/constants/event';

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
      default: UserRole.PARTICIPANT,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    teamMember: {
      type: String,
      enum: Object.values(TeamMember),
      required(this: { role?: string }) {
        return this.role === UserRole.PARTICIPANT;
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: 'users',
    strict: true,
    timestamps: true,
  },
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ teamId: 1 });
UserSchema.index({ teamId: 1, teamMember: 1 }, { unique: true });

export type UserDocument = InferSchemaType<typeof UserSchema>;

const User =
  (mongoose.models.User as Model<UserDocument> | undefined) ||
  mongoose.model<UserDocument>('User', UserSchema);

export default User;
