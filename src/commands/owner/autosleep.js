// XADON V10 · AUTO — Bot ignores non-owners from 23:00 to 05:00.
module.exports = {
  name: 'autosleep',
  alias: ['botsleep'],
  desc: 'Bot ignores non-owners from 23:00 to 05:00',
  usage: '.autosleep on|off',
  owner: true, category: 'owner',
  async run({ args, reply, ui, db }) {
    const a = String(args[0] || '').toLowerCase();
    const cur = !!db.get('autosleep', false);
    const val = /^(on|1|yes)$/.test(a) ? true : /^(off|0|no)$/.test(a) ? false : !cur;
    db.set('autosleep', val);
    return reply(ui.notice(val ? 'success' : 'warn', `Auto-sleep ${val ? 'on' : 'off'}`, 'Bot ignores non-owners from 23:00 to 05:00.'));
  },
};
