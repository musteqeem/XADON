// XADON V11 · kicklog: mirror every leave/kick/promote/demote to the owner DM.
// Usage: .kicklog on | .kicklog off | .kicklog status
const { groupPolicy } = require('../../message-handler');
module.exports = {
  name: 'kicklog',
  alias: ['leavelog', 'kicklogs'],
  desc: 'Mirror member events to owner DM (on|off)',
  usage: '.kicklog on | .kicklog off | .kicklog status',
  group: true, admin: true, category: 'owner',
  async run({ m, args, reply, ui, db }) {
    const key = `kicklog:${m.chat}`;
    const cur = !!db.get(key, false);
    const a = String(args[0] || '').toLowerCase();
    if (!a || a === 'status' || a === 'info') {
      return reply(ui.card({
        icon: '◉', title: 'Kicklog', subtitle: cur ? 'MIRRORING TO OWNER DM' : 'off',
        rows: [['mirror', cur ? 'ON' : 'off'], ['events', 'leave · kick · promote · demote']],
        body: '.kicklog on · .kicklog off',
      }));
    }
    const val = /^(on|enable|yes|1)$/.test(a) ? true : /^(off|disable|no|0)$/.test(a) ? false : !cur;
    db.set(key, val);
    void groupPolicy;
    return reply(ui.notice(val ? 'success' : 'warn', `Kicklog ${val ? 'ON' : 'OFF'}`,
      val ? 'Every leave/kick/promote/demote lands in the owner DM.' : 'Owner DM mirror paused.'));
  },
};
