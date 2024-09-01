import { internal } from 'convex/_generated/api';
import { internalAction } from 'convex/_generated/server';

/**
 * Runs the system installation to set up the database
 */
export const install = internalAction({
  args: {},
  handler: async (ctx, args) => {
    await ctx.runAction(internal.bible._importKJV);
  },
});
