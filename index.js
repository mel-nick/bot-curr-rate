const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const config = require('./config.json');

const token = config.token;
const bot = new TelegramBot(token, {
  polling: true,
  filepath: false
});
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `Добро пожаловать в <b>RateBot</b>!
  
Доступные команды:

/rate Покажет актульньный курс валют ПриватБанка
`, {
      parse_mode: "HTML"
    }
  );
});
bot.onText(/\/rate/, (msg, match) => {

  const chatId = msg.chat.id;

  bot.sendMessage(chatId, 'Выберите валюту', {
    reply_markup: {
      inline_keyboard: [
        [{
          text: '€ - EUR',
          callback_data: 'EUR'
        }, {
          text: '$ - USD',
          callback_data: 'USD'
        }, {
          text: '₿ - BTC',
          callback_data: 'BTC'
        }]
      ]
    }
  });
});

bot.on('callback_query', query => {
  const id = query.message.chat.id;

  axios.get('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5')
    .then(res => {
      const result = res.data.filter(item => item.ccy === query.data)[0];
      const flag = {
        'EUR': '🇪🇺',
        'USD': '🇺🇸',
        'UAH': '🇺🇦',
        'BTC': '₿'
      }
      let md = `
        *${flag[result.ccy]} ${result.ccy} 🔄 ${result.base_ccy} ${flag[result.base_ccy]}*
        Buy: _${result.buy}_
        Sale: _${result.sale}_
      `;
      bot.sendMessage(id, md, {
        parse_mode: 'Markdown'
      });
    })
    .catch(error => console.error('fetch error', error));
})