// XADON V11 · ANTI — antikickall: demote rogue admins mass-removing members.
// When an admin angrily tries to wipe the group, XADON (must be admin too)
// demotes that person after N removals in 2 minutes (default 3).
// Usage: .antikickall on [limit] | .antikickall off | .antikickall status
const { savePolicy, groupPolicy, modeOf } = require('../../message-handler');
module.exports = {
  name: 'antikickall',
  alias: ['antikickraid', 'antimasskick'],
  desc: 'Demote admins who mass-remove members (on|off|status)',
  usage: '.antikickall on 3 | .antikickall off | .antikickall status',
  group: true, admin: true, category: 'anti',
  async run({ sock, m, args, reply, ui }) {
    const policy = groupPolicy(m.chat);
    const cur = modeOf(policy.antikickall);
    const sub = String(args[0] || '').toLowerCase();
    if (!sub || sub === 'status' || sub === 'info') {
      return reply(ui.card({
        icon: '◈', title: 'Anti Kickall', subtitle: cur === 'off' ? 'OFF' : `ON · limit ${policy.antikickallLimit || 3}/2min`,
        rows: [['mode', cur === 'off' ? 'off' : 'armed'], ['action', 'demote the rogue admin']],
        body: '.antikickall on [limit] · .antikickall off\nBot must be admin to demote. Owner-privileged users are exempt.',
      }));
    }
    let val; let limit = Number(policy.antikickallLimit) || 3;
    if (/^(on|enable|yes|1)$/.test(sub)) { val = true; if (Number(args[1]) >= 2) limit = Math.min(20, Number(args[1])); }
    else if (/^(off|disable|no|0)$/.test(sub)) val = false;
    else if (/^\d+$/.test(sub)) { val = true; limit = Math.min(20, Math.max(2, Number(sub))); }
    else { val = cur === 'off' ? true : false; }
    const meta = await sock.groupMetadata(m.chat).catch(() => null);
    savePolicy(m.chat, { antikickall: val, antikickallLimit: limit, groupName: meta?.subject || policy.groupName || 'the group' });
    return reply(ui.notice(val ? 'success' : 'warn', `Anti Kickall ${val ? `ON (limit ${limit}/2min)` : 'OFF'}`,
      val ? 'Mass-removing admins will be demoted automatically.\nBot must be admin for the demote to land.' : 'Rogue-admin guard disabled.'));
  },
};
