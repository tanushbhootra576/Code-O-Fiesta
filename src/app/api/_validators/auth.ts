import { TeamMember } from '@/constants/event';

import { BadRequestError } from '../_lib/errors';

export type LoginInput = {
  email: string;
  password: string;
  teamMember: TeamMember;
};

export function validateLoginInput(
  body: unknown,
): LoginInput {
  if (!body || typeof body !== 'object') {
    throw new BadRequestError(
      'Invalid request body',
    );
  }

  const { email, password, teamMember } =
    body as Record<string, unknown>;

  if (typeof email !== 'string' || !email.trim()) {
    throw new BadRequestError(
      'Email is required',
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalizedEmail)) {
    throw new BadRequestError(
      'Invalid email format',
    );
  }

  if (typeof password !== 'string' || !password) {
    throw new BadRequestError(
      'Password is required',
    );
  }

  if (
    typeof teamMember !== 'string' ||
    !Object.values(TeamMember).includes(
      teamMember as TeamMember,
    )
  ) {
    throw new BadRequestError(
      'Invalid team member',
    );
  }

  return {
    email: normalizedEmail,
    password,
    teamMember: teamMember as TeamMember,
  };
}