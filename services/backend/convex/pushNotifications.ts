import { getAuthUserId } from "@convex-dev/auth/server";
import { action, mutation } from "./_generated/server";
import { components } from "./_generated/api";
import { v } from "convex/values";
import { PushNotifications } from "@convex-dev/expo-push-notifications";

const pushNotifications = new PushNotifications(components.pushNotifications, {
  logLevel: "DEBUG",
});

export const insertUserNotificationToken = mutation({
  args: {
    token: v.string()
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      return null;
    }

    await pushNotifications.recordToken(ctx, { userId, pushToken: args.token });
  },
});

export const sendPushNotification = mutation({
  args: {
    to: v.id('users'),
    title: v.string(),
    body: v.optional(v.string()),
    data: v.optional(v.object({
      url: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    try {
      const pushId = await pushNotifications.sendPushNotification(ctx, {
        userId: args.to,
        notification: {
          title: args.title,
          body: args.body,
          data: args.data,
        },
      });

      console.log("Push notification sent", pushId);
    } catch (error) {
      console.error("Error sending push notification", error);
    }
  },
});

