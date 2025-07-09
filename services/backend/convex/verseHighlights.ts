import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { api } from "./_generated/api";
import { mutation, query } from "./_generated/server";

export type HighlightColor =
  | 'highlighterBlue'
  | 'highlighterGreen'
  | 'highlighterYellow'
  | 'highlighterRed'
  | 'highlighterPurple'
  | 'highlighterOrange'
  | 'highlighterPink';

export type VerseHighlight = {
  color: HighlightColor;
  createdAt: number;
};

export type ChapterVerses = {
  [verseNumber: string]: VerseHighlight;
};

/**
 * Get highlights for a specific chapter
 */
export const getChapterHighlights = query({
  args: {
    version: v.union(v.literal('niv'), v.literal('kjv')),
    bookId: v.string(),
    chapter: v.number(),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Unauthenticated");

    const chapterHighlight = await ctx.db
      .query("verseHighlights")
      .withIndex("by_user_version_book_chapter", (q) =>
        q.eq("userId", currentUserId)
          .eq("version", args.version)
          .eq("bookId", args.bookId)
          .eq("chapter", args.chapter)
      )
      .first();

    return chapterHighlight?.verses || {};
  },
});

/**
 * Add or update a verse highlight
 */
export const addVerseHighlight = mutation({
  args: {
    version: v.union(v.literal('niv'), v.literal('kjv')),
    bookId: v.string(),
    chapter: v.number(),
    verse: v.number(),
    color: v.union(
      v.literal('highlighterBlue'),
      v.literal('highlighterGreen'),
      v.literal('highlighterYellow'),
      v.literal('highlighterRed'),
      v.literal('highlighterPurple'),
      v.literal('highlighterOrange'),
      v.literal('highlighterPink')
    ),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Unauthenticated");

    const now = Date.now();

    // Check if chapter highlight record already exists
    const existingChapterHighlight = await ctx.db
      .query("verseHighlights")
      .withIndex("by_user_version_book_chapter", (q) =>
        q.eq("userId", currentUserId)
          .eq("version", args.version)
          .eq("bookId", args.bookId)
          .eq("chapter", args.chapter)
      )
      .first();

    if (existingChapterHighlight) {
      // Update existing chapter record
      const updatedVerses: ChapterVerses = {
        ...existingChapterHighlight.verses,
        [args.verse.toString()]: { color: args.color, createdAt: now }
      };

      await ctx.db.patch(existingChapterHighlight._id, {
        verses: updatedVerses,
      });
      return existingChapterHighlight._id;
    } else {
      // Create new chapter record
      const newVerses: ChapterVerses = {
        [args.verse.toString()]: { color: args.color, createdAt: now }
      };

      return await ctx.db.insert("verseHighlights", {
        userId: currentUserId,
        version: args.version,
        bookId: args.bookId,
        chapter: args.chapter,
        verses: newVerses,
      });
    }
  },
});

/**
 * Remove a verse highlight
 */
export const removeVerseHighlight = mutation({
  args: {
    version: v.union(v.literal('niv'), v.literal('kjv')),
    bookId: v.string(),
    chapter: v.number(),
    verse: v.number(),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Unauthenticated");

    const existingChapterHighlight = await ctx.db
      .query("verseHighlights")
      .withIndex("by_user_version_book_chapter", (q) =>
        q.eq("userId", currentUserId)
          .eq("version", args.version)
          .eq("bookId", args.bookId)
          .eq("chapter", args.chapter)
      )
      .first();

    if (existingChapterHighlight) {
      const updatedVerses: ChapterVerses = { ...existingChapterHighlight.verses };
      delete updatedVerses[args.verse.toString()];

      // If no more verses in this chapter, delete the entire record
      if (Object.keys(updatedVerses).length === 0) {
        await ctx.db.delete(existingChapterHighlight._id);
      } else {
        // Update the record with the remaining verses
        await ctx.db.patch(existingChapterHighlight._id, {
          verses: updatedVerses,
        });
      }
    }
  },
}); 
