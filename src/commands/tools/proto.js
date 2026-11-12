// Picked from WHATSAPP INVESTIGATION: protocol.js — deep reply-protocol dump (XADON ctx version)
module.exports = {
  name: 'proto', alias: ['protocol', 'deepproto'], desc: 'Deep protocol dump of replied message', usage: '.proto (reply to a message)', category: 'tools',
  async run({ m, reply, ui, sock }) {
    const q = m.quoted;
    if (!q) return reply(ui.notice('info', 'Proto', 'Reply to the target message with .proto'));
    const node = q.message || {};
    const info = {
      type: q.type || Object.keys(node)[0] || 'unknown',
      from: q.sender || m.chat,
      id: q.id || '—',
      isViewOnce: /viewOnce/i.test(JSON.stringify(node)),
      isInteractive: !!node.interactiveMessage,
      isButtons: !!(node.buttonsMessage || node.templateMessage),
      isEphemeral: !!node.ephemeralMessage,
      keys: Object.keys(node).join(', ') || '—',
    };
    const out = [`╭───[ DEEP PROTOCOL ]───`, ...Object.entries(info).map(([k, v]) => `│ ${k}: ${v}`), `╰────────────────`].join('\n');
    try {
      await sock.sendMessage(m.chat, { document: Buffer.from(JSON.stringify(q, null, 2)), fileName: 'proto.json', mimetype: 'application/json', caption: out.slice(0, 1000) }, { quoted: m.raw });
    } catch { await reply(out); }
  },
};
