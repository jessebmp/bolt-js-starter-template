// This version responds to @'ing the bot
const { App, LogLevel } = require('@slack/bolt');
const { config } = require('dotenv');
const { registerListeners } = require('./listeners');

config();

let Soul, said;
let sayFunction = null;

/** Initialization */
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: LogLevel.DEBUG,
});

/** Register Listeners */
registerListeners(app);

// Dynamic import for soul engine modules
import("soul-engine/soul").then((module) => {
  Soul = module.Soul;
  said = module.said;

  // Create a new instance of Soul with a unique identifier
  const soul = new Soul({
    organization: "jessebmp",
    blueprint: "time-bandit",
  });

  // Listen for and handle responses from the soul
  soul.on("says", async ({ content }) => {
    console.log("Time Bandit said:", await content());
    if (sayFunction) {
      await sayFunction(await content());
    }
  });

  // Connect to the soul engine
  soul.connect().then(() => {
    console.log("Soul connection established.");
  }).catch(console.error);

  // Event handler for bot mentions
  app.event('app_mention', async ({ event, context, say, client }) => {
    // Prevent the bot from responding to its own messages
    if (event.user === 'U06RJ5DGPS8') {
      console.log('Skipping responding to self.');
      return;
    }

    // Fetch user profile information
    const result = await client.users.info({ user: event.user });
    const username = result.user.real_name;

    // Determine if the mention was in a thread
    const thread_ts = event.thread_ts || event.ts;

    // Dispatch the message with the user's real name
    soul.dispatch(said(username, event.text));

    // Update sayFunction to respond in the correct thread
    sayFunction = (message) => say({ text: message, thread_ts: thread_ts });
  });
}).catch(console.error);

/** Start the Bolt App */
(async () => {
  try {
    await app.start(process.env.PORT || 3000);
    console.log('⚡️ Bolt app is running! ⚡️');
  } catch (error) {
    console.error('Unable to start App:', error);
  }
})();
