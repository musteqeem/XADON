// XADON AI · OWNER — premium unicode card, no emojis.
module.exports = {
  name: 'autoread',
  alias: ['readx'],
  desc: 'Toggle auto-read',
  usage: '.autoread on|off',
  owner: true, category: 'owner2',
  async run({ args, reply, ui, db }) {
    const a = String(args[0] || '').toLowerCase();
    const cur = !!db.get('autoread', false);
    const val = /^(on|1|yes)$/.test(a) ? true : /^(off|0|no)$/.test(a) ? false : !cur;
    db.set('autoread', val);
    return reply(ui.notice('success', `Auto-read ${val ? 'on' : 'off'}`, 'Receipts follow this switch.'));
  },
};
