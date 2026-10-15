// XADON AI · ANTI — premium unicode card, no emojis.
const { savePolicy, groupPolicy } = require('../../message-handler');
module.exports = {
  name: 'antiflood',
  alias: ['antifloodx'],
  desc: 'Flood control',
  usage: '.antiflood on | .antiflood off',
  group: true, admin: true, category: 'anti',
  async run({ sock, m, args, reply, ui }) {
    const cur = !!groupPolicy(m.chat).antiflood;
    const a = String(args[0] || '').toLowerCase();
    const val = /^(on|enable|yes|1)$/.test(a) ? true : /^(off|disable|no|0)$/.test(a) ? false : !cur;
    const meta = await sock.groupMetadata(m.chat).catch(() => null);
    savePolicy(m.chat, { antiflood: val, groupName: meta?.subject || 'the group' });
    return reply(ui.notice(val ? 'success' : 'warn', 'Flood control ' + (val ? 'enabled' : 'disabled'), 'Removes long flooding texts over 1200 characters.'));
  },
};
