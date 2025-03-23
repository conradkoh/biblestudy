import { zodToConvex } from '@/utils/convex';
import { z } from 'zod';
//========================================
// Types
//========================================
export type UserNotificationToken = z.infer<typeof userNotificationTokenConvexZodSchema>;

// zod
const userNotificationTokenConvexZodSchema = z.object({
  userId: z.string(),
  token: z.string(),
});

// convex
export const userNotificationTokenConvexSchema = zodToConvex(userNotificationTokenConvexZodSchema);
