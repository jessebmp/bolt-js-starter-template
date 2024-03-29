// This version responds to @'ing the bot
const { App, LogLevel } = require('@slack/bolt');
const { config } = require('dotenv');
const { registerListeners } = require('./listeners');

config();

/** Initialization */
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: LogLevel.DEBUG,
});

/** Register Listeners */
registerListeners(app);

// First attempt at @'ing the bot
app.event('app_mention', async ({ event, say }) => {
  // You can access the event object here
  // event.text will contain the text of the message
  // event.user will contain the user ID of the user who mentioned your app

  // You can use the say function to send a message to the channel where the app was mentioned
  await say(`Hello <@${event.user}>!`);
});

/** Start Bolt App */
(async () => {
  try {
    await app.start(process.env.PORT || 3000);
    console.log('⚡️ Bolt app is running! ⚡️');
  } catch (error) {
    console.error('Unable to start App', error);
  }
})();