/** XADON V9 · explain — AI explains anything simply (reply friendly). */
module.exports = {
  name: 'explain',
  alias: ['eli5', 'simplify', 'whatsthis'],
  desc: 'AI explains simply, like I am 5',
  usage: '.explain <topic>  (or reply with .explain)',
  category: 'ai',
  async run({ m, text, reply, ui, prefix }) {
    const { ask } = require('../../lib/ai');
    const q = (text || m.quoted?.body || '').trim();
    if (!q) return reply(ui.notice('info', 'Explain', `Usage: ${prefix}explain photosynthesis\nOr reply to any message with ${prefix}explain`));
    try {
      const { answer, provider } = await ask(m.chat, `Explain this as simply as possible with one everyday example, in under 120 words: ${q.slice(0, 1000)}`);
      return reply(`${answer}\n\n⌬ explained · ${provider}`);
    } catch (e) {
      return reply(ui.notice('error', 'AI offline', String(e.message || e).slice(0, 200)));
    }
  },
};
