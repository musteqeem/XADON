// XADON V10 · AUTO — Send a default goodbye in groups without one.
module.exports = {
  name: 'autogoodbye',
  alias: ['autogb'],
  desc: 'Send a default goodbye in groups without one',
  usage: '.autogoodbye on|off',
  owner: true, category: 'owner',
  async run({ args, reply, ui, db }) {
    const a = String(args[0] || '').toLowerCase();
    const cur = !!db.get('autogoodbye', false);
    const val = /^(on|1|yes)$/.test(a) ? true : /^(off|0|no)$/.test(a) ? false : !cur;
    db.set('autogoodbye', val);
    return reply(ui.notice(val ? 'success' : 'warn', `Auto-goodbye ${val ? 'on' : 'off'}`, 'Send a default goodbye in groups without one.'));
  },
};
