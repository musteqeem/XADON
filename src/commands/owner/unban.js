module.exports = {
  name: 'unban',
  alias: ['unblockuser', 'pardon'],
  desc: 'Unban a bot user',
  usage: '.unban @user',
  owner: true,
  async run({ reply, ui, target, db }) {
    const jid = target();
    if (!jid) return reply(ui.notice('info', 'Unban', 'Mention, reply to, or type the number to unban.'));
    db.set('banned', db.get('banned', []).filter((x) => x !== jid));
    await reply(ui.notice('success', 'Unbanned', `@${jid.split('@')[0]} can use the bot again.`));
  },
};
