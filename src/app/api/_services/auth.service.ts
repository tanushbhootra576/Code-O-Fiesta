import argon2 from 'argon2';

import connectDB from '@/lib/db';
import User from '@/models/User';

import { UnauthorizedError } from '../_lib/errors';

import type { LoginInput } from '../_validators/auth';

export async function loginUser({
  email,
  password,
  teamMember,
}: LoginInput) {
  await connectDB();

  let user = await User.findOne({
    email,
    teamMember,
  });

  // Fallback for Admin users who don't have a teamMember field
  if (!user) {
    user = await User.findOne({
      email,
      role: 'ADMIN',
    });
  }

  if (!user) {
    throw new UnauthorizedError(
      'Invalid email or password',
    );
  }

  if (!user.isActive) {
    throw new UnauthorizedError(
      'Invalid email or password',
    );
  }

  const passwordMatches = await argon2.verify(
    user.passwordHash,
    password,
  );

  if (!passwordMatches) {
    throw new UnauthorizedError(
      'Invalid email or password',
    );
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    teamId: user.teamId?.toString() ?? null,
    teamMember: user.teamMember ?? null,
  };
}