// XADON AI · setrules (imported format).
module.exports = {
  name: 'setrules',
  aliases: ['ruleset'],
  description: 'Set group rules text',
  category: 'extra',
  groupOnly: true,
  ownerOnly: false,
  async execute(sock, m, extra) {
    const { args, reply, ui, db } = extra;
    if (!args.length) return reply(ui.notice('info', 'Set rules', 'Usage: .setrules no spam, no links...'));
    db.set(`rules:${m.chat}`, args.join(' ').slice(0, 800));
    return reply(ui.notice('success', 'Rules saved', 'Members read them with .rules.'));
  },
};
