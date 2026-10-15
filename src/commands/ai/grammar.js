/** XADON V3 · grammar — fix grammar with AI key, offline fallback. */
const { ask } = require('../../lib/ai');
module.exports = { name: 'grammar', alias: ['fixgrammar'], desc: 'Fix grammar & spelling', usage: '.grammar <text>', category: 'ai',
  async run({ m, text, reply, sock, ui }) {
    const q = (text || m.quoted?.body || '').trim();
    if (!q) return reply(ui.notice('info', 'Grammar', 'Send text: .grammar i has went there'));
    try { const { answer } = await ask(m.chat, `Fix grammar and spelling only, return corrected text:\n${q}`); return sock.sendMessage(m.chat, { text: answer }, { quoted: m.raw }); }
    catch { let f = q.replace(/\s+/g, ' ').trim(); f = f.charAt(0).toUpperCase() + f.slice(1); if (!/[.!?]$/.test(f)) f += '.'; return reply(`_*亗 Grammar*_ \n\n${f}\n\n⌬ Add GROQ_API_KEY for full AI check`); }
  } };
