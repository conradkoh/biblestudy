import { bibleChaptersConvexSchema } from 'convex/models/bible/bible_chapters';
import { defineSchema, defineTable } from 'convex/server';

export default defineSchema({
  bible_chapters: defineTable(bibleChaptersConvexSchema).index(
    'by_version_by_book_by_chapter',
    ['version', 'bookIdx', 'chapter'],
  ),
});
