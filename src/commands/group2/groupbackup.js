// XADON V11 · PREMIUM — groupbackup: full member roster + left/kicked logs as .zip.
// Usage: .groupbackup
const { getMemberLog } = require('../../message-handler');
const { zipFiles } = require('../../lib/zipmini');
const num = (j = '') => String(j).split('@')[0].split(':')[0];
module.exports = {
  name: 'groupbackup',
  alias: ['gcbackup', 'memberexport'],
  desc: 'Export full roster + logs as zip',
  usage: '.groupbackup',
  group: true, admin: true, category: 'group2',
  async run({ sock, m, reply, ui, group }) {
    const meta = group || await sock.groupMetadata(m.chat).catch(() => null);
    if (!meta) return reply(ui.notice('error', 'Failed', 'Could not read the group.'));
    const members = meta.participants || [];
    const admins = members.filter((p) => p.admin).map((p) => `${num(p.id)} (${p.admin === 'superadmin' ? 'creator' : 'admin'})`);
    const roster = `GROUP BACKUP — ${meta.subject || m.chat}\nExported: ${new Date().toISOString()}\nMembers: ${members.length} · Admins: ${admins.length}\n${'='.repeat(44)}\n-- ADMINS --\n${admins.join('\n') || '(none)'}\n\n-- MEMBERS --\n${members.map((p, i) => `${i + 1}. ${num(p.id)}${p.admin ? ' [admin]' : ''}`).join('\n')}\n`;
    const left = getMemberLog(m.chat, 'left', 500).map((e, i) => `${i + 1}. ${num(e.jid)} · ${new Date(e.at).toISOString()}`).join('\n') || '(none)';
    const kicked = getMemberLog(m.chat, 'kicked', 500).map((e, i) => `${i + 1}. ${num(e.jid)} · by ${e.by ? num(e.by) : '?'} · ${new Date(e.at).toISOString()}`).join('\n') || '(none)';
    const stamp = Date.now();
    const zip = zipFiles([
      { name: 'roster.txt', data: Buffer.from(roster, 'utf8') },
      { name: 'left.txt', data: Buffer.from(`LEFT (${getMemberLog(m.chat, 'left', 500).length})\n${left}\n`, 'utf8') },
      { name: 'kicked.txt', data: Buffer.from(`KICKED (${getMemberLog(m.chat, 'kicked', 500).length})\n${kicked}\n`, 'utf8') },
    ]);
    await sock.sendMessage(m.chat, {
      text: `▣ ${ui.fonts.bold('GROUP BACKUP')}\n${'─'.repeat(22)}\n◦ members ⟶ ${members.length}\n◦ admins ⟶ ${admins.length}\n◦ left ⟶ ${getMemberLog(m.chat, 'left', 500).length}\n◦ kicked ⟶ ${getMemberLog(m.chat, 'kicked', 500).length}\n\n${ui.footer()}`,
    }, { quoted: m.raw });
    await sock.sendMessage(m.chat, { document: zip, mimetype: 'application/zip', fileName: `backup-${(meta.subject || 'group').replace(/[^\w-]+/g, '_').slice(0, 24)}-${stamp}.zip` }, { quoted: m.raw }).catch(() => {});
  },
};
