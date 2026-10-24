// XADON AI · RICH — big preview ad card, no emojis.
const botstate = require('../../lib/botstate');
const premium = require('../../lib/premium');
module.exports = {
  name: 'adcard',
  alias: ['adx'],
  desc: 'Big preview card',
  usage: '.adcard <text>',
  category: 'rich',
  async run({ sock, m, text, reply, ui, config }) {
    const { fonts } = ui;
    const body = (text || 'Xadon premium engine').slice(0, 200);
    const card = premium.adCard({ title: botstate.botName(), body, url: config.links.website });
    return sock.sendMessage(m.chat, { text: `◈ ${fonts.bold(botstate.botName())}\n\n${body}\n\n${ui.footer()}`, contextInfo: card }, { quoted: m.raw });
  },
};
