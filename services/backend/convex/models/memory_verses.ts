import { v } from "convex/values";

export const memoryVerseConvexSchema = v.object({
  userId: v.id("users"),
  text: v.string(),
  version: v.string(),
  verse: v.number(),
  chapter: v.number(),
  bookId: v.string(),
  createdAt: v.number(),
  memoryEntries: v.array(v.object({
    createdAt: v.number(),
  })),
});
