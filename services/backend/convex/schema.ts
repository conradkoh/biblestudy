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
  memoryVerses: defineTable(v.object({
    userId: v.id("users"),
    text: v.string(),
    version: v.union(v.literal('niv'), v.literal('kjv')),
    verse: v.number(),
    chapter: v.number(),
    bookId: v.string(),
    createdAt: v.number(),
    memoryEntries: v.array(v.object({
      createdAt: v.number(),
    })),
  })),
  messages: defineTable(v.object({
    senderId: v.id("users"),
    receiverId: v.union(v.id("users"), v.id("userGroups")),
    content: v.string(),
    kind: v.union(v.literal("CHAT"), v.literal("POKE"), v.literal("PRAYER")),
    createdAt: v.number(),
    readAt: v.optional(v.number()),
  }))
    .index("receiverId", ["receiverId"])
    .index("senderId", ["senderId"])
    .index("receiverId_senderId", ["receiverId", "senderId"]),
  userNotifications: defineTable(v.object({
    kind: v.union(v.literal("USER_INVITE"), v.literal("BASIC")),
    userId: v.id("users"),
    title: v.string(),
    body: v.optional(v.string()),
    actionUrl: v.optional(v.string()),
    createdAt: v.number(),
    // USER_INVITE fields
    inviteId: v.optional(v.id("userInvites")),
  })).index("userId", ["userId"]),
});
