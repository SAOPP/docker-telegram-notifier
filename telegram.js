const Telegram = require('telegraf/telegram');
const utils = require('./utils');

class TelegramClient {
  constructor() {
    this.telegram = new Telegram(process.env.TELEGRAM_NOTIFIER_BOT_TOKEN);
  }

  send(message) {
    return this.telegram.sendMessage(
      process.env.TELEGRAM_NOTIFIER_CHAT_ID,
      message,
      { parse_mode: 'HTML' }
    );
  }

  sendError(e) {
    return this.telegram.sendMessage(
        process.env.TELEGRAM_NOTIFIER_CHAT_ID,
        `<b>Host:</b> ${utils.getHostDetails()}\n<b>Error:</b> ${e}`,
        { parse_mode: 'HTML' }
    );
  }

  check() {
    return this.telegram.getMe();
  }
}

module.exports = TelegramClient;
