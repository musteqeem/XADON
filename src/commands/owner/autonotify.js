// XADON V10 · AUTO — DM you a snippet whenever you are tagged.
module.exports = {
  name: 'autonotify',
  alias: ['autotag'],
  desc: 'DM you a snippet whenever you are tagged',
  usage: '.autonotify on|off',
  owner: true, category: 'owner',
  async run({ args, reply, ui, db }) {
    const a = String(args[0] || '').toLowerCase();
    const cur = !!db.get('autonotify', false);
    const val = /^(on|1|yes)$/.test(a) ? true : /^(off|0|no)$/.test(a) ? false : !cur;
    db.set('autonotify', val);
    return reply(ui.notice(val ? 'success' : 'warn', `Auto-notify ${val ? 'on' : 'off'}`, 'DM you a snippet whenever you are tagged.'));
  },
};
