import { bibleChapterConvexSchema } from '@/../convex/models/bible/bible_chapters';
import { bibleVerseConvexSchema } from '@/../convex/models/bible/bible_verses';
import { defineSchema, defineTable } from 'convex/server';
import { authTables } from "@convex-dev/auth/server";
import { userNotificationTokenConvexSchema } from 'models/user/user_notification_tokens';

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
  user_notification_tokens: defineTable(userNotificationTokenConvexSchema)
    .index('by_user_id', ['userId']),
});
