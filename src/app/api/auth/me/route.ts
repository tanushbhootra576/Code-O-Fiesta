import connectDB from '@/lib/db';
import User from '@/models/User';

import {
  requireAuthentication,
} from '../../_lib/authorization';
import { UnauthorizedError } from '../../_lib/errors';
import {
  errorResponse,
  successResponse,
} from '../../_lib/response';

export async function GET(request: Request) {
  try {
    const session = await requireAuthentication(request);

    await connectDB();

    const user = await User.findById(session.userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedError();
    }

    return successResponse({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId?.toString() ?? null,
        teamMember: user.teamMember ?? null,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}