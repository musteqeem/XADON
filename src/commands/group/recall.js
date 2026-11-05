// XADON V11 · PREMIUM — recall: re-invite recently kicked members.
// Reads the persistent kicked log (.listkicked) and adds them back.
// Usage: .recall [count]  (default 5, max 20)
const { getMemberLog } = require('../../message-handler');
module.exports = {
  name: 'recall',
  alias: ['reinvite', 'unrude'],
  desc: 'Re-invite recently kicked members',
  usage: '.recall 5',
  group: true, admin: true, botAdmin: true, category: 'group',
  async run({ sock, m, args, reply, ui }) {
    const n = Math.min(20, Math.max(1, Number(args[0]) || 5));
    const logs = getMemberLog(m.chat, 'kicked', 500).slice(-n);
    if (!logs.length) return reply(ui.notice('info', 'Nobody to recall', 'No kicked members on record. See .listkicked.'));
    let ok = 0; const failed = [];
    for (const e of logs) {
      try {
        await sock.groupParticipantsUpdate(m.chat, [e.jid], 'add');
        ok++;
        await new Promise((r) => setTimeout(r, 900));
      } catch { failed.push(e.jid.split('@')[0].split(':')[0]); }
    }
    return reply(ui.card({
      icon: '↩', title: 'Recall', subtitle: `${ok}/${logs.length} back`,
      rows: [['re-invited', `${ok}`], ['failed', failed.length ? failed.slice(0, 8).join(', ') : 'none']],
      body: failed.length ? 'Some numbers block re-adds (privacy) — send them the invite link.' : 'All recalled members were re-added.',
    }));
  },
};
