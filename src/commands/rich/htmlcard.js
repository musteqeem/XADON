// XADON AI · RICH — HTML-style card with link preview, no emojis.
const premium = require('../../lib/premium');
module.exports = {
  name: 'htmlcard',
  alias: ['htmlx'],
  desc: 'HTML-style link card',
  usage: '.htmlcard <title> | <url>',
  category: 'rich',
  async run({ sock, m, text, reply, ui, prefix }) {
    const { fonts } = ui;
    const [title, url] = text.split('|').map((s) => (s || '').trim());
    if (!title || !/^https?:\/\/\S+/i.test(url || '')) return reply(ui.notice('info', 'HTML card', `${fonts.mono(`${prefix}htmlcard Xadon site | https://github.com/musteqeem/baileys`)}`));
    const card = premium.adCard({ title: title.slice(0, 60), body: new URL(url).hostname, url });
    return sock.sendMessage(m.chat, { text: `◈ ${fonts.bold(title.slice(0, 60))}\n${fonts.mono(url)}\n\n${ui.footer()}`, contextInfo: card }, { quoted: m.raw });
  },
};
