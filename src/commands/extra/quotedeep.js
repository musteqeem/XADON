// XADON V7 · quotedeep — fetch the EXACT quoted payload incl. nested quotes.
const rawstore = require('../../lib/rawstore');
module.exports = {
  name: 'quotedeep', alias: ['deepquote', 'innerquote'], desc: 'Fetch exact + nested quoted content', usage: 'reply to a message with .quotedeep', category: 'extra',
  async run({ m, reply, ui }) {
    if (!m.quoted) return reply(ui.notice('info', 'Quote deep', 'Reply to a message with .quotedeep'));
    let innerType = '-', innerBody = '-', hasNested = 'no';
    try {
      const raw = rawstore.get(m.chat, m.quoted.id);
      const inner = raw?.message;
      if (inner) {
        let B = null;
        try { B = require('@musteqeem/baileys'); } catch {}
        innerType = B?.getContentType ? (B.getContentType(inner) || m.quoted.type) : m.quoted.type;
        const im = inner[innerType] || {};
        const ctx = im.contextInfo || {};
        hasNested = ctx.quotedMessage ? 'yes' : 'no';
        innerBody = (im.text || im.caption || im.conversation || ctx.quotedMessage && '[nested quote present]' || m.quoted.body || '').toString().slice(0, 800);
      }
    } catch {}
    return reply(ui.card({ icon: '\u275D', title: 'Deep quote', subtitle: 'exact payload lookup', rows: [['quoted id', String(m.quoted.id).slice(0, 24)], ['quoted type', innerType || m.quoted.type], ['quoted from', '@' + String(m.quoted.sender).split('@')[0]], ['nested quote', hasNested]], body: String(innerBody || m.quoted.body || '[no text]').slice(0, 800) }));
  },
};
