// XADON V7 · faketts — TTS voice in any accent, fake-quoted.
const fx = require('../../lib/premium-fx');
module.exports = {
  name: 'faketts', alias: ['fakelang', 'accentsay'], desc: 'TTS voice note in any language', usage: '.faketts <lang> <text> (e.g. .faketts ar hello)', category: 'fun',
  async run({ sock, m, args, text, reply, ui, target }) {
    try {
      const lang = /^[a-z-]{2,8}$/i.test(args[0] || '') ? args.shift().toLowerCase() : 'en';
      const body = args.join(' ').trim() || 'hello from xadon';
      const audio = await fx.ttsBuffer(body.slice(0, 180), lang);
      const who = target() || m.quoted?.sender || m.sender;
      const fake = fx.fakeQuoted(m.chat, { text: body.slice(0, 200), participant: who });
      await sock.sendMessage(m.chat, { audio, mimetype: 'audio/mpeg', ptt: true }, { quoted: fake });
    } catch (e) { return reply(ui.notice('error', 'TTS failed', String(e.message || e).slice(0, 200))); }
  },
};
