import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getExistingMemoryVerseId = query({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Unauthenticated");
    }

    const existingMemoryVerse = await ctx.db
      .query("memoryVerses")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), currentUserId),
          q.eq(q.field("text"), args.text),
        ),
      )
      .first();

    return existingMemoryVerse?._id;
  },
});
/**
 * Add a new memory verse for the current user
 */
export const addMemoryVerse = mutation({
  args: {
    text: v.string(),
    version: v.union(v.literal('niv'), v.literal('kjv')),
    verse: v.number(),
    chapter: v.number(),
    bookId: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Unauthenticated");
    }
    const now = Date.now();

    // check if already exists
    const existingMemoryVerse = await ctx.db
      .query("memoryVerses")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), currentUserId),
          q.eq(q.field("text"), args.text),
        ),
      )
      .first();

    if (existingMemoryVerse) {
      throw new Error("Memory verse already saved");
    }

    return await ctx.db.insert("memoryVerses", {
      userId: currentUserId,
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
export const removeMemoryVerse = mutation({
  args: {
    id: v.id("memoryVerses"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Unauthenticated");
    }

    return await ctx.db.delete(args.id);
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
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Unauthenticated");
    }

    // Verify the memory verse belongs to the user
    const memoryVerse = await ctx.db.get(args.memoryVerseId);
    if (!memoryVerse || memoryVerse.userId !== currentUserId) {
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
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Unauthenticated");
    }

    return await ctx.db
      .query("memoryVerses")
      .filter((q) => q.eq(q.field("userId"), currentUserId))
      .order("desc")
      .collect();
  },
});

export const getMemoryVerse = query({
  args: {
    id: v.id("memoryVerses"),
  },
  handler: async (ctx, args): Promise<Doc<"memoryVerses"> | null> => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Unauthenticated");
    }

    return await ctx.db.get(args.id);
  },
});
