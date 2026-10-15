/** XADON V3 · rewrite — paraphrase with AI key, offline fallback. */
const { ask } = require('../../lib/ai');
module.exports = { name: 'rewrite', alias: ['paraphrase'], desc: 'Rewrite text in new words', usage: '.rewrite <text>', category: 'ai',
  async run({ m, text, reply, sock, ui }) {
    const q = (text || m.quoted?.body || '').trim();
    if (!q) return reply(ui.notice('info', 'Rewrite', 'Send text: .rewrite this movie was great'));
    try { const { answer } = await ask(m.chat, `Rewrite this in fresh premium words, keep meaning:\n${q}`); return sock.sendMessage(m.chat, { text: answer }, { quoted: m.raw }); }
    catch (e) { const words = q.split(/\s+/); return reply(`_*亗 Rewrite*_ \n\n${words.reverse().slice(0, 80).join(' ')}…\n\n⌬ Add GROQ_API_KEY for full AI rewrite`); }
  } };
