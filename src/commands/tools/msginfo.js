// Picked from WHATSAPP INVESTIGATION: msginfo.js — save quoted message JSON as file
module.exports = {
  name: 'msginfo', alias: ['messageinfo', 'qinfo'], desc: 'Export replied message as JSON file', usage: '.msginfo (reply to a message)', category: 'tools',
  async run({ m, reply, ui, sock }) {
    if (!m.quoted) return reply(ui.notice('info', 'Msg info', 'Reply to a message first.'));
    try {
      const full = JSON.stringify(m.quoted, null, 2);
      await sock.sendMessage(m.chat, { document: Buffer.from(full), fileName: 'message_info.json', mimetype: 'application/json' }, { quoted: m.raw });
    } catch { return reply(ui.notice('error', 'Failed', 'Could not export that message.')); }
  },
};
