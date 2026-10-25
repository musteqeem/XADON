// XADON AI · setbye (imported format).
module.exports = {
  name: 'setbye',
  aliases: ['setgoodbye2'],
  description: 'Set goodbye message',
  category: 'extra',
  groupOnly: true,
  ownerOnly: false,
  async execute(sock, m, extra) {
    const { args, reply, ui, db } = extra;
    const { savePolicy } = require('../../message-handler');
    const t = args.join(' ').trim();
    if (!t) return reply(ui.notice('info', 'Set bye', 'Usage: .setbye Goodbye @user, see you soon!'));
    savePolicy(m.chat, { goodbye: true, goodbyeText: t.slice(0, 400) });
    db.set(`goodbye:${m.chat}`, t.slice(0, 400));
    return reply(ui.notice('success', 'Goodbye saved', t.slice(0, 200)));
  },
};
