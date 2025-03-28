import { isBefore, startOfDay, subDays, subWeeks } from "date-fns";
import { api } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { action } from "./_generated/server";
import { getVerseNameFormatted, isBookId } from "../../../common/utils/bible-data-utils";

// Run every day at 9 AM
export const sendMemoryVerseReminders = action({
  args: {},
  handler: async (ctx) => {
    // Get all users with memory verses
    const memoryVerses = await ctx.runQuery(api.memoryVerses.getMemoryVerses);

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
        const lastEntry = verse.memoryEntries.sort((a, b) => a.createdAt - b.createdAt)[verse.memoryEntries.length - 1];
        const lastEntryDay = startOfDay(new Date(lastEntry.createdAt));
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
          body: randomVerse.text.slice(0, 50),
          data: {
            url: "memory-verses-screen",
          },
        });

        return;
      }

      // 2. Verses that were memorised > 4 weeks ago, the last memory entry was > 1 week ago
      const staleVerses = verses.filter(verse => {
        const entries = verse.memoryEntries.sort((a, b) => a.createdAt - b.createdAt);

        const oldestEntry = entries[0];
        const oldestEntryDay = startOfDay(new Date(oldestEntry.createdAt));
        const newestEntry = entries[entries.length - 1];
        const newestEntryDay = startOfDay(new Date(newestEntry.createdAt));
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
