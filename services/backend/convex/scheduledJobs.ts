import { api } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { action } from "./_generated/server";

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
      const verseCount = verses.length;
      const lastEntry = verses.reduce((latest: { createdAt: number } | null, verse: Doc<"memoryVerses">) => {
        const lastEntry = verse.memoryEntries[verse.memoryEntries.length - 1];
        if (!latest || !lastEntry || lastEntry.createdAt > latest.createdAt) {
          return lastEntry;
        }
        return latest;
      }, null);

      // Only send reminder if user hasn't practiced in the last 24 hours
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      if (!lastEntry || lastEntry.createdAt < oneDayAgo) {
        await ctx.runMutation(api.pushNotifications.sendPushNotification, {
          to: userId as Id<"users">,
          title: "Time to memorise your verses!",
          body: `You have ${verseCount} memory verse${verseCount === 1 ? '' : 's'} to practice today.`,
          data: {
            url: "memorize-screen",
          },
        });
      }
    }
  },
});
