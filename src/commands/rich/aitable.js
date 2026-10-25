// XADON V7 · aitable — fact sheet card (fact: value lines).
const fx = require('../../lib/premium-fx');
module.exports = {
  name: 'aitable', alias: ['factsheet', 'factcard'], desc: 'AI fact-sheet card', usage: '.aitable Topic | fact: value; fact2: value2', category: 'rich',
  async run({ sock, m, text, reply, ui }) {
    try {
      const [topic, rest] = (text || '').split('|').map((s) => (s || '').trim());
      const rows = [['Fact', 'Detail']];
      for (const line of (rest || '').split(';')) { const i = line.indexOf(':'); if (i > 0) rows.push([line.slice(0, i).trim(), line.slice(i + 1).trim()]); }
      if (rows.length < 2) return reply(ui.notice('info', 'Fact sheet', 'Usage: .aitable Match day | score: 2-1; venue: Lagos; MVP: Saka'));
      await fx.richTable(sock, m.chat, { heading: topic || 'Facts', intro: '', rows, quoted: m.raw });
    } catch (e) { return reply(ui.notice('error', 'Rich failed', String(e.message || e).slice(0, 200))); }
  },
};
