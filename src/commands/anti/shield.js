// XADON V11 · PREMIUM PACK — shield: one-tap group protection.
// Arms antikickall + antidemote + antipromote together, disarms together.
// Usage: .shield on | .shield off | .shield status
const { savePolicy, groupPolicy, modeOf } = require('../../message-handler');
module.exports = {
  name: 'shield',
  alias: ['guard', 'protect'],
  desc: 'One-tap guard: antikickall + antidemote + antipromote',
  usage: '.shield on | .shield off | .shield status',
  group: true, admin: true, category: 'anti',
  async run({ sock, m, args, reply, ui }) {
    const p = groupPolicy(m.chat);
    const a = String(args[0] || '').toLowerCase();
    const on = (k) => modeOf(p[k]) !== 'off';
    if (!a || a === 'status' || a === 'info') {
      return reply(ui.card({
        icon: '⛨', title: 'Shield', subtitle: 'premium guard pack',
        rows: [
          ['antikickall', on('antikickall') ? 'ON' : 'off'],
          ['antidemote', on('antidemote') ? 'ON' : 'off'],
          ['antipromote', on('antipromote') ? 'ON' : 'off'],
        ],
        body: '.shield on · .shield off\nArms all three rogue-admin guards at once.',
      }));
    }
    const val = /^(on|enable|yes|1)$/.test(a) ? true : /^(off|disable|no|0)$/.test(a) ? false : !(on('antikickall') && on('antidemote') && on('antipromote'));
    const meta = await sock.groupMetadata(m.chat).catch(() => null);
    savePolicy(m.chat, { antikickall: val, antidemote: val, antipromote: val, groupName: meta?.subject || 'the group' });
    return reply(ui.notice(val ? 'success' : 'warn', `Shield ${val ? 'UP ⛨' : 'DOWN'}`,
      val ? 'antikickall + antidemote + antipromote are all armed.' : 'All three rogue-admin guards are off.'));
  },
};
