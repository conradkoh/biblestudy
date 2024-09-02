import { internal } from 'convex/_generated/api';
import { internalAction } from 'convex/_generated/server';
import { DateTime } from 'luxon';

/**
 * Runs the system installation to set up the database
 */
export const install = internalAction({
  args: {},
  handler: async (ctx, args) => {
    const startTimeTs = DateTime.now().toMillis();
    const actions: string[] = [];
    const errors: string[] = [];
    let exception: Error | undefined = undefined;
    // process tasks
    try {
      //1. import kjv
      await ctx.runAction(internal.bible._importKJV);
      actions.push('Imported KJV');
    } catch (err) {
      errors.push('Failed to import KJV');
      if (err instanceof Error) {
        exception = err;
      }
    }
    const endTimeTs = DateTime.now().toMillis();
    return {
      actions,
      errors: errors.length === 0 ? null : errors,
      duration: endTimeTs - startTimeTs,
      exception: exception ? exception.message : undefined,
    };
  },
});
