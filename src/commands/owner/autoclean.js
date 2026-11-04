// XADON V10 · AUTO — Auto-delete the bot replies after 60 seconds.
module.exports = {
  name: 'autoclean',
  alias: ['autodel'],
  desc: 'Auto-delete the bot replies after 60 seconds',
  usage: '.autoclean on|off',
  owner: true, category: 'owner',
  async run({ args, reply, ui, db }) {
    const a = String(args[0] || '').toLowerCase();
    const cur = !!db.get('autoclean', false);
    const val = /^(on|1|yes)$/.test(a) ? true : /^(off|0|no)$/.test(a) ? false : !cur;
    db.set('autoclean', val);
    return reply(ui.notice(val ? 'success' : 'warn', `Auto-clean ${val ? 'on' : 'off'}`, 'Auto-delete the bot replies after 60 seconds.'));
  },
};
