// XADON V7 · airich — AI-style streaming rich answer.
const fx = require('../../lib/premium-fx');
module.exports = {
  name: 'airich', alias: ['aisay', 'richsay'], desc: 'AI-style rich streaming reply', usage: '.airich <text>', category: 'fun',
  async run({ sock, m, text, reply, ui }) {
    const body = (text || '').trim();
    if (!body) return reply(ui.notice('info', 'AI rich', 'Usage: .airich the moon is beautiful tonight'));
    try {
      await fx.aiRich(sock, m.chat, { heading: require('../../lib/botstate').botName(), text: body.slice(0, 1200), quoted: m.raw });
    } catch (e) { return reply(ui.notice('error', 'AI rich failed', String(e.message || e).slice(0, 200))); }
  },
};
