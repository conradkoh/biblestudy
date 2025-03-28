import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";

/**
 * Add a new memory verse for the current user
 */
export const addMemoryVerse = mutation({
  args: {
    text: v.string(),
    version: v.string(),
    verse: v.number(),
    chapter: v.number(),
    bookId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const userId = identity.subject as Id<"users">;
    const now = Date.now();

    return await ctx.db.insert("memoryVerses", {
      userId,
      text: args.text,
      version: args.version,
      verse: args.verse,
      chapter: args.chapter,
      bookId: args.bookId,
      createdAt: now,
      memoryEntries: [],
    });
  },
});

/**
 * Add a memory entry to a memory verse
 */
export const addMemoryEntry = mutation({
  args: {
    memoryVerseId: v.id("memoryVerses"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const userId = identity.subject as Id<"users">;

    // Verify the memory verse belongs to the user
    const memoryVerse = await ctx.db.get(args.memoryVerseId);
    if (!memoryVerse || memoryVerse.userId !== userId) {
      throw new ConvexError("Memory verse not found or unauthorized");
    }

    const now = Date.now();
    const updatedMemoryEntries = [
      ...memoryVerse.memoryEntries,
      { createdAt: now },
    ];

    return await ctx.db.patch(args.memoryVerseId, {
      memoryEntries: updatedMemoryEntries,
    });
  },
});

/**
 * Get all memory verses for the current user
 */
export const getMemoryVerses = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const userId = identity.subject as Id<"users">;

    return await ctx.db
      .query("memoryVerses")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect();
  },
});
