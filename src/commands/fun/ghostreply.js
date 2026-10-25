// XADON V7 · ghostreply — text that looks like a reply from someone who never said it.
const fx = require('../../lib/premium-fx');
module.exports = {
  name: 'ghostreply', alias: ['ghostmsg', 'phantom'], desc: 'Ghost reply from another user', usage: '.ghostreply [@user] <text>', category: 'fun',
  async run({ sock, m, text, reply, ui, target }) {
    try {
      const who = target() || m.quoted?.sender || m.sender;
      const body = text.replace(/@\d+/g, '').trim() || 'did you see that?';
      const fake = fx.fakeQuoted(m.chat, { text: body.slice(0, 300), participant: who });
      await sock.sendMessage(m.chat, { text: body.slice(0, 1000) }, { quoted: fake });
    } catch (e) { return reply(ui.notice('error', 'Ghost reply failed', String(e.message || e).slice(0, 200))); }
  },
};
