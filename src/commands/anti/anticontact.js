// XADON V6 · ANTI — Block contacts
// Modes: on = delete only · warn = delete + warn (3 warns = kick) · kick = delete + instant kick · off.
const { savePolicy, groupPolicy, modeOf } = require('../../message-handler');
module.exports = {
  name: 'anticontact',
  alias: ['anticontactx'],
  desc: 'Block contacts (on|warn|kick|off)',
  usage: '.anticontact on | .anticontact warn | .anticontact kick | .anticontact off',
  group: true, admin: true, category: 'anti',
  async run({ sock, m, args, reply, ui }) {
    const cur = modeOf(groupPolicy(m.chat).anticontact);
    const a = String(args[0] || '').toLowerCase();
    let val;
    if (/^(on|enable|yes|1|delete)$/.test(a)) val = true;
    else if (/^(off|disable|no|0)$/.test(a)) val = false;
    else if (/^warn/.test(a)) val = 'warn';
    else if (/^(kick|remove|ban)$/.test(a)) val = 'kick';
    else val = cur === 'off' ? true : false;
    const meta = await sock.groupMetadata(m.chat).catch(() => null);
    savePolicy(m.chat, { anticontact: val, groupName: meta?.subject || 'the group' });
    const label = val === 'warn' ? 'WARN MODE (delete + warn, 3 warns = auto-kick)' : val === 'kick' ? 'KICK MODE (delete + instant kick)' : val ? 'ON (delete only)' : 'OFF';
    return reply(ui.notice(val ? 'success' : 'warn', `Anti Contact ` + label, `Block contacts\n\nModes: .anticontact on · .anticontact warn · .anticontact kick · .anticontact off`));
  },
};
