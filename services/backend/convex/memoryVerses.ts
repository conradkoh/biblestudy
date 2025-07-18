import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { isBefore, startOfDay, subDays, subWeeks } from "date-fns";
import { getVerseNameFormatted, isBookId } from "../../../common/utils/bible-data-utils";
import { calculateExpirationInfo } from "../../../common/utils/memory-verse-utils";
import { api, internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { internalAction, internalQuery, mutation, query } from "./_generated/server";

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

export const getExistingMemoryVerseId2 = query({
  args: {
    version: v.union(v.literal('niv'), v.literal('kjv')),
    bookId: v.string(),
    chapter: v.number(),
    verse: v.number(),
    endVerse: v.optional(v.number()),
    endChapter: v.optional(v.number()),
    endBookId: v.optional(v.string()),
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
          q.eq(q.field("version"), args.version),
          q.eq(q.field("bookId"), args.bookId),
          q.eq(q.field("chapter"), args.chapter),
          q.eq(q.field("verse"), args.verse),
          ...(args.endVerse && args.endChapter && args.endBookId ? [q.eq(q.field("endVerse"), args.endVerse), q.eq(q.field("endChapter"), args.endChapter), q.eq(q.field("endBookId"), args.endBookId)] : []),
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
    endVerse: v.optional(v.number()),
    endChapter: v.optional(v.number()),
    endBookId: v.optional(v.string()),
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
      endVerse: args.endVerse,
      endChapter: args.endChapter,
      endBookId: args.endBookId,
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


export const getAllMemoryVerses = internalQuery({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (args.userId) {
      return await ctx.db.query("memoryVerses").filter((q) => q.eq(q.field("userId"), args.userId)).collect();
    }

    return await ctx.db.query("memoryVerses").collect();
  },
});

export const sendMemoryVerseReminders = internalAction({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Get all users with memory verses
    const memoryVerses = await ctx.runQuery(internal.memoryVerses.getAllMemoryVerses, args);

    // Group memory verses by user
    const versesByUser = memoryVerses.reduce((acc: Record<Id<"users">, Doc<"memoryVerses">[]>, verse: Doc<"memoryVerses">) => {
      acc[verse.userId] ??= [];
      acc[verse.userId].push(verse);
      return acc;
    }, {});

    // Send a notification to each user
    for (const [userId, verses] of Object.entries(versesByUser)) {

      if (args.userId && userId !== args.userId) continue;

      const now = new Date();

      const versesExpiringToday = verses.filter(verse => {
        const expirationInfo = calculateExpirationInfo(verse.memoryEntries, now);
        return !expirationInfo.isExpired && expirationInfo.daysUntilExpiration === 0;
      });

      if (versesExpiringToday.length > 0) {
        // send a push notification
        ctx.runMutation(api.pushNotifications.sendPushNotification, {
          to: userId as Id<"users">,
          title: `${versesExpiringToday.length} ${versesExpiringToday.length === 1 ? "verse" : "verses"} expiring today!`,
          body: `Refresh your memory before it expires!`,
          data: {
            url: "memory-verses-screen",
          },
        });
        return;
      }

      const versesExpiringSoon = verses.filter(verse => {
        const expirationInfo = calculateExpirationInfo(verse.memoryEntries, now);
        return !expirationInfo.isExpired && expirationInfo.daysUntilExpiration <= 1;
      });

      if (versesExpiringSoon.length > 0) {
        // send a push notification
        ctx.runMutation(api.pushNotifications.sendPushNotification, {
          to: userId as Id<"users">,
          title: `${versesExpiringSoon.length} ${versesExpiringSoon.length === 1 ? "verse" : "verses"} expiring soon!`,
          body: `Refresh your memory before it expires!`,
          data: {
            url: "memory-verses-screen",
          },
        });
        return;
      }

      const versesExpired = verses.filter(verse => {
        const expirationInfo = calculateExpirationInfo(verse.memoryEntries, now);
        return expirationInfo.isExpired && !verse.memoryEntries.length;
      });

      if (versesExpired.length > 0) {
        // send a push notification
        ctx.runMutation(api.pushNotifications.sendPushNotification, {
          to: userId as Id<"users">,
          title: `Refresh your expired verses!`,
          body: `You have ${versesExpired.length} waiting to be refreshed!`,
          data: {
            url: "memory-verses-screen",
          },
        });
        return;
      }

      const unattemptedVerses = verses.filter(verse => {
        return !verse.memoryEntries.length;
      });

      if (unattemptedVerses.length > 0) {
        // send a push notification
        ctx.runMutation(api.pushNotifications.sendPushNotification, {
          to: userId as Id<"users">,
          title: `Memorize ${unattemptedVerses.length} verses!`,
          body: `You have ${unattemptedVerses.length} ${unattemptedVerses.length === 1 ? "verse" : "verses"} waiting to be memorized!`,
        });
      }

      if (verses.length > 0) {
        // Randomly pick a low streak verse
        const randomIndex = Math.floor(Math.random() * verses.length);
        const randomVerse = verses[randomIndex];
        if (!isBookId(randomVerse.bookId)) throw new Error(`Invalid bookId: ${randomVerse.bookId}`);

        const verseName = getVerseNameFormatted({
          version: randomVerse.version,
          bookId: randomVerse.bookId,
          chapter: randomVerse.chapter,
          verse: randomVerse.verse,
        });

        // send a push notification
        ctx.runMutation(api.pushNotifications.sendPushNotification, {
          to: userId as Id<"users">,
          title: `Memorize ${verseName}!`,
          body: randomVerse.text,
          data: {
            url: "memory-verses-screen",
          },
        });

        return;
      }
    }
  },
});
