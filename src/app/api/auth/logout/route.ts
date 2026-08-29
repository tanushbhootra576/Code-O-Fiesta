import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json(
    {
      message: 'Logout successful',
    },
    { status: 200 },
  );

  response.cookies.set({
    name: 'session',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}