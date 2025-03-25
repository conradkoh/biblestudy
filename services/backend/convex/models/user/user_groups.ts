import { zid, zodToConvex } from '@/utils/convex';
import { v } from 'convex/values';
import { z } from 'zod';
//========================================
// Types
//========================================
export type UserGroup = z.infer<typeof userGroupZodSchema>;
export type UserGroupRole = z.infer<typeof userGroupZodSchema>;

// zod
const userGroupZodSchema = z.object({
  name: z.string(),
  createdBy: zid('users'),
});


const userGroupRoleZodSchema = z.object({
  groupId: zid('groups'),
  role: z.union([z.literal('MEMBER'), z.literal('OWNER'), z.literal('ADMIN')]),
  createdOn: z.number(),
});

// convex
export const userGroupConvexSchema = zodToConvex(userGroupZodSchema);
export const userGroupRoleConvexSchema = zodToConvex(userGroupRoleZodSchema);
