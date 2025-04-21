import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";

function computeVerseCount(startVerse: number, endVerse: number): number {
  return endVerse - startVerse + 1;
}

export const logSession = mutation({
  args: {
    date: v.string(), // YYYY-MM-DD
    verses: v.array(v.object({
      bookId: v.string(),
      chapter: v.number(),
      startVerse: v.number(),
      endVerse: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args): Promise<null | undefined> => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      return null;
    }

    const { date, verses } = args;

    // validate date format is YYYY-MM-DD
    if (date.length !== 10 || date.split("-").length !== 3) {
      throw new Error("Invalid date format");
    }

    const existingSession = await ctx.db.query("userSessions").filter(q => q.eq(q.field("userId"), userId)).filter(q => q.eq(q.field("date"), date)).first();

    if (existingSession) {
      // Group existing verses by book and chapter
      const existingByBookChapter = new Map<string, { startVerse: number; endVerse: number }[]>();

      for (const entry of existingSession.verses) {
        const key = `${entry.bookId}-${entry.chapter}`;
        const ranges = existingByBookChapter.get(key) ?? [];
        ranges.push({
          startVerse: entry.startVerse,
          endVerse: entry.endVerse ?? entry.startVerse
        });
        existingByBookChapter.set(key, ranges);
      }

      // Process each new verse entry
      const updatedVerses = [...existingSession.verses];

      for (const newEntry of verses) {
        const key = `${newEntry.bookId}-${newEntry.chapter}`;
        const existingRanges = existingByBookChapter.get(key) ?? [];
        const newRange = {
          startVerse: newEntry.startVerse,
          endVerse: newEntry.endVerse ?? newEntry.startVerse
        };

        // Merge the new range with existing ranges
        const mergedRanges = mergeVerseRanges(existingRanges, newRange);

        // Update the existing ranges for this book/chapter
        existingByBookChapter.set(key, mergedRanges);

        // Remove old entries for this book/chapter
        const filteredVerses = updatedVerses.filter(v =>
          !(v.bookId === newEntry.bookId && v.chapter === newEntry.chapter)
        );

        // Add the merged ranges back with count
        const newVerses = mergedRanges.map(range => ({
          bookId: newEntry.bookId,
          chapter: newEntry.chapter,
          startVerse: range.startVerse,
          endVerse: range.endVerse,
          count: computeVerseCount(range.startVerse, range.endVerse)
        }));

        updatedVerses.splice(0, updatedVerses.length, ...filteredVerses, ...newVerses);
      }

      // Update the session with merged verses
      await ctx.db.patch(existingSession._id, {
        verses: updatedVerses
      });
    } else {
      // Add count to initial verses
      const versesWithCount = verses.map(verse => ({
        ...verse,
        count: computeVerseCount(verse.startVerse, verse.endVerse ?? verse.startVerse)
      }));

      await ctx.db.insert("userSessions", {
        userId,
        date,
        verses: versesWithCount,
      });
    }
  },
});

function mergeVerseRanges(existingRanges: { startVerse: number; endVerse: number }[], newRange: { startVerse: number; endVerse: number }): { startVerse: number; endVerse: number }[] {
  // First, sort all ranges by start verse
  const allRanges = [...existingRanges, newRange].sort((a, b) => a.startVerse - b.startVerse);

  const merged: { startVerse: number; endVerse: number }[] = [];
  let currentRange = allRanges[0];

  for (let i = 1; i < allRanges.length; i++) {
    const nextRange = allRanges[i];

    // Check if ranges overlap or are adjacent
    if (nextRange.startVerse <= currentRange.endVerse + 1) {
      // Merge the ranges
      currentRange = {
        startVerse: Math.min(currentRange.startVerse, nextRange.startVerse),
        endVerse: Math.max(currentRange.endVerse, nextRange.endVerse)
      };
    } else {
      // No overlap, add current range and move to next
      merged.push(currentRange);
      currentRange = nextRange;
    }
  }

  // Add the last range
  merged.push(currentRange);
  return merged;
}

function shouldLogNewSession(existingSession: Doc<"userSessions">, newEntries: { bookId: string; chapter: number; startVerse: number; endVerse: number }[]): boolean {
  // Group existing entries by book and chapter
  const existingByBookChapter = new Map<string, { startVerse: number; endVerse: number }[]>();

  for (const entry of existingSession.verses) {
    const key = `${entry.bookId}-${entry.chapter}`;
    const ranges = existingByBookChapter.get(key) ?? [];
    ranges.push({
      startVerse: entry.startVerse,
      endVerse: entry.endVerse ?? entry.startVerse
    });
    existingByBookChapter.set(key, ranges);
  }

  // Check each new entry against existing ones
  for (const newEntry of newEntries) {
    const key = `${newEntry.bookId}-${newEntry.chapter}`;
    const existingRanges = existingByBookChapter.get(key);

    if (!existingRanges) {
      // No existing entries for this book/chapter, definitely log
      return true;
    }

    // Check if the new range is completely covered by existing ranges
    const isCovered = existingRanges.some(range =>
      newEntry.startVerse >= range.startVerse &&
      newEntry.endVerse <= range.endVerse
    );

    if (!isCovered) {
      // New range is not completely covered, we should log
      return true;
    }
  }

  // All new entries are covered by existing ranges
  return false;
}
