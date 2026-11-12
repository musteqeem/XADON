// XADON V13 · GODMODE — the single most powerful protection switch.
// One command arms the ENTIRE stack for the group:
// rogue-admin wall (antikickall+antidemote+antipromote) + link/badword/spam/bot
// guards + delete restore (delwatch) + leave alerts (antileft) + owner-DM
// kick logs. OFF disarms everything it manages.
// Usage: .godmode on | .godmode off | .godmode status
const { savePolicy, groupPolicy, modeOf } = require('../../message-handler');
const STACK_ON = {
  godmode: true, antikickall: 'demote', antidemote: 'demote', antipromote: 'demote',
  antilink: 'warn', antibadword: 'warn', antispam: true, antiflood: true,
  antibot: 'warn', delwatch: true, antileft: true, antidelete: true,
};
const STACK_OFF = {
  godmode: false, antikickall: false, antidemote: false, antipromote: false,
  antilink: false, antibadword: false, antispam: false, antiflood: false,
  antibot: false, delwatch: false, antileft: false, antidelete: false,
};
const on = (p, k) => modeOf(p[k]) !== 'off';
module.exports = {
  name: 'godmode',
  alias: ['god', 'maxshield', 'fullprotect'],
  desc: 'Master switch: arm the entire protection stack',
  usage: '.godmode on | .godmode off | .godmode status',
  group: true, admin: true, botAdmin: true, category: 'anti',
  async run({ sock, m, args, reply, ui, db }) {
    const p = groupPolicy(m.chat);
    const a = String(args[0] || '').toLowerCase();
    const live = !!p.godmode;
    if (!a || a === 'status' || a === 'info') {
      return reply(ui.card({
        icon: '☄', title: 'Godmode', subtitle: live ? 'ALL SYSTEMS ARMED' : 'standby',
        rows: [
          ['rogue-admin wall', on(p, 'antikickall') && on(p, 'antidemote') && on(p, 'antipromote') ? 'ON' : 'off'],
          ['link/badword/spam/bot', [on(p, 'antilink'), on(p, 'antibadword'), on(p, 'antispam'), on(p, 'antibot')].every(Boolean) ? 'ON' : 'off'],
          ['delwatch/antileft', on(p, 'delwatch') && on(p, 'antileft') ? 'ON' : 'off'],
          ['antidelete/kicklog', on(p, 'antidelete') && db.get(`kicklog:${m.chat}`, false) ? 'ON' : 'off'],
        ],
        body: '.godmode on — arm everything\n.godmode off — stand everything down',
      }));
    }
    const val = /^(on|enable|yes|1)$/.test(a) ? true : /^(off|disable|no|0)$/.test(a) ? false : !live;
    const meta = await sock.groupMetadata(m.chat).catch(() => null);
    savePolicy(m.chat, { ...(val ? STACK_ON : STACK_OFF), groupName: meta?.subject || p.groupName || 'the group' });
    db.set(`kicklog:${m.chat}`, val);
    return reply(ui.notice(val ? 'success' : 'warn', val ? 'GODMODE ENGAGED ☄' : 'Godmode standby',
      val
        ? 'Rogue-admin wall · link/badword/spam/bot guards · delwatch restore · leave alerts · owner-DM kick logs — ALL LIVE.'
        : 'Every godmode guard stood down. Use .shield for the rogue-admin wall only.'));
  },
};
