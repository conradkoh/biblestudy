import { zid, zodToConvex } from '@/utils/convex';
import { z } from 'zod';
//========================================
// Types
//========================================
export type UserFriendship = z.infer<typeof userFriendshipZodSchema>;

// zod
const userFriendshipZodSchema = z.object({
  userAId: zid('users'),
  userBId: zid('users'),
  kind: z.union([z.literal('FRIEND'), z.literal('CLOSE_FRIEND')]),
  createdOn: z.number(),
});

// convex
export const userFriendshipConvexSchema = zodToConvex(userFriendshipZodSchema);
