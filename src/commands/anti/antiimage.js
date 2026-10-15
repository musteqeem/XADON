// XADON AI · ANTI — premium unicode card, no emojis.
const { savePolicy, groupPolicy } = require('../../message-handler');
module.exports = {
  name: 'antiimage',
  alias: ['antiimagex'],
  desc: 'Block photos',
  usage: '.antiimage on | .antiimage off',
  group: true, admin: true, category: 'anti',
  async run({ sock, m, args, reply, ui }) {
    const cur = !!groupPolicy(m.chat).antiimage;
    const a = String(args[0] || '').toLowerCase();
    const val = /^(on|enable|yes|1)$/.test(a) ? true : /^(off|disable|no|0)$/.test(a) ? false : !cur;
    const meta = await sock.groupMetadata(m.chat).catch(() => null);
    savePolicy(m.chat, { antiimage: val, groupName: meta?.subject || 'the group' });
    return reply(ui.notice(val ? 'success' : 'warn', 'Block photos ' + (val ? 'enabled' : 'disabled'), 'Removes image messages.'));
  },
};
