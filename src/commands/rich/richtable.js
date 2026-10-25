// XADON V7 · richtable — Meta-style markdown + table card.
const fx = require('../../lib/premium-fx');
module.exports = {
  name: 'richtable', alias: ['rtable', 'mtable'], desc: 'Meta-style table card', usage: '.richtable Title | h1,h2; a,b; c,d', category: 'rich',
  async run({ sock, m, text, reply, ui }) {
    try {
      const [title, rest] = (text || '').split('|').map((s) => (s || '').trim());
      const rows = (rest || '').split(';').map((r) => r.split(',').map((c) => c.trim()).filter(Boolean)).filter((r) => r.length);
      if (!rows.length) return reply(ui.notice('info', 'Rich table', 'Usage: .richtable Title | h1,h2; a,b; c,d'));
      await fx.richTable(sock, m.chat, { heading: title || 'Table', intro: '', rows, quoted: m.raw });
    } catch (e) { return reply(ui.notice('error', 'Rich failed', String(e.message || e).slice(0, 200))); }
  },
};
