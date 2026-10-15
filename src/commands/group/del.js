module.exports = {
  name: 'del',
  alias: ['delete', 'unsend'],
  desc: 'Delete a bot or quoted message',
  usage: 'reply with .del',
  group: true, admin: true,
  async run({ sock, m, reply, ui }) {
    const q = m.quoted;
    if (!q?.id) return reply(ui.notice('info', 'Delete', 'Reply to the message you want me to delete with .del'));
    try {
      await sock.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: q.id, participant: q.sender } });
    } catch {
      try { await sock.sendMessage(m.chat, { delete: q.raw?.key || { remoteJid: m.chat, id: q.id, participant: q.sender } }); }
      catch { return reply(ui.notice('error', 'Failed', 'I can only delete recent messages.')); }
    }
  },
};
