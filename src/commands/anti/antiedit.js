// XADON AI · ANTI — premium unicode card, no emojis.
const { savePolicy, groupPolicy } = require('../../message-handler');
module.exports = {
  name: 'antiedit',
  alias: ['antieditx'],
  desc: 'Edited-message guard',
  usage: '.antiedit on | .antiedit off',
  group: true, admin: true, category: 'anti',
  async run({ sock, m, args, reply, ui }) {
    const cur = !!groupPolicy(m.chat).antiedit;
    const a = String(args[0] || '').toLowerCase();
    const val = /^(on|enable|yes|1)$/.test(a) ? true : /^(off|disable|no|0)$/.test(a) ? false : !cur;
    const meta = await sock.groupMetadata(m.chat).catch(() => null);
    savePolicy(m.chat, { antiedit: val, groupName: meta?.subject || 'the group' });
    return reply(ui.notice(val ? 'success' : 'warn', 'Edited-message guard ' + (val ? 'enabled' : 'disabled'), 'Keeps the edit-watch flag ready for edited messages.'));
  },
};
