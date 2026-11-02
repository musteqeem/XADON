/** XADON V9 · chatmemory — inspect / clear the AI conversation memory. */
module.exports = {
  name: 'chatmemory',
  alias: ['aimemory', 'memstatus', 'forgetme'],
  desc: 'Show or clear AI memory for this chat',
  usage: '.chatmemory | .chatmemory clear',
  category: 'ai',
  async run({ m, args, reply, ui }) {
    const ai = require('../../lib/ai');
    const sub = String(args[0] || '').toLowerCase();
    if (sub === 'clear' || sub === 'reset' || sub === 'forget') {
      ai.reset(m.chat);
      return reply(ui.notice('success', 'Memory cleared', 'The AI forgot this conversation. Fresh start.'));
    }
    const turns = typeof ai.size === 'function' ? ai.size(m.chat) : 0;
    return reply(ui.card({
      icon: '◈', title: 'AI memory', subtitle: `this chat remembers ${turns} message(s)`,
      rows: [['memory', turns ? `${turns} turn(s) kept` : 'empty'], ['clear', '.chatmemory clear']],
      body: 'Memory makes follow-up questions smarter:\n.ai who is Messi? → .ai how old is he?',
    }));
  },
};
