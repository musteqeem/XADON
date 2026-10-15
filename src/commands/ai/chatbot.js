/** XADON V3 · chatbot — quick AI chat (uses lib/ai keys). */
const { ask } = require('../../lib/ai');
module.exports = { name: 'chatbot', alias: ['xadonchat', 'aichat'], desc: 'Chat with XADON AI', usage: '.chatbot hello', category: 'ai',
  async run({ m, text, reply, sock, ui }) {
    const q = (text || m.quoted?.body || '').trim();
    if (!q) return reply(ui.notice('info', 'Chatbot', 'Say hi: .chatbot who are you?'));
    try { const { answer, provider } = await ask(m.chat, q); return sock.sendMessage(m.chat, { text: `${answer}\n\n⌬ ${provider}` }, { quoted: m.raw }); }
    catch (e) { return reply(ui.notice('error', 'Chatbot offline', String(e.message).slice(0, 200))); }
  } };
