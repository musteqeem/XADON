// XADON V17 · PREMIUM PACK — shield: one-tap group protection.
// Arms antikickall + antidemote + antipromote together, disarms together.
// Usage: .shield on | .shield demote | .shield kick | .shield off | .shield status
const { savePolicy, groupPolicy, modeOf } = require('../../message-handler');
const LBL = (v) => { const m = modeOf(v); return m === 'off' ? 'off' : m === 'kick' ? 'KICK' : m === 'demote' ? 'DEMOTE' : m === 'warn' ? 'WARN' : 'ON'; };
module.exports = {
  name: 'shield',
  alias: ['guard', 'protect'],
  desc: 'One-tap guard: antikickall + antidemote + antipromote (on|demote|kick|off)',
  usage: '.shield on | .shield demote | .shield kick | .shield off',
  group: true, admin: true, category: 'anti',
  async run({ sock, m, args, reply, ui }) {
    const p = groupPolicy(m.chat);
    const a = String(args[0] || '').toLowerCase();
    const on = (k) => modeOf(p[k]) !== 'off';
    if (!a || a === 'status' || a === 'info') {
      return reply(ui.card({
        icon: '⛨', title: 'Shield', subtitle: 'premium guard pack',
        rows: [
          ['antikickall', LBL(p.antikickall)],
          ['antidemote', LBL(p.antidemote)],
          ['antipromote', LBL(p.antipromote)],
        ],
        body: '.shield on (= demote) · .shield kick · .shield off\nArms all three rogue-admin guards at once. Bot must be admin.',
      }));
    }
    let val;
    if (/^(off|disable|no|0)$/.test(a)) val = false;
    else if (/^(kick|remove|ban)$/.test(a)) val = 'kick';
    else if (/^warn/.test(a)) val = 'warn';
    else if (/^(on|enable|yes|1|demote|deduct|strip)$/.test(a)) val = 'demote';
    else val = (on('antikickall') && on('antidemote') && on('antipromote')) ? false : 'demote';
    const meta = await sock.groupMetadata(m.chat).catch(() => null);
    savePolicy(m.chat, { antikickall: val, antikickallLimit: Number(p.antikickallLimit) || 3, antidemote: val, antipromote: val, groupName: meta?.subject || 'the group' });
    const label = val === false ? 'DOWN' : val === 'kick' ? 'UP ⛨ (KICK mode)' : val === 'warn' ? 'UP ⛨ (WARN mode)' : 'UP ⛨ (DEMOTE mode)';
    return reply(ui.notice(val === false ? 'warn' : 'success', `Shield ${label}`,
      val === false ? 'All three rogue-admin guards are off.'
      : val === 'kick' ? 'antikickall + antidemote + antipromote armed: rogues get KICKED (victims restored).'
      : 'antikickall + antidemote + antipromote armed: rogues get DEMOTED (victims restored).'));
  },
};
