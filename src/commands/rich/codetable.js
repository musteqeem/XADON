// XADON V7 · codetable — syntax-tokenized code card.
const fx = require('../../lib/premium-fx');
module.exports = {
  name: 'codetable', alias: ['codecard', 'richcode'], desc: 'Code block as rich card', usage: '.codetable [lang] <code> (or reply)', category: 'rich',
  async run({ sock, m, args, text, reply, ui }) {
    try {
      let lang = 'javascript', code = text;
      if (/^[a-z+#]{1,12}$/i.test(args[0] || '') && args.length > 1) { lang = args.shift().toLowerCase(); code = args.join(' '); }
      if (!code && m.quoted?.body) code = m.quoted.body;
      if (!code) return reply(ui.notice('info', 'Code card', 'Usage: .codetable js const a = 1'));
      await fx.richTable(sock, m.chat, { heading: `Code · ${lang}`, intro: '', rows: [], code, quoted: m.raw });
      void lang;
    } catch (e) { return reply(ui.notice('error', 'Rich failed', String(e.message || e).slice(0, 200))); }
  },
};
