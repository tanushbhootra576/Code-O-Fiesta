import { NextResponse } from 'next/server';

import { createSession } from '../../_lib/auth';
import { errorResponse } from '../../_lib/response';
import { loginUser } from '../../_services/auth.service';
import { validateLoginInput } from '../../_validators/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const input = validateLoginInput(body);

    const user = await loginUser(input);

    const token = await createSession({
      userId: user.id,
      teamId: user.teamId,
      teamMember: user.teamMember,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        message: 'Login successful',
        user,
      },
      { status: 200 },
    );

    response.cookies.set({
      name: 'session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return errorResponse(error);
  }
}