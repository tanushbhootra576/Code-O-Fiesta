import { UserRole } from '@/constants/event';

import {
  ForbiddenError,
  UnauthorizedError,
} from './errors';

import {
  type SessionPayload,
  verifySession,
} from './auth';

const SESSION_COOKIE_NAME = 'session';

export async function getAuthenticatedUser(
  request: Request,
): Promise<SessionPayload | null> {
  const cookieHeader = request.headers.get('cookie');

  if (!cookieHeader) {
    return null;
  }

  const sessionCookie = cookieHeader
    .split(';')
    .find((cookie) =>
      cookie.trim().startsWith(`${SESSION_COOKIE_NAME}=`),
    );

  if (!sessionCookie) {
    return null;
  }

  const token = sessionCookie.split('=').slice(1).join('=');

  if (!token) {
    return null;
  }

  try {
    return await verifySession(token);
  } catch {
    return null;
  }
}

export async function requireAuthentication(
  request: Request,
): Promise<SessionPayload> {
  const session = await getAuthenticatedUser(request);

  if (!session) {
    throw new UnauthorizedError();
  }

  return session;
}

export async function requireAdmin(
  request: Request,
): Promise<SessionPayload> {
  const session = await requireAuthentication(request);

  if (session.role !== UserRole.ADMIN) {
    throw new ForbiddenError();
  }

  return session;
}