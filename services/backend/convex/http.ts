import { parseTelegramPayload, sendMessage } from '@/utils/telegram';
import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import {
  processMessage,
  ProcessMessageParams,
} from '@/features/process-message';

const http = httpRouter();

http.route({
  path: '/onMessage',
  method: 'POST',
  handler: httpAction(async (ctx, req) => {
    const tgMessage = parseTelegramPayload(await req.json());
    const messageText = tgMessage.message?.text;
    const chatId = tgMessage.message?.chat?.id;
    if (!chatId) {
      console.error('No chat id found', tgMessage);
      return new Response(null, { status: 200 });
    }
    if (!messageText) {
      console.error('No message text found', tgMessage);
      return new Response(null, { status: 200 });
    }
    // start processing
    const res = await processMessage(ctx, {
      message: messageText,
    } satisfies ProcessMessageParams);
    await sendMessage(ctx, { chatId }, (tg) => {
      // use the tg builder to create a message response
      return [tg.text(res.message)];
    });

    // always return success - then telegram won't retry failures
    return new Response(null, { status: 200 });
  }),
});

export default http;
