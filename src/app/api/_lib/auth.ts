import { SignJWT, jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET;

if (!secretKey) {
  throw new Error('JWT_SECRET is not defined');
}

const secret = new TextEncoder().encode(secretKey);

export type SessionPayload = {
  userId: string;
  teamId: string | null;
  teamMember: string | null;
  role: string;
};

export async function createSession(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifySession(token: string) {
  const { payload } = await jwtVerify(token, secret);

  return payload as SessionPayload;
}