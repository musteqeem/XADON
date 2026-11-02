/**
 * XADON V9 · chatbot — smarter quick chat.
 * - remembers conversation (lib/ai memory, longer window)
 * - understands replies + group context (who asked, quoted text)
 * - auto provider failover + offline brain, so it ALWAYS answers
 * - typing presence while thinking
 */
const { ask } = require('../../lib/ai');
module.exports = {
  name: 'chatbot',
  alias: ['xadonchat', 'aichat', 'cb'],
  desc: 'Chat with XADON AI (always answers)',
  usage: '.chatbot hello  |  reply with .chatbot',
  category: 'ai',
  async run({ m, text, reply, sock, ui, prefix }) {
    const q = [text, m.quoted?.body && `They replied to: \"${m.quoted.body.slice(0, 300)}\"`].filter(Boolean).join('\n').trim();
    if (!q) return reply(ui.notice('info', 'Chatbot', `Say hi: ${prefix}chatbot who are you?\nTip: turn on ${prefix}smartai on and I will reply automatically when tagged.`));
    try { await sock.sendPresenceUpdate('composing', m.chat).catch(() => {}); } catch {}
    try {
      const prompt = m.isGroup
        ? `${m.pushName || 'Someone'} says: ${q.slice(0, 1500)}`
        : q.slice(0, 2000);
      const { answer, provider } = await ask(m.isGroup ? `${m.chat}:${m.number}` : m.chat, prompt);
      return sock.sendMessage(m.chat, { text: `${answer}\n\n⌬ ${provider}` }, { quoted: m.raw });
    } catch (e) {
      return reply(ui.notice('error', 'Chatbot offline', String(e.message || e).slice(0, 200)));
    } finally {
      try { await sock.sendPresenceUpdate('paused', m.chat).catch(() => {}); } catch {}
    }
  },
};
