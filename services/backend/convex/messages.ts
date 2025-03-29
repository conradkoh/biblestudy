import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { sendPushNotification } from "pushNotifications";
import { api } from "_generated/api";

export const getMessages = query({
  args: {
    senderId: v.id("users"),
    receiverId: v.union(v.id("users"), v.id("userGroups")),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Unauthenticated");
    }

    if (args.senderId !== currentUserId && args.receiverId !== currentUserId) throw new Error('Unauthorized');
    const messages = await ctx.db.query("messages").filter(q => q.eq(q.field("senderId"), args.senderId)).filter(q => q.eq(q.field("receiverId"), args.receiverId)).collect();
    return messages;
  },
});

export const sendMessage = mutation({
  args: {
    receiverId: v.union(v.id("users"), v.id("userGroups")),
    content: v.string(),
    kind: v.union(v.literal("CHAT"), v.literal("POKE"), v.literal("PRAYER")),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Unauthenticated");
    }

    const sender = await ctx.db.get(currentUserId);
    if (!sender) throw new Error('Sender not found');

    const message = await ctx.db.insert("messages", {
      senderId: currentUserId,
      receiverId: args.receiverId,
      content: args.content,
      kind: args.kind,
      createdAt: Date.now(),
    });

    // Make sure id is user id (and not group id)
    const receiverUserId = ctx.db.normalizeId('users', args.receiverId);
    if (sender.username && receiverUserId) {

      switch (args.kind) {
        case 'POKE': {
          await ctx.runMutation(api.pushNotifications.sendPushNotification, {
            title: sender.username,
            to: receiverUserId,
            body: 'Poked you to read your bible',
            data: {
              url: 'read-screen',
            },
          });
          break;
        }
        case 'PRAYER': {
          await ctx.runMutation(api.pushNotifications.sendPushNotification, {
            title: `${sender.username} left you a prayer`,
            to: receiverUserId,
            body: args.content,
            data: {
              url: 'friends-screen',
            },
          });
          break;
        }

        default: {
          await ctx.runMutation(api.pushNotifications.sendPushNotification, {
            title: sender.username,
            to: receiverUserId,
            body: args.content,
          });
        }
      }
    }

    // TODO: implement push notifications for group messages

    return message;
  },
});
