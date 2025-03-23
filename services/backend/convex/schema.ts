import { bibleChapterConvexSchema } from '@/../convex/models/bible/bible_chapters';
import { bibleVerseConvexSchema } from '@/../convex/models/bible/bible_verses';
import { defineSchema, defineTable } from 'convex/server';
import { userConvexSchema } from 'models/users/user';
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  bible_chapters: defineTable(bibleChapterConvexSchema).index(
    'by_version_by_book_by_chapter',
    ['version', 'bookIdx', 'chapter'],
  ),
  bible_verses: defineTable(bibleVerseConvexSchema).index(
    'by_version_by_book_by_chapter_by_verse',
    ['version', 'bookIdx', 'chapter', 'verse'],
  ),
  users: defineTable(userConvexSchema)
    .index('by_email', ['email']),
});
