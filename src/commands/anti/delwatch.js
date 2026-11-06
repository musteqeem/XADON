// XADON V12 · PREMIUM — delwatch: re-post deleted messages back into the chat.
// Unlike .antidelete (text notice only), delwatch restores pics/videos too.
// Usage: .delwatch on | .delwatch off | .delwatch status
const { savePolicy, groupPolicy, modeOf } = require('../../message-handler');
module.exports = {
  name: 'delwatch',
  alias: ['antidelall', 'restoreall'],
  desc: 'Auto re-post deleted messages (+media) in chat',
  usage: '.delwatch on | .delwatch off | .delwatch status',
  group: true, admin: true, category: 'anti',
  async run({ sock, m, args, reply, ui }) {
    const cur = modeOf(groupPolicy(m.chat).delwatch);
    const a = String(args[0] || '').toLowerCase();
    if (!a || a === 'status' || a === 'info') {
      return reply(ui.card({
        icon: '♻', title: 'Delwatch', subtitle: cur === 'off' ? 'OFF' : 'RESTORING',
        rows: [['mode', cur === 'off' ? 'off' : 'armed'], ['restores', 'text + pics + videos']],
        body: '.delwatch on · .delwatch off\nDeleted messages are re-posted with their media.',
      }));
    }
    let val;
    if (/^(on|enable|yes|1)$/.test(a)) val = true;
    else if (/^(off|disable|no|0)$/.test(a)) val = false;
    else val = cur === 'off' ? true : false;
    const meta = await sock.groupMetadata(m.chat).catch(() => null);
    savePolicy(m.chat, { delwatch: val, groupName: meta?.subject || 'the group' });
    return reply(ui.notice(val ? 'success' : 'warn', `Delwatch ${val ? 'ON ♻' : 'OFF'}`,
      val ? 'Deletes will be restored in-chat with media.' : 'Chat restore disabled.'));
  },
};
