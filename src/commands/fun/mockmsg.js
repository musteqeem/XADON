// XADON V7 · mockmsg — mOcKiNg reply quoted from the target.
const fx = require('../../lib/premium-fx');
const mock = (t) => [...t].map((c, i) => (i % 2 ? c.toUpperCase() : c.toLowerCase())).join('');
module.exports = {
  name: 'mockmsg', alias: ['mocking', 'mocksay'], desc: 'Mocking-style spoofed reply', usage: '.mockmsg [@user] <text>', category: 'fun',
  async run({ sock, m, text, reply, ui, target }) {
    try {
      const who = target() || m.quoted?.sender || m.sender;
      const body = mock(text.replace(/@\d+/g, '').trim() || m.quoted?.body || 'i am always right');
      const fake = fx.fakeQuoted(m.chat, { text: body.slice(0, 300), participant: who });
      await sock.sendMessage(m.chat, { text: body.slice(0, 1000) }, { quoted: fake });
    } catch (e) { return reply(ui.notice('error', 'Mock failed', String(e.message || e).slice(0, 200))); }
  },
};
