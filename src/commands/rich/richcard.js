// XADON V7 · richcard — markdown heading card.
const fx = require('../../lib/premium-fx');
module.exports = {
  name: 'richcard', alias: ['markdown', 'mdcard'], desc: 'Markdown-style rich card', usage: '.richcard Title | body text', category: 'rich',
  async run({ sock, m, text, reply, ui }) {
    try {
      const [title, body] = (text || '').split('|').map((s) => (s || '').trim());
      if (!title) return reply(ui.notice('info', 'Rich card', 'Usage: .richcard Launch day | We ship at noon'));
      await fx.richTable(sock, m.chat, { heading: title, intro: body || '', rows: [], quoted: m.raw });
    } catch (e) { return reply(ui.notice('error', 'Rich failed', String(e.message || e).slice(0, 200))); }
  },
};
