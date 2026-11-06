// XADON V11 · PREMIUM — listleft: everyone who LEFT, with full .zip export.
// Logs are kept persistently by the participant engine (leave vs kick split).
// Usage: .listleft | .listleft zip
const { getMemberLog } = require('../../message-handler');
const { zipText } = require('../../lib/zipmini');
const when = (t) => { try { return new Date(t).toLocaleString('en-GB', { timeZone: 'Africa/Lagos', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };
const num = (j = '') => String(j).split('@')[0].split(':')[0];
module.exports = {
  name: 'listleft',
  alias: ['leftlist', 'lefthistory'],
  desc: 'List members who left (+ full zip)',
  usage: '.listleft | .listleft zip',
  group: true, admin: true, category: 'group2',
  async run({ sock, m, args, reply, ui, group }) {
    const logs = getMemberLog(m.chat, 'left', 500);
    if (!logs.length) return reply(ui.notice('info', 'Nobody left', 'No exits recorded yet. Tracking starts from now.'));
    const names = {};
    try { for (const p of (group?.participants || [])) names[num(p.id)] = p.id; } catch {}
    const lines = logs.map((e, i) => `${String(i + 1).padStart(3)}. ${num(e.jid)}  ·  ${when(e.at)}`).join('\n');
    const full = `LEFT MEMBERS — ${(group?.subject || m.chat)}\nTotal: ${logs.length} · exported ${new Date().toISOString()}\n${'='.repeat(40)}\n${lines}\n`;
    const preview = logs.slice(-15).map((e) => `• @${num(e.jid)} — ${when(e.at)}`).join('\n');
    await sock.sendMessage(m.chat, {
      text: `◉ ${ui.fonts.bold('LEFT MEMBERS')} · ${logs.length}\n${'─'.repeat(22)}\n${preview}${logs.length > 15 ? `\n… +${logs.length - 15} more (see file/zip)` : ''}\n\n${ui.footer()}`,
      mentions: logs.slice(-15).map((e) => (/lid$/.test(e.jid) ? null : `${num(e.jid)}@s.whatsapp.net`)).filter(Boolean),
    }, { quoted: m.raw });
    const tag = `left-${m.chat.split('@')[0]}.txt`;
    await sock.sendMessage(m.chat, { document: Buffer.from(full, 'utf8'), mimetype: 'text/plain', fileName: tag }, { quoted: m.raw }).catch(() => {});
    if (/zip/i.test(args[0] || '') || logs.length > 5) {
      await sock.sendMessage(m.chat, { document: zipText(tag, full), mimetype: 'application/zip', fileName: tag.replace(/\.txt$/, '.zip') }, { quoted: m.raw }).catch(() => {});
    }
  },
};
