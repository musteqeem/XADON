/** XADON V3 · setbotname — live bot name (also via .setvar BOT_NAME=...). */
const botstate = require('../../lib/botstate');
module.exports = {
  name: 'setbotname', alias: ['setname-bot', 'botname'], desc: 'Change bot display name', usage: '.setbotname META AI', category: 'owner', owner: true,
  async run({ text, reply, ui }) {
    const name = (text || '').trim().slice(0, 30);
    if (!name) return reply(ui.notice('info', 'Set bot name', 'Usage: .setbotname META AI'));
    botstate.setMany({ BOT_NAME: name });
    return reply(ui.notice('success', 'Bot name updated', `Now known as ${name}\nSee it in .menu`));
  },
};
