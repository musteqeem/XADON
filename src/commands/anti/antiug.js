// XADON V6 · ANTI — Ultimate guard: master shield blocking ALL unwanted content at once
// Modes: on = delete only · warn = delete + warn (3 warns = kick) · kick = delete + instant kick · off.
const { savePolicy, groupPolicy, modeOf } = require('../../message-handler');
module.exports = {
  name: 'antiug',
  alias: ['ultimate', 'antishield', 'shield'],
  desc: 'Ultimate guard: master shield blocking ALL unwanted content at once (on|warn|kick|off)',
  usage: '.antiug on | .antiug warn | .antiug kick | .antiug off',
  group: true, admin: true, category: 'anti',
  async run({ sock, m, args, reply, ui }) {
    const cur = modeOf(groupPolicy(m.chat).antiug);
    const a = String(args[0] || '').toLowerCase();
    let val;
    if (/^(on|enable|yes|1|delete)$/.test(a)) val = true;
    else if (/^(off|disable|no|0)$/.test(a)) val = false;
    else if (/^warn/.test(a)) val = 'warn';
    else if (/^(kick|remove|ban)$/.test(a)) val = 'kick';
    else val = cur === 'off' ? true : false;
    const meta = await sock.groupMetadata(m.chat).catch(() => null);
    savePolicy(m.chat, { antiug: val, groupName: meta?.subject || 'the group' });
    const label = val === 'warn' ? 'WARN MODE (delete + warn, 3 warns = auto-kick)' : val === 'kick' ? 'KICK MODE (delete + instant kick)' : val ? 'ON (delete only)' : 'OFF';
    return reply(ui.notice(val ? 'success' : 'warn', `Anti Ug ` + label, `MASTER SHIELD: blocks links, invites, bad words, foreign scripts, phone numbers, emails, masked links, crash texts, caps floods, emoji floods, forwards, hidetags and foreign bots in one switch.\n\nModes: .antiug on · .antiug warn · .antiug kick · .antiug off`));
  },
};
