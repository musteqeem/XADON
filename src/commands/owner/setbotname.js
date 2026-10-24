/** XADON V6 · setbotname — POWERFUL live bot name. Updates EVERYWHERE instantly
 * (menus, footers, verified quote card, ad cards) with no restart, and persists
 * to database + .env so it survives restarts. Usage: .setbotname META AI */
const botstate = require('../../lib/botstate');

module.exports = {
  name: 'setbotname', alias: ['setname-bot', 'botname', 'setname'], desc: 'Change bot display name everywhere (instant, no restart)', usage: '.setbotname META AI', category: 'owner', owner: true,
  async run({ text, reply, ui }) {
    const name = (text || '').trim().replace(/\s+/g, ' ').slice(0, 30);
    if (!name) return reply(ui.notice('info', 'Set bot name', `Current: ${botstate.botName()}\nUsage: .setbotname META AI`));
    botstate.setMany({ BOT_NAME: name });
    try {
      const config = require('../../config');
      config.botName = name; // live in-memory too, for any legacy readers
    } catch {}
    return reply(ui.notice('success', 'Bot name updated', `I am now known as ${name} everywhere — menu headers, footers, verified replies.\nSee it live in .menu · no restart needed · saved permanently`));
  },
};
