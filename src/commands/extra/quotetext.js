// XADON V7 · quotetext — every text layer of a quote as plain text.
const rawstore = require('../../lib/rawstore');
module.exports = {
  name: 'quotetext', alias: ['gettext', 'quoteplain'], desc: 'Plain text of any quote', usage: 'reply to a message with .quotetext', category: 'extra',
  async run({ m, reply, ui }) {
    if (!m.quoted) return reply(ui.notice('info', 'Quote text', 'Reply to a message with .quotetext'));
    let layers = [];
    try {
      const raw = rawstore.get(m.chat, m.quoted.id);
      const inner = raw?.message || {};
      const t = Object.keys(inner)[0] || '';
      const im = inner[t] || {};
      layers = [im.text, im.caption, im.conversation, m.quoted.body].filter((s, i, a) => s && a.indexOf(s) === i);
    } catch { layers = [m.quoted.body]; }
    return reply(ui.card({ icon: '\u275D', title: 'Quote text', subtitle: `${layers.length} text layer(s)`, rows: [], body: layers.map((s, i) => `${i + 1}. ${String(s).slice(0, 600)}`).join('\n\n') || '[no text]' }));
  },
};
