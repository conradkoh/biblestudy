import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getUserNotifications = query({
  args: {},
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (currentUserId === null) {
      return null;
    }

    const invites = await ctx.db
      .query("userInvites")
      .filter((q) => q.eq(q.field("receivedByUserId"), currentUserId))
      .filter((q) => q.eq(q.field("status"), "PENDING"))
      .collect();

    // Get sender information for each invite
    const invitesWithSenderInfo = await Promise.all(
      invites.map(async (invite) => {
        const sender = await ctx.db.get(invite.sentByUserId);
        return {
          ...invite,
          sender: sender
            ? {
              name: sender.name,
              image: sender.image,
            }
            : null,
        };
      }),
    );

    return invitesWithSenderInfo;
  },
});

export const getUserNotificationsV2 = query({
  args: {},
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (currentUserId === null) {
      return null;
    }

    const notifications = await ctx.db
      .query("userNotifications")
      .filter((q) => q.eq(q.field("userId"), currentUserId))
      .order("desc")
      .collect();

    return notifications;
  },
});


export const addUserNotification = mutation({
  args: {
    kind: v.union(v.literal("USER_INVITE"), v.literal("BASIC")), // Basic means just text with no semantic attachments
    userId: v.id("users"),
    title: v.string(),
    body: v.optional(v.string()),
    actionUrl: v.optional(v.string()),
    // USER_INVITE fields
    inviteId: v.optional(v.id("userInvites")),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (currentUserId === null) {
      return null;
    }

    await ctx.db.insert("userNotifications", {
      userId: args.userId,
      title: args.title,
      body: args.body,
      actionUrl: args.actionUrl,
      createdAt: Date.now(),
      kind: args.kind,
      inviteId: args.inviteId,
    });
  },
});
