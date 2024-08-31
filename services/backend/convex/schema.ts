import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  user: defineTable({
    id: v.id('user'),
    name: v.string(),
    status: v.literal('active'),
  }),
});
