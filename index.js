require('dotenv').config()
const TelegramBot = require("node-telegram-bot-api");

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.telegram_token;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

function initBot() {
  bot.setMyCommands([
    { command: "/start", description: "start" },
    { command: "/weather", description: "check the weather" },
  ]);
}

function weatherOptions(chatId) {
  bot.sendMessage(chatId, "asdad", {
    reply_markup: {
      resize_keyboard: true,
      one_time_keyboard: true,
      keyboard: [["8 popular countries"], ["chech weather by country name"]],
    },
  });
}

// Listen for any kind of message. There are different kinds of
// messages.
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  if (msg.text && msg.text === "/start") {
    initBot();
    bot.sendMessage(
      chatId,
      "in menu below you can click on command  `/weather` and get list of avalailable countries where you can check wetcher"
    );
  }

  if (msg.text && msg.text === "/weather") {
    weatherOptions(chatId);
  }

  // send a message to the chat acknowledging receipt of their message
});
