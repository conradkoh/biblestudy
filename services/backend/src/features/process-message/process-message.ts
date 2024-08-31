import type { GenericActionCtx } from 'convex/server';
export type ProcessMessageParams = {
  // userId: string, //reserved for future use
  message: string;
};
export const processMessage = async (
  ctx: GenericActionCtx<any>,
  params: ProcessMessageParams,
) => {
  //TODO: Implement processing logic
  const message = 'Generic response from process message.';
  return {
    message,
  };
};
