// XADON V11 · PREMIUM — listkicked: everyone REMOVED, with full .zip export.
// Logs are kept persistently by the participant engine (leave vs kick split).
// Usage: .listkicked | .listkicked zip
const { getMemberLog } = require('../../message-handler');
const { zipText } = require('../../lib/zipmini');
const when = (t) => { try { return new Date(t).toLocaleString('en-GB', { timeZone: 'Africa/Lagos', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };
const num = (j = '') => String(j).split('@')[0].split(':')[0];
module.exports = {
  name: 'listkicked',
  alias: ['kickedlist', 'kickhistory', 'listremoved'],
  desc: 'List members who were kicked (+ full zip)',
  usage: '.listkicked | .listkicked zip',
  group: true, admin: true, category: 'group2',
  async run({ sock, m, args, reply, ui, group }) {
    const logs = getMemberLog(m.chat, 'kicked', 500);
    if (!logs.length) return reply(ui.notice('info', 'No kicks', 'No removals recorded yet. Tracking starts from now.'));
    const lines = logs.map((e, i) => `${String(i + 1).padStart(3)}. ${num(e.jid)}  ·  by ${e.by ? num(e.by) : '?'}  ·  ${when(e.at)}`).join('\n');
    const full = `KICKED MEMBERS — ${(group?.subject || m.chat)}\nTotal: ${logs.length} · exported ${new Date().toISOString()}\n${'='.repeat(40)}\n${lines}\n`;
    const preview = logs.slice(-15).map((e) => `• @${num(e.jid)} (by @${num(e.by || '?')})`).join('\n');
    const ment = [];
    for (const e of logs.slice(-15)) {
      if (!/lid$/.test(e.jid)) ment.push(`${num(e.jid)}@s.whatsapp.net`);
      if (e.by && !/lid$/.test(String(e.by)) && /^\d+$/.test(num(e.by))) ment.push(`${num(e.by)}@s.whatsapp.net`);
    }
    await sock.sendMessage(m.chat, {
      text: `⊘ ${ui.fonts.bold('KICKED MEMBERS')} · ${logs.length}\n${'─'.repeat(22)}\n${preview}${logs.length > 15 ? `\n… +${logs.length - 15} more (see file/zip)` : ''}\n\n${ui.footer()}`,
      mentions: [...new Set(ment)],
    }, { quoted: m.raw });
    const tag = `kicked-${m.chat.split('@')[0]}.txt`;
    await sock.sendMessage(m.chat, { document: Buffer.from(full, 'utf8'), mimetype: 'text/plain', fileName: tag }, { quoted: m.raw }).catch(() => {});
    if (/zip/i.test(args[0] || '') || logs.length > 5) {
      await sock.sendMessage(m.chat, { document: zipText(tag, full), mimetype: 'application/zip', fileName: tag.replace(/\.txt$/, '.zip') }, { quoted: m.raw }).catch(() => {});
    }
  },
};
