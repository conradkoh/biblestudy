import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});

export const searchUser = query({
  args: {
    username: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withSearchIndex("search_username", (q) =>
        q.search("username", args.username),
      )
      .paginate(args.paginationOpts);
  }
})

export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  }
})

export const getUserFriends = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      return null;
    }

    // Get all friendships where the user is either userA or userB
    const friendships = await ctx.db
      .query("userFriendships")
      .filter((q) =>
        q.or(
          q.eq(q.field("userAId"), userId),
          q.eq(q.field("userBId"), userId)
        )
      )
      .collect();

    // Get the other user's information for each friendship
    const friends = await Promise.all(
      friendships.map(async (friendship) => {
        const otherUserId = friendship.userAId === userId
          ? friendship.userBId
          : friendship.userAId;

        const user = await ctx.db.get(otherUserId);
        if (!user) return null;

        return {
          ...user,
          friendshipKind: friendship.kind,
        };
      })
    );

    // Filter out any null values and return
    return friends.filter((friend): friend is Doc<"users"> & { friendshipKind: "FRIEND" | "CLOSE_FRIEND" } =>
      friend !== null
    );
  },
});

export const getUserGroups = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      return null;
    }

    // Get all group roles for the user
    const userGroupRoles = await ctx.db
      .query("userGroupRoles")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    // Get the group information for each role
    const groups = await Promise.all(
      userGroupRoles.map(async (role) => {
        const group = await ctx.db.get(role.groupId);
        if (!group) return null;

        return {
          ...group,
          role: role.role,
        };
      })
    );

    // Filter out any null values and return
    return groups.filter((group): group is Doc<"userGroups"> & { role: "MEMBER" | "OWNER" | "ADMIN" } =>
      group !== null
    );
  },
});

export const updateUsername = mutation({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    // Check if username is already taken
    const existingUsers = await ctx.db
      .query("users")
      .withSearchIndex("search_username", (q) =>
        q.search("username", args.username)
      )
      .collect();


    // Search does fuzzy matching, and we don't have case insensitive equality checks, so
    // we do a fuzzy search then refine
    if (existingUsers.find(user => user.username?.toLowerCase() === args.username.toLowerCase())) {
      throw new Error("Username is already taken");
    }

    // Update the user's username
    await ctx.db.patch(userId, {
      username: args.username,
    });

    return true;
  },
});

export const isUsernameAvailable = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return false;
    }


    const existingUsers = await ctx.db
      .query("users")
      .withSearchIndex("search_username", (q) =>
        q.search("username", args.username)
      )
      .collect();


    // Search does fuzzy matching, and we don't have case insensitive equality checks, so
    // we do a fuzzy search then refine
    const isTaken = existingUsers.find(user => user.username?.toLowerCase() === args.username.toLowerCase());

    return !isTaken;
  },
});

export const removeFriend = mutation({
  args: {
    otherUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (currentUserId === null) {
      return null;
    }

    const relationship = await ctx.db.query("userFriendships").filter((q) =>
      q.or(
        q.and(
          q.eq(q.field("userAId"), currentUserId),
          q.eq(q.field("userBId"), args.otherUserId)
        ),
        q.and(
          q.eq(q.field("userAId"), args.otherUserId),
          q.eq(q.field("userBId"), currentUserId)
        )
      )
    ).first();


    if (!relationship) {
      throw new Error("Relationship not found");
    }

    await ctx.db.delete(relationship._id);
  },
});
