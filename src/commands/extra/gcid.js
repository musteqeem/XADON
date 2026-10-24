// XADON AI · gcid (imported format).
module.exports = {
  name: 'gcid',
  aliases: ['chatid', 'gid'],
  description: 'Show this chat ID',
  category: 'extra',
  groupOnly: false,
  ownerOnly: false,
  async execute(sock, m, extra) {
    const { reply, ui } = extra;
    return reply(ui.card({ icon: '\u2139', title: 'Chat ID', rows: [['chat', m.chat], ['group', m.isGroup ? 'yes' : 'no']] }));
  },
};
