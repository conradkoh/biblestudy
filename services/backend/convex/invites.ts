import { query } from "./_generated/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { sendPushNotification } from "pushNotifications";
import { api } from "_generated/api";

type FriendshipStatus = {
  status: "FRIEND" | "CLOSE_FRIEND" | "SELF" | "OUTGOING_INVITE" | "INCOMING_INVITE" | "NONE";
  inviteId?: Id<"userInvites">;
};

/**
 * Get the friendship status between the current user and another user.
 *
 * @param otherUserId - The ID of the other user
 * @returns An object containing the status of the friendship
 *  - "NONE": No relationship exists
 *  - "FRIENDS": Users are already friends
 *  - "OUTGOING_INVITE": Current user has sent a pending friend invitation
 *  - "INCOMING_INVITE": Current user has received a pending friend invitation
 */
export const getFriendshipStatus = query({
  args: {
    otherUserId: v.id("users"),
  },
  handler: async (ctx, args): Promise<FriendshipStatus> => {
    const currentUserId = await getAuthUserId(ctx);
    if (currentUserId === null) {
      throw new Error("Unauthenticated");
    }

    const { otherUserId } = args;

    // Don't allow checking friendship status with yourself
    if (currentUserId === otherUserId) {
      return { status: "SELF" };
    }

    // Check if users are already friends
    const existingFriendship = await ctx.db
      .query("userFriendships")
      .filter((q) =>
        q.or(
          q.and(
            q.eq(q.field("userAId"), currentUserId),
            q.eq(q.field("userBId"), otherUserId),
          ),
          q.and(
            q.eq(q.field("userBId"), currentUserId),
            q.eq(q.field("userAId"), otherUserId),
          ),
        ),
      )
      .first();

    if (existingFriendship) {
      return {
        status: existingFriendship.kind,
      };
    }

    // Check for pending friend invitations
    const outgoingInvite = await ctx.db
      .query("userInvites")
      .filter((q) =>
        q.and(
          q.eq(q.field("sentByUserId"), currentUserId),
          q.eq(q.field("receivedByUserId"), otherUserId),
          q.or(q.eq(q.field("inviteType"), "FRIEND"), q.eq(q.field("inviteType"), "CLOSE_FRIEND")),
          q.eq(q.field("status"), "PENDING"),
        ),
      )
      .first();

    if (outgoingInvite) {
      return {
        status: "OUTGOING_INVITE",
        inviteId: outgoingInvite._id,
      };
    }

    const incomingInvite = await ctx.db
      .query("userInvites")
      .filter((q) =>
        q.and(
          q.eq(q.field("sentByUserId"), otherUserId),
          q.eq(q.field("receivedByUserId"), currentUserId),
          q.eq(q.field("inviteType"), "FRIEND"),
          q.eq(q.field("status"), "PENDING"),
        ),
      )
      .first();

    if (incomingInvite) {
      return {
        status: "INCOMING_INVITE",
        inviteId: incomingInvite._id,
      };
    }

    // No relationship exists
    return { status: "NONE" };
  },
});

/**
 * Send a friend invitation from the current user to another user.
 *
 * @param sentByUserId - The ID of the user sending the invitation
 * @param receivedByUserId - The ID of the user receiving the invitation
 * @param friendType - The type of friend relationship (FRIEND or CLOSE_FRIEND)
 * @returns The ID of the created invitation
 */
export const sendFriendInvite = mutation({
  args: {
    receivedByUserId: v.id("users"),
    friendType: v.union(v.literal("FRIEND"), v.literal("CLOSE_FRIEND")),
  },
  handler: async (ctx, args): Promise<Id<"userInvites">> => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Unauthenticated");
    }

    const receivedByUser = await ctx.db.get(args.receivedByUserId);
    if (!receivedByUser) {
      throw new Error("Recipient user not found");
    }

    // Check if an invite already exists and is pending
    const existingInvites = await ctx.db
      .query("userInvites")
      .filter((q) =>
        q.and(
          q.eq(q.field("sentByUserId"), currentUserId),
          q.eq(q.field("receivedByUserId"), args.receivedByUserId),
          q.or(
            q.eq(q.field("inviteType"), "FRIEND"),
            q.eq(q.field("inviteType"), "CLOSE_FRIEND"),
          ),
          q.eq(q.field("status"), "PENDING"),
        ),
      )
      .collect();

    if (existingInvites.length > 0) {
      throw new Error("A pending invitation already exists");
    }

    // Check if they are already friends
    const existingFriendships = await ctx.db
      .query("userFriendships")
      .filter((q) =>
        q.or(
          q.and(
            q.eq(q.field("userAId"), currentUserId),
            q.eq(q.field("userBId"), args.receivedByUserId),
          ),
          q.and(
            q.eq(q.field("userBId"), currentUserId),
            q.eq(q.field("userAId"), args.receivedByUserId),
          ),
        ),
      )
      .collect();

    if (existingFriendships.length > 0) {
      throw new Error("Already friends with this user");
    }

    // Create the invitation
    const now = Date.now();

    const result = await ctx.db.insert("userInvites", {
      sentByUserId: currentUserId,
      receivedByUserId: args.receivedByUserId,
      entityId: args.receivedByUserId,
      inviteType: args.friendType,
      status: "PENDING",
      createdOn: now,
      updatedOn: now,
    });

    const currentUser = await ctx.db.get(currentUserId);

    await ctx.runMutation(api.pushNotifications.sendPushNotification, {
      to: args.receivedByUserId,
      title: "New Friend Request",
      body: `${currentUser?.username} wants to be ${args.friendType === "FRIEND" ? "your friend" : "your close friend"}`,
      data: {
        url: 'notifications-screen',
      },
    });

    return result;
  },
});

/**
 * Accept a friend invitation.
 *
 * @param inviteId - The ID of the invitation to accept
 * @returns boolean indicating success
 */
export const updateUserInvite = mutation({
  args: {
    inviteId: v.id("userInvites"),
    status: v.union(v.literal("ACCEPTED"), v.literal("REJECTED")),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Unauthenticated");
    }

    const invite = await ctx.db.get(args.inviteId);
    if (!invite) throw new Error("Invitation not found");
    if (invite.receivedByUserId !== currentUserId) throw new Error("Invitation not found");
    if (invite.status !== "PENDING") throw new Error("Invitation is not pending");

    // Update the invitation status
    await ctx.db.patch(args.inviteId, {
      status: args.status,
      updatedOn: Date.now(),
    });

    switch (invite.inviteType) {
      case "FRIEND":
      case "CLOSE_FRIEND": {
        if (args.status === "ACCEPTED") {
          await ctx.db.insert("userFriendships", {
            userAId: invite.sentByUserId,
            userBId: invite.receivedByUserId,
            kind: invite.inviteType,
            createdOn: Date.now(),
          });
        }
        break;
      }

      case "GROUP":
        // Add user to group
        await ctx.db.insert("userGroupRoles", {
          groupId: invite.entityId as Id<"userGroups">,
          userId: currentUserId,
          role: "MEMBER",
          createdOn: Date.now(),
        });
        break;
    }

    return true;
  },
});
