// XADON V11 · ANTI — antidemote: instantly revert unauthorized demotions.
// Anyone (non-owner) who demotes a member gets their action undone.
// Usage: .antidemote on | .antidemote off | .antidemote status
const { savePolicy, groupPolicy, modeOf } = require('../../message-handler');
module.exports = {
  name: 'antidemote',
  alias: ['antidemotex'],
  desc: 'Revert unauthorized demotions (on|off|status)',
  usage: '.antidemote on | .antidemote off | .antidemote status',
  group: true, admin: true, category: 'anti',
  async run({ sock, m, args, reply, ui }) {
    const cur = modeOf(groupPolicy(m.chat).antidemote);
    const a = String(args[0] || '').toLowerCase();
    let val;
    if (!a || a === 'status' || a === 'info') {
      return reply(ui.card({
        icon: '◈', title: 'Anti Demote', subtitle: cur === 'off' ? 'OFF' : 'ON',
        rows: [['mode', cur === 'off' ? 'off' : 'armed'], ['action', 're-promote the victim']],
        body: '.antidemote on · .antidemote off\nOwner-privileged users + the bot itself are exempt.',
      }));
    }
    if (/^(on|enable|yes|1)$/.test(a)) val = true;
    else if (/^(off|disable|no|0)$/.test(a)) val = false;
    else val = cur === 'off' ? true : false;
    const meta = await sock.groupMetadata(m.chat).catch(() => null);
    savePolicy(m.chat, { antidemote: val, groupName: meta?.subject || 'the group' });
    return reply(ui.notice(val ? 'success' : 'warn', `Anti Demote ${val ? 'ON' : 'OFF'}`,
      val ? 'Unauthorized demotions will be reverted automatically.' : 'Demotion guard disabled.'));
  },
};
