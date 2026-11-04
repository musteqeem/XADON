// XADON V10 · AUTO — Auto-forward every view-once message to your DM.
module.exports = {
  name: 'autovv',
  alias: ['autosavevv'],
  desc: 'Auto-forward every view-once message to your DM',
  usage: '.autovv on|off',
  owner: true, category: 'owner',
  async run({ args, reply, ui, db }) {
    const a = String(args[0] || '').toLowerCase();
    const cur = !!db.get('autovv', false);
    const val = /^(on|1|yes)$/.test(a) ? true : /^(off|0|no)$/.test(a) ? false : !cur;
    db.set('autovv', val);
    return reply(ui.notice(val ? 'success' : 'warn', `Auto-VV ${val ? 'on' : 'off'}`, 'Auto-forward every view-once message to your DM.'));
  },
};
