// XADON AI · enable (imported format).
module.exports = {
  name: 'enable',
  aliases: ['oncmd'],
  description: 'Re-enable a command in this group',
  category: 'extra',
  groupOnly: true,
  ownerOnly: false,
  async execute(sock, m, extra) {
    const { args, reply, ui, db } = extra;
    const n = String(args[0] || '').toLowerCase();
    if (!n) return reply(ui.notice('info', 'Enable', 'Usage: .enable ping'));
    const k = `disabled:${m.chat}`;
    db.set(k, db.get(k, []).filter((x) => x !== n));
    return reply(ui.notice('success', 'Enabled', `.${n} is on in this group.`));
  },
};
