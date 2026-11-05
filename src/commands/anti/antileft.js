// XADON V11 · ANTI — antileft: announce every leave/kick with style.
// Complements .listleft/.listkicked (which keep the persistent logs).
// Usage: .antileft on | .antileft off | .antileft status
const { savePolicy, groupPolicy, modeOf } = require('../../message-handler');
module.exports = {
  name: 'antileft',
  alias: ['leavenotice', 'leftalert'],
  desc: 'Announce every member leave/kick (on|off|status)',
  usage: '.antileft on | .antileft off | .antileft status',
  group: true, admin: true, category: 'anti',
  async run({ sock, m, args, reply, ui }) {
    const cur = modeOf(groupPolicy(m.chat).antileft);
    const a = String(args[0] || '').toLowerCase();
    if (!a || a === 'status' || a === 'info') {
      return reply(ui.card({
        icon: '◈', title: 'Anti Left', subtitle: cur === 'off' ? 'OFF' : 'ON',
        rows: [['mode', cur === 'off' ? 'off' : 'armed'], ['logs', '.listleft · .listkicked']],
        body: '.antileft on · .antileft off\nEvery exit is announced + stored for the lists.',
      }));
    }
    let val;
    if (/^(on|enable|yes|1)$/.test(a)) val = true;
    else if (/^(off|disable|no|0)$/.test(a)) val = false;
    else val = cur === 'off' ? true : false;
    const meta = await sock.groupMetadata(m.chat).catch(() => null);
    savePolicy(m.chat, { antileft: val, groupName: meta?.subject || 'the group' });
    return reply(ui.notice(val ? 'success' : 'warn', `Anti Left ${val ? 'ON' : 'OFF'}`,
      val ? 'Every leave/kick will be announced and logged.' : 'Leave announcements disabled (logs still kept).'));
  },
};
