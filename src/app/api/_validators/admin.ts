import { z } from 'zod';
import { RoundStatus } from '@/constants/event';

export const overrideRoundStateSchema = z.object({
  status: z.enum([RoundStatus.UPCOMING, RoundStatus.ACTIVE, RoundStatus.COMPLETED]).optional(),
  durationSeconds: z.number().positive().optional(),
});
