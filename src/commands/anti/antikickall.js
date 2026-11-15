// XADON V17 · ANTI — antikickall: punish rogue admins mass-removing members.
// Modes: on/demote = demote the rogue · kick = kick the rogue · warn = warn only · off.
// Usage: .antikickall on [limit] | .antikickall demote [limit] | .antikickall kick [limit] | .antikickall off | .antikickall status
const { savePolicy, groupPolicy, modeOf } = require('../../message-handler');
const ACTION_LABEL = { off: 'OFF', on: 'ON — demote rogue', demote: 'DEMOTE rogue', kick: 'KICK rogue', warn: 'WARN rogue' };
module.exports = {
  name: 'antikickall',
  alias: ['antikickraid', 'antimasskick'],
  desc: 'Punish admins who mass-remove members (on|demote|kick|off)',
  usage: '.antikickall on 3 | .antikickall demote 3 | .antikickall kick 3 | .antikickall off',
  group: true, admin: true, category: 'anti',
  async run({ sock, m, args, reply, ui }) {
    const policy = groupPolicy(m.chat);
    const cur = modeOf(policy.antikickall);
    const limit0 = Number(policy.antikickallLimit) || 3;
    const sub = String(args[0] || '').toLowerCase();
    if (!sub || sub === 'status' || sub === 'info') {
      return reply(ui.card({
        icon: '◈', title: 'Anti Kickall', subtitle: cur === 'off' ? 'OFF' : `${ACTION_LABEL[cur] || cur} · limit ${limit0}/2min`,
        rows: [['mode', ACTION_LABEL[cur] || cur], ['limit', cur === 'off' ? '—' : `${limit0} removes / 2 min`], ['rogue admin', cur === 'kick' ? 'kicked' : cur === 'warn' ? 'warned' : cur === 'off' ? '—' : 'demoted']],
        body: '.antikickall on [n] · .antikickall demote [n]\n.antikickall kick [n] · .antikickall off\nBot must be admin to punish. Owner-privileged users are exempt.',
      }));
    }
    let val; let limit = limit0;
    const num = (s) => { const n = Number(s); return Number.isFinite(n) && n >= 2 && n <= 20 ? Math.floor(n) : null; };
    if (/^(off|disable|no|0)$/.test(sub)) val = false;
    else if (/^(demote|deduct|strip|degrade|unadmin)$/.test(sub)) { val = 'demote'; const n = num(args[1]); if (n) limit = n; }
    else if (/^(kick|remove|ban)$/.test(sub)) { val = 'kick'; const n = num(args[1]); if (n) limit = n; }
    else if (/^warn/.test(sub)) { val = 'warn'; const n = num(args[1]); if (n) limit = n; }
    else if (/^(on|enable|yes|1)$/.test(sub)) { val = 'demote'; const n = num(args[1]); if (n) limit = n; }
    else if (/^\d+$/.test(sub)) { const n = num(sub); if (n) { val = 'demote'; limit = n; } else return reply(ui.notice('info', 'Anti Kickall', 'Limit must be 2–20. Example: .antikickall kick 3')); }
    else return reply(ui.notice('info', 'Anti Kickall', 'Usage: .antikickall on [n] | .antikickall demote [n] | .antikickall kick [n] | .antikickall off'));
    const meta = await sock.groupMetadata(m.chat).catch(() => null);
    savePolicy(m.chat, { antikickall: val, antikickallLimit: limit, groupName: meta?.subject || policy.groupName || 'the group' });
    const label = val === false ? 'OFF' : val === 'kick' ? `KICK mode (limit ${limit}/2min)` : val === 'warn' ? `WARN mode (limit ${limit}/2min)` : `DEMOTE mode (limit ${limit}/2min)`;
    return reply(ui.notice(val === false ? 'warn' : 'success', `Anti Kickall ${label}`,
      val === false ? 'Rogue-admin guard disabled.'
      : val === 'kick' ? 'Mass-removing admins will be KICKED automatically.\nBot must be admin for the kick to land.'
      : val === 'warn' ? 'Mass-removing admins will be warned automatically.'
      : 'Mass-removing admins will be DEMOTED automatically.\nBot must be admin for the demote to land.'));
  },
};
