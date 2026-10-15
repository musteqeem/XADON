// XADON AI · ANTI — premium unicode card, no emojis.
const { savePolicy, groupPolicy } = require('../../message-handler');
module.exports = {
  name: 'antidoc',
  alias: ['antidocx'],
  desc: 'Block documents',
  usage: '.antidoc on | .antidoc off',
  group: true, admin: true, category: 'anti',
  async run({ sock, m, args, reply, ui }) {
    const cur = !!groupPolicy(m.chat).antidoc;
    const a = String(args[0] || '').toLowerCase();
    const val = /^(on|enable|yes|1)$/.test(a) ? true : /^(off|disable|no|0)$/.test(a) ? false : !cur;
    const meta = await sock.groupMetadata(m.chat).catch(() => null);
    savePolicy(m.chat, { antidoc: val, groupName: meta?.subject || 'the group' });
    return reply(ui.notice(val ? 'success' : 'warn', 'Block documents ' + (val ? 'enabled' : 'disabled'), 'Removes document messages (pdf, zip, apk).'));
  },
};
