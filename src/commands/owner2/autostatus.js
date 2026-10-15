// XADON AI · OWNER — premium unicode card, no emojis.
module.exports = {
  name: 'autostatus',
  alias: ['statusx'],
  desc: 'Toggle status watcher',
  usage: '.autostatus on|off',
  owner: true, category: 'owner2',
  async run({ args, reply, ui, db }) {
    const a = String(args[0] || '').toLowerCase();
    const cur = !!db.get('autostatus', false);
    const val = /^(on|1|yes)$/.test(a) ? true : /^(off|0|no)$/.test(a) ? false : !cur;
    db.set('autostatus', val);
    return reply(ui.notice('success', `Status watcher ${val ? 'on' : 'off'}`, 'Stories stay untouched otherwise.'));
  },
};
