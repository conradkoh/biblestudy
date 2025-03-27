import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

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
