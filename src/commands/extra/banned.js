// XADON AI · banned (imported format).
module.exports = {
  name: 'banned',
  aliases: ['banlist', 'listbanned'],
  description: 'List banned users',
  category: 'extra',
  groupOnly: false,
  ownerOnly: true,
  async execute(sock, m, extra) {
    const { reply, ui, db } = extra;
    const list = db.get('banned', []);
    if (!list.length) return reply(ui.notice('info', 'Nobody banned', 'The ban list is empty.'));
    const rows = list.slice(0, 25).map((j) => ['@' + String(j).split('@')[0], 'banned']);
    return reply(ui.card({ icon: '\u2298', title: 'Banned users', subtitle: `${list.length} banned`, rows }), { mentions: list.slice(0, 25) });
  },
};
