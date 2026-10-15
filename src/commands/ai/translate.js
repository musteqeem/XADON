/** XADON V3 · translate — fixed engine: Google → MyMemory → Libre. 100+ langs. */
const { translate, LANGS, normLang } = require('../../lib/translate');

module.exports = {
  name: 'translate',
  alias: ['tr', 'trt'],
  desc: 'Translate any text (100+ languages)',
  usage: '.translate fr | hello how are you  ·  .translate es hola',
  category: 'ai',
  async run({ m, args, text, reply, sock, ui, prefix }) {
    const { fonts } = ui;
    let target = 'en';
    let query = (text || '').trim();
    const pipe = query.split('|');
    if (pipe.length >= 2) { target = (pipe[0].trim().split(/\s+/)[0] || 'en'); query = pipe.slice(1).join('|').trim(); }
    else if (/^[a-z]{2,5}([\s\-]|$)/i.test(query) && args.length >= 2) { target = args.shift(); query = args.join(' '); }
    if (!query) query = (m.quoted?.body || '').trim();
    if (!query) return reply(ui.notice('info', 'Translate', `${fonts.mono(`${prefix}translate fr | hello how are you`)}\n${fonts.smallCaps('or reply with')} ${fonts.mono(`${prefix}translate es`)}\n${fonts.smallCaps('see all:')} ${fonts.mono(`${prefix}setlang list`)}`));
    const t = normLang(target);
    if (!t) return reply(ui.notice('error', 'Unknown language', `'${target}' is not supported. Try ${fonts.mono(`${prefix}setlang list`)}`));
    try {
      const r = await translate(query, t);
      const name = LANGS[r.target] || r.target;
      return sock.sendMessage(m.chat, {
        text: `◐ *TRANSLATE* · auto → ${name}\n${'─'.repeat(22)}\n${r.text.slice(0, 1500)}\n\n⌬ XADON AI · ${r.engine}`,
        nativeFlow: [{ text: '⎙ Copy translation', copy: r.text.slice(0, 1000) }]
      }, { quoted: m.raw });
    } catch (e) {
      return reply(ui.notice('error', 'Translate failed', `All engines are busy. Try again shortly.\n${fonts.mono(String(e.message).slice(0, 120))}`));
    }
  },
};
