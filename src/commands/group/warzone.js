// XADON V11 · PREMIUM — warzone: emergency lockdown in one shot.
// ON: group muted + antilink warn + antispam armed. OFF: everything back.
// Usage: .warzone on | .warzone off | .warzone status
const { savePolicy, groupPolicy, modeOf } = require('../../message-handler');
module.exports = {
  name: 'warzone',
  alias: ['war', 'warmode'],
  desc: 'Emergency lockdown (mute + link/spam guard)',
  usage: '.warzone on | .warzone off | .warzone status',
  group: true, admin: true, botAdmin: true, category: 'group',
  async run({ sock, m, args, reply, ui }) {
    const p = groupPolicy(m.chat);
    const a = String(args[0] || '').toLowerCase();
    const state = !!p.warzone;
    if (!a || a === 'status' || a === 'info') {
      return reply(ui.card({
        icon: '☢', title: 'Warzone', subtitle: state ? 'ACTIVE' : 'calm',
        rows: [['lockdown', state ? 'ON' : 'off'], ['antilink', modeOf(p.antilink)], ['antispam', modeOf(p.antispam)]],
        body: '.warzone on · .warzone off',
      }));
    }
    const val = /^(on|enable|yes|1)$/.test(a) ? true : /^(off|disable|no|0)$/.test(a) ? false : !state;
    try {
      await sock.groupSettingUpdate(m.chat, val ? 'announcement' : 'not_announcement');
      const meta = await sock.groupMetadata(m.chat).catch(() => null);
      savePolicy(m.chat, { warzone: val, antilink: val ? 'warn' : false, antispam: val ? true : false, groupName: meta?.subject || 'the group' });
      return reply(ui.notice(val ? 'error' : 'success', val ? 'WARZONE ACTIVE ☢' : 'Warzone lifted',
        val ? 'Group muted · links warn+delete · spam guard on.' : 'Group reopened · guards back to off.'));
    } catch { return reply(ui.notice('error', 'Failed', 'I need admin rights for lockdown.')); }
  },
};
