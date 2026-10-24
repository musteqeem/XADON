// XADON AI · setmode (imported format).
module.exports = {
  name: 'setmode',
  aliases: ['botmode'],
  description: 'Switch public/private mode',
  category: 'extra',
  groupOnly: false,
  ownerOnly: false,
  async execute(sock, m, extra) {
    const { args, reply, ui, db } = extra;
    const v = String(args[0] || '').toLowerCase();
    if (!['public', 'private'].includes(v)) return reply(ui.notice('info', 'Set mode', 'Usage: .setmode public | private'));
    db.set('mode', v);
    return reply(ui.notice('success', 'Mode saved', `Bot is now ${v}.`));
  },
};
