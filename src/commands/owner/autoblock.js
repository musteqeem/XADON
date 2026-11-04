// XADON V10 · AUTO — Automatically block strangers who DM the bot.
module.exports = {
  name: 'autoblock',
  alias: ['autoblk'],
  desc: 'Automatically block strangers who DM the bot',
  usage: '.autoblock on|off',
  owner: true, category: 'owner',
  async run({ args, reply, ui, db }) {
    const a = String(args[0] || '').toLowerCase();
    const cur = !!db.get('autoblock', false);
    const val = /^(on|1|yes)$/.test(a) ? true : /^(off|0|no)$/.test(a) ? false : !cur;
    db.set('autoblock', val);
    return reply(ui.notice(val ? 'success' : 'warn', `Auto-block ${val ? 'on' : 'off'}`, 'Automatically block strangers who DM the bot.'));
  },
};
