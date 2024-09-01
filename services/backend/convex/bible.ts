import { loadKJV } from '@/features/import-bible';
import { internalAction, internalMutation } from 'convex/_generated/server';
import type { BibleChapter } from 'convex/models/bible/bible_chapters';
import { bibleChaptersConvexSchema } from 'convex/models/bible/bible_chapters';

export const _importKJV = internalAction({
  args: {},
  handler: async (ctx, args) => {
    await loadKJV(ctx);
  },
});

//========================================
// Mutation: Write Chapter
//========================================
export const _writeChapter = internalMutation({
  args: bibleChaptersConvexSchema,
  handler: async (ctx, args) => {
    const { version, bookIdx, chapter } = args;
    // check if already exists
    const existingChapter = await ctx.db
      .query('bible_chapters')
      .withIndex('by_version_by_book_by_chapter', (f) =>
        f.eq('version', version).eq('bookIdx', bookIdx).eq('chapter', chapter),
      )
      .first();

    const rec: BibleChapter = args;

    if (existingChapter) {
      // update
      await ctx.db.replace(existingChapter._id, rec);
    } else {
      // insert
      await ctx.db.insert('bible_chapters', rec);
    }
  },
});
