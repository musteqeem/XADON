// XADON AI · delvar (imported format).
module.exports = {
  name: 'delvar',
  aliases: ['rmvar', 'unsetvar'],
  description: 'Delete a bot variable',
  category: 'extra',
  groupOnly: false,
  ownerOnly: true,
  async execute(sock, m, extra) {
    const { args, reply, ui, db } = extra;
    const key = String(args[0] || '').toUpperCase().trim();
    if (!key) return reply(ui.notice('info', 'Del var', 'Usage: .delvar BOT_FONT'));
    db.delete(key);
    return reply(ui.notice('success', 'Deleted', `${key} removed from the database. Restart applies .env defaults.`));
  },
};
