// XADON · confess — anonymous confession posted by the bot (sender hidden).
module.exports = {
  name: 'confess',
  alias: ['confession', 'anonconfess'],
  desc: 'Post an anonymous confession here',
  usage: '.confess I actually love Mondays',
  category: 'group',
  group: true,
  async run({ sock, args, m, reply, ui }) {
    const text = args.join(' ').trim();
    if (!text) return reply(ui.notice('info', 'Confess', 'Usage: .confess <your secret>\nThe bot posts it with no name attached.'));
    if (text.length > 800) return reply(ui.notice('error', 'Too long', 'Keep confessions under 800 characters.'));
    try {
      await sock.sendMessage(m.chat, { text: `📩 *Anonymous confession*\n\n_"${text}"_\n\n_Send yours with .confess_` });
    } catch { return reply(ui.notice('error', 'Failed', 'Could not post that confession.')); }
  },
};
