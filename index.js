require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { getWeatherByCity, getForecastByCity } = require("./api.js");
const { defineIconByWeather } = require("./utilities.js");

const text = require("./text.json");

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.telegram_token;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

let checkWeatherByCity = false;
let getForecast = false;

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
    { command: "/weather", description: text.commands.weather },
  ]);
}

function weatherOptions(chatId) {
  bot.sendMessage(chatId, text.messages.choose, {
    reply_markup: {
      resize_keyboard: true,
      one_time_keyboard: true,
      keyboard: [
        [text.messages.check_weather.current],
        [text.messages.check_weather.forecast],
      ],
    },
  });
}

// Listen for any kind of message. There are different kinds of
// messages.
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  if (msg.text && msg.text === "/start") {
    initBot();
    bot.sendMessage(chatId, text.messages.start_message);
  }

  if (msg.text && msg.text === "/weather") {
    weatherOptions(chatId);
  }

  if (msg.text && msg.text === text.messages.check_weather.current) {
    checkWeatherByCity = true;
    bot.sendMessage(chatId, text.messages.type_city);
  } else if (checkWeatherByCity) {
    try {
      const data = await getWeatherByCity(msg.text);
      bot.sendMessage(
        chatId,
        `the current  temperature is ${data.temp} ${defineIconByWeather(
          data.temp
        )}`
      );
      console.log(data);
    } catch (e) {
      if (e instanceof TypeError) {
        bot.sendMessage(chatId, text.messages.invalid_city);
      } else {
        throw e;
      }
    } finally {
      checkWeatherByCity = false;
      bot.sendMessage(chatId, text.messages.start_message);
    }
  }

  if (msg.text && msg.text === text.messages.check_weather.forecast) {
    getForecast = true;
    bot.sendMessage(chatId, text.messages.type_city);
  } else if (getForecast) {
    try {
      let text = "";
      const data = await getForecastByCity(msg.text);
      data.forEach((day) => {
        text += `on date ${day.datetime} max temperature is ${
          day.max_temp
        } ${defineIconByWeather(day.max_temp)} and min is ${
          day.min_temp
        } ${defineIconByWeather(day.min_temp)} \n`;
      });
      bot.sendMessage(chatId, text);
    } catch (e) {
      if (e instanceof TypeError) {
        bot.sendMessage(chatId, text.messages.invalid_city);
      } else {
        console.log(e);

        throw e;
      }
    } finally {
      getForecast = false;
      bot.sendMessage(chatId, text.messages.start_message);
    }
  }

  // send a message to the chat acknowledging receipt of their message
});
