// XADON V11 · PREMIUM — slowmode: one message per N seconds.
// Extra messages are deleted (admins + owner circle exempt).
// Usage: .slowmode 10 | .slowmode off | .slowmode status
const { savePolicy, groupPolicy } = require('../../message-handler');
module.exports = {
  name: 'slowmode',
  alias: ['slowchat', 'ratelimit'],
  desc: 'Rate-limit chatter (one msg per N seconds)',
  usage: '.slowmode 10 | .slowmode off | .slowmode status',
  group: true, admin: true, botAdmin: true, category: 'group',
  async run({ m, args, reply, ui }) {
    const cur = Number(groupPolicy(m.chat).slowmode) || 0;
    const a = String(args[0] || '').toLowerCase();
    if (!a || a === 'status' || a === 'info') {
      return reply(ui.card({
        icon: '◷', title: 'Slowmode', subtitle: cur ? `${cur}s per message` : 'OFF',
        rows: [['delay', cur ? `${cur}s` : 'off'], ['exempt', 'admins · owner circle']],
        body: '.slowmode 10 · .slowmode off',
      }));
    }
    if (/^(off|disable|no|0)$/.test(a)) {
      savePolicy(m.chat, { slowmode: 0 });
      return reply(ui.notice('warn', 'Slowmode OFF', 'Everyone can talk freely again.'));
    }
    const secs = Math.min(300, Math.max(3, Number(a) || 0));
    if (!secs) return reply(ui.notice('info', 'Slowmode', 'Usage: .slowmode 10  (3–300 seconds) · .slowmode off'));
    savePolicy(m.chat, { slowmode: secs });
    return reply(ui.notice('success', `Slowmode ${secs}s`, 'One message per member every few seconds. Flood extras are deleted.'));
  },
};
