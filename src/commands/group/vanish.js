// XADON V11 · PREMIUM — vanish: bulk-delete a member's recent messages.
// Pulls the last N keys from the in-memory ring (see message-handler recentBySender).
// Usage: .vanish @user 10  ·  reply with .vanish 5
const { recentBySender } = require('../../message-handler');
module.exports = {
  name: 'vanish',
  alias: ['bulkdel', 'clearuser'],
  desc: "Bulk-delete a member's recent messages",
  usage: '.vanish @user 10  ·  reply with .vanish 5',
  group: true, admin: true, botAdmin: true, category: 'group',
  async run({ sock, m, args, reply, ui, target }) {
    let jid = target();
    let n = 10;
    for (const a of args) { if (/^\d{1,2}$/.test(a)) n = Math.min(30, Math.max(1, Number(a))); }
    if (!jid && m.quoted?.sender) jid = m.quoted.sender;
    if (!jid) return reply(ui.notice('info', 'Who?', 'Mention someone or reply to them: .vanish @user 10'));
    const keys = recentBySender(m.chat, jid, m.id, n);
    if (!keys.length) return reply(ui.notice('info', 'Nothing cached', 'No recent messages from them in my short memory (last ~400 group msgs).'));
    let done = 0;
    for (const k of keys) {
      try {
        await sock.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: !!k.fromMe, id: k.id, participant: k.participant || k.sender } });
        done++;
        await new Promise((r) => setTimeout(r, 400));
      } catch {}
    }
    return reply(ui.notice('success', 'Vanished', `${done}/${keys.length} messages from @${jid.split('@')[0]} deleted.`));
  },
};
