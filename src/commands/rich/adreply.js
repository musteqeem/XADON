// XADON V8 · adreply — fixed External Ad Reply card (visible on all WA versions).
const premium = require('../../lib/premium');
const botstate = require('../../lib/botstate');
module.exports = {
  name: 'adreply', alias: ['admsg', 'adx2'], desc: 'Send ad-preview card message', usage: '.adreply title | body | https://url', category: 'rich',
  async run({ sock, m, text, reply, ui, config }) {
    const parts = String(text || '').split('|').map((s) => s.trim());
    const [title, body, url] = [parts[0] || botstate.botName(), parts[1] || 'Premium WhatsApp engine', parts[2] || config.links.website];
    if (url && !/^https?:\/\/\S+/i.test(url)) return reply(ui.notice('error', 'Bad URL', 'Third part must be a full https:// link.'));
    const card = premium.adCard({ title: title.slice(0, 60), body: body.slice(0, 200), url });
    return sock.sendMessage(m.chat, { text: `◈ ${ui.fonts.bold(title.slice(0, 60))}\n\n${body.slice(0, 1000)}\n\n${ui.footer()}`, contextInfo: card }, { quoted: m.raw });
  },
};
