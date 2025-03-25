import { bibleChapterConvexSchema } from '@/../convex/models/bible/bible_chapters';
import { bibleVerseConvexSchema } from '@/../convex/models/bible/bible_verses';
import { defineSchema, defineTable } from 'convex/server';
import { authTables } from "@convex-dev/auth/server";
import { userGroupConvexSchema, userGroupRoleConvexSchema } from 'models/user/user_groups';
import { userInviteConvexSchema } from 'models/user/user_invites';
import { userFriendshipConvexSchema } from 'models/user/user_friendship';
import { v } from 'convex/values';

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
  userFriendships: defineTable(userFriendshipConvexSchema),
  userInvites: defineTable(userInviteConvexSchema),
  userGroups: defineTable(userGroupConvexSchema),
  userGroupRoles: defineTable(userGroupRoleConvexSchema),
  users: defineTable(v.object({
    // standard convex-auth fields
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // other "users" fields...
    username: v.optional(v.string()),
  })).index("email", ["email"]).searchIndex("search_username", {
    searchField: 'username'
  }),
});
