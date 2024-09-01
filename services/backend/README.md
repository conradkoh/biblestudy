# Backend

## Setting up a dev telegram bot
This is needed because each bot can only send messages to one webhook. With multiple developers, each developer will need their own telegram channel to test.
1. Create a new telegram bot using [@BotFather](https://t.me/BotFather)
2. Generate a webhook secret token
    ```sh
    yarn bun src/utils/telegram/scripts/generate-webhook-secret.ts
    ```
3. Go to the [convex console](https://dashboard.convex.dev/t/conradkoh/biblestudy/strong-pheasant-324/settings/environment-variables) and set the following environment variables:
    - `TELEGRAM_BOT_TOKEN` - this is the token given by BotFather
    - `TELEGRAM_WEBHOOK_SECRET` - this is the secret token generated in step 2

3. Run the `telegram.registerWebhook` function from the [convex console](https://dashboard.convex.dev/t/conradkoh/biblestudy/strong-pheasant-324/functions).

## Setting your dev environment
Go to the [convex console](https://dashboard.convex.dev/t/conradkoh/biblestudy/insightful-lyrebird-945/functions?function=system:install) and run the `system:install` function.

This will load the necessary databases for development.

### Testing
If all these have worked fine, you can test these out by sending a message to the telegram bot.

## Maintenance
### Rotation of TELEGRAM_WEBHOOK_SECRET 
1. Generate a new secret token
    ```sh
    yarn bun src/utils/telegram/scripts/generate-webhook-secret.ts
    ```
2. Install the secret key within the environment variables in the [convex console](https://dashboard.convex.dev/t/conradkoh/biblestudy/strong-pheasant-324/settings/environment-variables).

3. Re-run the `telegram.registerWebhook` function from the [convex console](https://dashboard.convex.dev/t/conradkoh/biblestudy/strong-pheasant-324/functions).