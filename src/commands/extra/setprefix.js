// XADON AI · setprefix (imported format).
module.exports = {
  name: 'setprefix',
  aliases: ['prefix'],
  description: 'Change command prefix',
  category: 'extra',
  groupOnly: false,
  ownerOnly: false,
  async execute(sock, m, extra) {
    const { args, reply, ui, db } = extra;
    const p = String(args[0] || '').trim();
    if (!p || p.length > 3) return reply(ui.notice('info', 'Set prefix', 'Usage: .setprefix !  (1-3 chars)'));
    db.set('prefix', p);
    return reply(ui.notice('success', 'Prefix saved', `New prefix: "${p}" — try ${p}ping`));
  },
};
