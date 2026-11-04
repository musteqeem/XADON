// XADON V10 · AUTO — Send a default welcome in groups without one.
module.exports = {
  name: 'autowelcome',
  alias: ['autowc'],
  desc: 'Send a default welcome in groups without one',
  usage: '.autowelcome on|off',
  owner: true, category: 'owner',
  async run({ args, reply, ui, db }) {
    const a = String(args[0] || '').toLowerCase();
    const cur = !!db.get('autowelcome', false);
    const val = /^(on|1|yes)$/.test(a) ? true : /^(off|0|no)$/.test(a) ? false : !cur;
    db.set('autowelcome', val);
    return reply(ui.notice(val ? 'success' : 'warn', `Auto-welcome ${val ? 'on' : 'off'}`, 'Send a default welcome in groups without one.'));
  },
};
