import { zid, zodToConvex } from '@/utils/convex';
import { z } from 'zod';
//========================================
// Types
//========================================
export type UserInvite = z.infer<typeof userInviteZodSchema>;

// zod
const userInviteZodSchema = z.object({
  sentByUserId: zid('users'),
  receivedByUserId: zid('users'),
  entityId: z.string(), // Target entity, groupId or userId
  inviteType: z.union([z.literal('GROUP'), z.literal('FRIEND'), z.literal('CLOSE_FRIEND')]),
  status: z.union([z.literal('PENDING'), z.literal('ACCEPTED'), z.literal('REJECTED')]),
  createdOn: z.number(),
  updatedOn: z.number(),
});

// convex
export const userInviteConvexSchema = zodToConvex(userInviteZodSchema);
