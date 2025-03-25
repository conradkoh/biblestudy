import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { PushNotifications } from "@convex-dev/expo-push-notifications";

export const createUserGroup = mutation({
  args: {
    token: v.string()
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      return null;
    }
  },
});

export const createGroupInvitation = mutation({
  args: {
    token: v.string()
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      return null;
    }
  }
});

export const updateGroupInvitation = mutation({
  args: {
    id: v.id('group')
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      return null;
    }
  }
});

export const x = query({
  args: {

  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      return null;
    }
    return 123;
  }
})
