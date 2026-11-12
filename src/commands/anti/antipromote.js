// XADON V17 · ANTI — antipromote: revert unauthorized promotions + punish the rogue admin.
// Modes: on = revert only · demote = revert + demote the rogue · kick = revert + kick the rogue · off.
// Usage: .antipromote on | .antipromote demote | .antipromote kick | .antipromote off | .antipromote status
const { savePolicy, groupPolicy, modeOf } = require('../../message-handler');
const ACTION_LABEL = { off: 'OFF', on: 'ON — revert only', demote: 'DEMOTE rogue admin', kick: 'KICK rogue admin', warn: 'WARN rogue admin' };
module.exports = {
  name: 'antipromote',
  alias: ['antipromotex'],
  desc: 'Revert unauthorized promotions, optionally punish the rogue (on|demote|kick|off)',
  usage: '.antipromote on | .antipromote demote | .antipromote kick | .antipromote off',
  group: true, admin: true, category: 'anti',
  async run({ sock, m, args, reply, ui }) {
    const cur = modeOf(groupPolicy(m.chat).antipromote);
    const a = String(args[0] || '').toLowerCase();
    if (!a || a === 'status' || a === 'info') {
      return reply(ui.card({
        icon: '◈', title: 'Anti Promote', subtitle: ACTION_LABEL[cur] || cur.toUpperCase(),
        rows: [['mode', ACTION_LABEL[cur] || cur], ['victim', 're-demoted automatically'], ['rogue admin', cur === 'demote' ? 'also demoted' : cur === 'kick' ? 'also kicked' : cur === 'warn' ? 'warned (3 = kick)' : cur === 'off' ? '—' : 'left alone (revert only)']],
        body: '.antipromote on · .antipromote demote · .antipromote kick · .antipromote off\nOwner-privileged users + the bot itself are exempt. Bot must be admin to revert/punish.',
      }));
    }
    let val;
    if (/^(off|disable|no|0)$/.test(a)) val = false;
    else if (/^(demote|deduct|strip|degrade|unadmin)$/.test(a)) val = 'demote';
    else if (/^(kick|remove|ban)$/.test(a)) val = 'kick';
    else if (/^warn/.test(a)) val = 'warn';
    else if (/^(on|enable|yes|1|revert|delete)$/.test(a)) val = true;
    else return reply(ui.notice('info', 'Anti Promote', 'Usage: .antipromote on | .antipromote demote | .antipromote kick | .antipromote off'));
    const meta = await sock.groupMetadata(m.chat).catch(() => null);
    savePolicy(m.chat, { antipromote: val, groupName: meta?.subject || 'the group' });
    const label = val === false ? 'OFF' : val === 'demote' ? 'DEMOTE mode' : val === 'kick' ? 'KICK mode' : val === 'warn' ? 'WARN mode' : 'ON (revert only)';
    return reply(ui.notice(val === false ? 'warn' : 'success', `Anti Promote ${label}`,
      val === false ? 'Promotion guard disabled.'
      : val === 'demote' ? 'Unauthorized promotions will be reverted AND the rogue admin demoted.'
      : val === 'kick' ? 'Unauthorized promotions will be reverted AND the rogue admin kicked.'
      : val === 'warn' ? 'Unauthorized promotions will be reverted AND the rogue admin warned (3 warns = kick).'
      : 'Unauthorized promotions will be reverted automatically (rogue left alone). Use .antipromote demote / kick to punish.'));
  },
};
