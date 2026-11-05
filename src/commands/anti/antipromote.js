// XADON V11 · ANTI — antipromote: instantly revert unauthorized promotions.
// Anyone (non-owner) who promotes a member gets their action undone.
// Usage: .antipromote on | .antipromote off | .antipromote status
const { savePolicy, groupPolicy, modeOf } = require('../../message-handler');
module.exports = {
  name: 'antipromote',
  alias: ['antipromotex'],
  desc: 'Revert unauthorized promotions (on|off|status)',
  usage: '.antipromote on | .antipromote off | .antipromote status',
  group: true, admin: true, category: 'anti',
  async run({ sock, m, args, reply, ui }) {
    const cur = modeOf(groupPolicy(m.chat).antipromote);
    const a = String(args[0] || '').toLowerCase();
    let val;
    if (!a || a === 'status' || a === 'info') {
      return reply(ui.card({
        icon: '◈', title: 'Anti Promote', subtitle: cur === 'off' ? 'OFF' : 'ON',
        rows: [['mode', cur === 'off' ? 'off' : 'armed'], ['action', 're-demote the victim']],
        body: '.antipromote on · .antipromote off\nOwner-privileged users + the bot itself are exempt.',
      }));
    }
    if (/^(on|enable|yes|1)$/.test(a)) val = true;
    else if (/^(off|disable|no|0)$/.test(a)) val = false;
    else val = cur === 'off' ? true : false;
    const meta = await sock.groupMetadata(m.chat).catch(() => null);
    savePolicy(m.chat, { antipromote: val, groupName: meta?.subject || 'the group' });
    return reply(ui.notice(val ? 'success' : 'warn', `Anti Promote ${val ? 'ON' : 'OFF'}`,
      val ? 'Unauthorized promotions will be reverted automatically.' : 'Promotion guard disabled.'));
  },
};
