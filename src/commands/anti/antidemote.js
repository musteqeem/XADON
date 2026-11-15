// XADON V17 · ANTI — antidemote: revert unauthorized demotions + punish the rogue admin.
// Modes: on = revert only · demote = revert + demote the rogue · kick = revert + kick the rogue · off.
// Usage: .antidemote on | .antidemote demote | .antidemote kick | .antidemote off | .antidemote status
const { savePolicy, groupPolicy, modeOf } = require('../../message-handler');
const ACTION_LABEL = { off: 'OFF', on: 'ON — revert only', demote: 'DEMOTE rogue admin', kick: 'KICK rogue admin', warn: 'WARN rogue admin' };
module.exports = {
  name: 'antidemote',
  alias: ['antidemotex'],
  desc: 'Revert unauthorized demotions, optionally punish the rogue (on|demote|kick|off)',
  usage: '.antidemote on | .antidemote demote | .antidemote kick | .antidemote off',
  group: true, admin: true, category: 'anti',
  async run({ sock, m, args, reply, ui }) {
    const cur = modeOf(groupPolicy(m.chat).antidemote);
    const a = String(args[0] || '').toLowerCase();
    if (!a || a === 'status' || a === 'info') {
      return reply(ui.card({
        icon: '◈', title: 'Anti Demote', subtitle: ACTION_LABEL[cur] || cur.toUpperCase(),
        rows: [['mode', ACTION_LABEL[cur] || cur], ['victim', 're-promoted automatically'], ['rogue admin', cur === 'demote' ? 'also demoted' : cur === 'kick' ? 'also kicked' : cur === 'warn' ? 'warned (3 = kick)' : cur === 'off' ? '—' : 'left alone (revert only)']],
        body: '.antidemote on · .antidemote demote · .antidemote kick · .antidemote off\nOwner-privileged users + the bot itself are exempt. Bot must be admin to revert/punish.',
      }));
    }
    let val;
    if (/^(off|disable|no|0)$/.test(a)) val = false;
    else if (/^(demote|deduct|strip|degrade|unadmin)$/.test(a)) val = 'demote';
    else if (/^(kick|remove|ban)$/.test(a)) val = 'kick';
    else if (/^warn/.test(a)) val = 'warn';
    else if (/^(on|enable|yes|1|revert|delete)$/.test(a)) val = true;
    else return reply(ui.notice('info', 'Anti Demote', 'Usage: .antidemote on | .antidemote demote | .antidemote kick | .antidemote off'));
    const meta = await sock.groupMetadata(m.chat).catch(() => null);
    savePolicy(m.chat, { antidemote: val, groupName: meta?.subject || 'the group' });
    const label = val === false ? 'OFF' : val === 'demote' ? 'DEMOTE mode' : val === 'kick' ? 'KICK mode' : val === 'warn' ? 'WARN mode' : 'ON (revert only)';
    return reply(ui.notice(val === false ? 'warn' : 'success', `Anti Demote ${label}`,
      val === false ? 'Demotion guard disabled.'
      : val === 'demote' ? 'Unauthorized demotions will be reverted AND the rogue admin demoted.'
      : val === 'kick' ? 'Unauthorized demotions will be reverted AND the rogue admin kicked.'
      : val === 'warn' ? 'Unauthorized demotions will be reverted AND the rogue admin warned (3 warns = kick).'
      : 'Unauthorized demotions will be reverted automatically (rogue left alone). Use .antidemote demote / kick to punish.'));
  },
};
