import { zodToConvex } from '@/utils/convex';
import { z } from 'zod';
//========================================
// Types
//========================================
export type User = z.infer<typeof user>;

// zod
const baseUserSchema = z.object({
  username: z.string(),
  email: z.string().email(),
});

const googleUserData = z.object({
  googleId: z.string(),
});

const user = baseUserSchema;

// convex
export const userConvexSchema = zodToConvex(user);
