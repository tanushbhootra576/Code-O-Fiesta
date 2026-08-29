import { NextResponse } from 'next/server';

import { ApiError } from './errors';

export function successResponse<T>(
  data: T,
  status = 200,
) {
  return NextResponse.json(data, { status });
}

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: error.status,
      },
    );
  }

  console.error(error);

  return NextResponse.json(
    {
      message: 'Internal server error',
    },
    {
      status: 500,
    },
  );
}