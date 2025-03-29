import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { isBefore, startOfDay, subDays, subWeeks } from "date-fns";
import { getVerseNameFormatted, isBookId } from "../../../common/utils/bible-data-utils";
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


export const getAllMemoryVerses = internalQuery({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx) => {
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
      if (!acc[verse.userId]) {
        acc[verse.userId] = [];
      }
      acc[verse.userId].push(verse);
      return acc;
    }, {});

    // Send a notification to each user
    for (const [userId, verses] of Object.entries(versesByUser)) {

      // Scenarios for push notifications:
      // 1. Verses that were added in the last 3 days, and have no memory entry for the day
      // 2. Verses that have have spanned > 2 weeks but the last memory entry was > 1 week ago
      // We only need to send a notification for one of the verses

      const threeDaysAgo = subDays(startOfDay(new Date()), 3);
      const oneDayAgo = subDays(startOfDay(new Date()), 1);
      const startOfToday = startOfDay(new Date());

      // 1. Verses that were added in the last 3 days, and have no memory entry for the day
      const recentVerses = verses.filter(verse => {
        const verseCreatedDay = startOfDay(new Date(verse.createdAt));
        let lastEntryDay = new Date(0);
        if (verse.memoryEntries.length) {
          const lastEntry = verse.memoryEntries.sort((a, b) => a.createdAt - b.createdAt)[verse.memoryEntries.length - 1];
          lastEntryDay = startOfDay(new Date(lastEntry.createdAt));
        }
        return isBefore(threeDaysAgo, verseCreatedDay) && isBefore(lastEntryDay, startOfToday);
      });

      if (recentVerses.length) {
        // randomly pick a verse
        const randomIndex = Math.floor(Math.random() * recentVerses.length);
        const randomVerse = recentVerses[randomIndex];
        if (!isBookId(randomVerse.bookId)) throw new Error(`Invalid bookId: ${randomVerse.bookId}`);
        const verseName = getVerseNameFormatted({
          version: randomVerse.version,
          bookId: randomVerse.bookId,
          chapter: randomVerse.chapter,
          verse: randomVerse.verse,
        });

        // send a push notification
        await ctx.runMutation(api.pushNotifications.sendPushNotification, {
          to: userId as Id<"users">,
          title: `Keep it fresh: ${verseName}`,
          body: randomVerse.text,
          data: {
            url: "memory-verses-screen",
          },
        });

        return;
      }

      // 2. Verses that were memorised > 4 weeks ago, the last memory entry was > 1 week ago
      const staleVerses = verses.filter(verse => {
        if (!verse.memoryEntries.length) return false; // Only considered stale if there are memory entries
        const entries = verse.memoryEntries.sort((a, b) => a.createdAt - b.createdAt);

        const oldestEntry = entries[0];
        const oldestEntryDay = startOfDay(new Date(oldestEntry?.createdAt ?? 0));
        const newestEntry = entries[entries.length - 1];
        const newestEntryDay = startOfDay(new Date(newestEntry?.createdAt ?? 0));
        const twoWeeksAgo = subWeeks(startOfToday, 2);
        const oneWeekAgo = subDays(startOfToday, 7);
        return isBefore(oldestEntryDay, twoWeeksAgo) && isBefore(newestEntryDay, oneWeekAgo);
      });


      if (staleVerses.length) {
        // randomly pick a verse
        const randomIndex = Math.floor(Math.random() * staleVerses.length);
        const randomVerse = staleVerses[randomIndex];
        if (!isBookId(randomVerse.bookId)) throw new Error(`Invalid bookId: ${randomVerse.bookId}`);
        const verseName = getVerseNameFormatted({
          version: randomVerse.version,
          bookId: randomVerse.bookId,
          chapter: randomVerse.chapter,
          verse: randomVerse.verse,
        });

        // send a push notification
        await ctx.runMutation(api.pushNotifications.sendPushNotification, {
          to: userId as Id<"users">,
          title: `Time to refresh your memory: ${verseName}`,
          body: randomVerse.text.slice(0, 50),
          data: {
            url: "memory-verses-screen",
          },
        });

        return;
      }
    }
  },
});
