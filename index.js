require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { getWeatherByCity, getForecastByCity } = require("./api.js");
const { defineIconByWeather } = require("./utilities.js");

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
    { command: "/weather", description: "check the weather" },
  ]);
}

function weatherOptions(chatId) {
  bot.sendMessage(chatId, "choose option", {
    reply_markup: {
      resize_keyboard: true,
      one_time_keyboard: true,
      keyboard: [
        ["check weather by city"],
        ["get weather forecast fo specific city"],
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
    bot.sendMessage(
      chatId,
      "in menu below you can click on command  `/weather` and get list of avalailable countries where you can check wetcher"
    );
  }

  if (msg.text && msg.text === "/weather") {
    weatherOptions(chatId);
  }

  if (msg.text && msg.text === "check weather by city") {
    checkWeatherByCity = true;
    bot.sendMessage(chatId, "type city");
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
        bot.sendMessage(chatId, "invalid city");
      } else {
        throw e;
      }
    } finally {
      checkWeatherByCity = false;
      bot.sendMessage(
        chatId,
        "in menu below you can click on command  `/weather` and get list of avalailable countries where you can check wetcher"
      );
    }
  }

  if (msg.text && msg.text === "get weather forecast fo specific city") {
    getForecast = true;
    bot.sendMessage(chatId, "type city");
  } else if (getForecast) {
    try {
      let text = ""
      const data = await getForecastByCity(msg.text);
      data.forEach(day => {
        text += `on date ${day.datetime} max temperature is ${day.max_temp} ${defineIconByWeather(day.max_temp)} and min is ${day.min_temp} ${defineIconByWeather(day.min_temp)} \n`
      })
      bot.sendMessage(
        chatId,
        text 
      ); 
      
    } catch (e) {
      if (e instanceof TypeError) {
        bot.sendMessage(chatId, "invalid city");
      } else {
        console.log(e)

        throw e;
      }
    } finally {
      getForecast = false;
      bot.sendMessage(
        chatId,
        "in menu below you can click on command  `/weather` and get list of avalailable countries where you can check wetcher"
      );
    }
  }

  // send a message to the chat acknowledging receipt of their message
});
