// XADON V7 · fakequote — voice note that looks quoted from someone else.
const fx = require('../../lib/premium-fx');
module.exports = {
  name: 'fakequote', alias: ['fakeq', 'voicefake'], desc: 'Fake-quoted voice note (spoof)', usage: '.fakequote [@user] <text> (or reply)', category: 'fun',
  async run({ sock, m, args, text, reply, ui, target }) {
    try {
      const who = target() || m.quoted?.sender || m.sender;
      let body = text.replace(/@\d+/g, '').trim() || m.quoted?.body || 'hello there';
      const audio = await fx.ttsBuffer(body.slice(0, 180));
      const fake = fx.fakeQuoted(m.chat, { text: `@${String(who).split('@')[0]}: ${body}`.slice(0, 200), participant: who });
      await sock.sendMessage(m.chat, { audio, mimetype: 'audio/mpeg', ptt: false }, { quoted: fake });
    } catch (e) { return reply(ui.notice('error', 'Fake quote failed', String(e.message || e).slice(0, 200))); }
  },
};
