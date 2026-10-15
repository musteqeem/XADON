module.exports = {
  name: 'ban',
  alias: ['blockuser', 'banuser'],
  desc: 'Ban a user from the bot',
  usage: '.ban @user  |  reply with .ban',
  owner: true,
  async run({ reply, ui, target, db, m }) {
    const jid = target();
    if (!jid) return reply(ui.notice('info', 'Ban', 'Mention, reply to, or type the number to ban.'));
    const banned = db.get('banned', []);
    if (!banned.includes(jid)) { banned.push(jid); db.set('banned', banned); }
    await reply(ui.notice('success', 'Banned', `@${jid.split('@')[0]} can no longer use the bot.`));
  },
};
