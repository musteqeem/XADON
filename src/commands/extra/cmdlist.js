// XADON AI · cmdlist (imported format).
module.exports = {
  name: 'cmdlist',
  aliases: ['cmdoff', 'disabled'],
  description: 'List disabled commands',
  category: 'extra',
  groupOnly: true,
  ownerOnly: false,
  async execute(sock, m, extra) {
    const { reply, ui, db } = extra;
    const off = db.get(`disabled:${m.chat}`, []);
    if (!off.length) return reply(ui.notice('info', 'All on', 'No disabled commands in this group.'));
    return reply(ui.card({ icon: '\u2298', title: 'Disabled commands', subtitle: `${off.length} off`, rows: off.map((x) => ['.' + x, 'off']) }));
  },
};
