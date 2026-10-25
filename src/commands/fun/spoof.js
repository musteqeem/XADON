// XADON V7 · spoof — spoofed quoted announcement.
const fx = require('../../lib/premium-fx');
module.exports = {
  name: 'spoof', alias: ['spoofmsg', 'fakeannounce'], desc: 'Spoofed quoted announcement', usage: '.spoof <fake quoted text> | <your message>', category: 'fun',
  async run({ sock, m, text, reply, ui, target }) {
    try {
      const [fakePart, realPart] = text.split('|').map((s) => (s || '').trim());
      const who = target() || m.quoted?.sender || m.sender;
      const fake = fx.fakeQuoted(m.chat, { text: (fakePart || 'official announcement').slice(0, 300), participant: who });
      await sock.sendMessage(m.chat, { text: (realPart || 'confirmed ✓').slice(0, 1000) }, { quoted: fake });
    } catch (e) { return reply(ui.notice('error', 'Spoof failed', String(e.message || e).slice(0, 200))); }
  },
};
