// XADON V11 · PREMIUM — kickall: remove every non-admin member (2-step confirm).
// Skips admins, owner-privileged users and the bot. Delivers a .zip of removed.
// Usage: .kickall | .kickall confirm
const { pushMemberLog } = require('../../message-handler');
const { zipText } = require('../../lib/zipmini');
const privs = require('../../lib/privs');
const config = require('../../../config');
const pending = new Map(); // chat -> timeout
const digits = (j = '') => String(j).split('@')[0].split(':')[0].replace(/\D/g, '');
module.exports = {
  name: 'kickall',
  alias: ['masskick', 'removeall'],
  desc: 'Remove all non-admin members (premium, confirm twice)',
  usage: '.kickall | .kickall confirm',
  group: true, admin: true, botAdmin: true, category: 'group',
  async run({ sock, m, args, reply, ui, db, group }) {
    const meta = group || await sock.groupMetadata(m.chat).catch(() => null);
    if (!meta) return reply(ui.notice('error', 'Failed', 'Could not read the member list.'));
    const botNum = digits(sock.user?.id);
    const targets = (meta.participants || []).filter((p) => {
      if (p.admin) return false;
      const d = digits(p.id);
      if (!d || d === botNum) return false;
      if (privs.isSudoPriv(db, config, d)) return false;
      return true;
    });
    if (!targets.length) return reply(ui.notice('info', 'Nothing to do', 'No removable non-admin members found.'));
    if (String(args[0] || '').toLowerCase() !== 'confirm') {
      pending.set(m.chat, setTimeout(() => pending.delete(m.chat), 60000).unref?.());
      return reply(ui.card({
        icon: '⊘', title: 'Kickall — confirm', subtitle: `${targets.length} members will go`,
        rows: [['targets', `${targets.length} non-admins`], ['exempt', 'admins · owner circle · bot']],
        body: `Reply ${ui.fonts.mono('.kickall confirm')} within 60s to execute.\nGuard: .antikickall disarmed owners only — owner-priv users are skipped.`,
      }));
    }
    if (!pending.has(m.chat)) return reply(ui.notice('warn', 'Expired', 'Start again with .kickall first.'));
    pending.delete(m.chat);
    const removed = [];
    for (const p of targets) {
      try {
        await sock.groupParticipantsUpdate(m.chat, [p.id], 'remove');
        removed.push(p.id);
        try { pushMemberLog(m.chat, 'kicked', { jid: p.id, by: m.sender, name: '' }); } catch {}
        await new Promise((r) => setTimeout(r, 700));
      } catch {}
    }
    const full = `KICKALL — ${(meta.subject || m.chat)}\nBy: ${digits(m.sender)} · removed ${removed.length}/${targets.length}\n${'='.repeat(40)}\n${removed.map((j, i) => `${i + 1}. ${digits(j)}`).join('\n')}\n`;
    await sock.sendMessage(m.chat, {
      text: `⊘ ${ui.fonts.bold('KICKALL DONE')} · ${removed.length}/${targets.length} removed\n${ui.footer()}`,
    }, { quoted: m.raw }).catch(() => {});
    const tag = `kickall-${m.chat.split('@')[0]}.txt`;
    await sock.sendMessage(m.chat, { document: zipText(tag, full), mimetype: 'application/zip', fileName: tag.replace(/\.txt$/, '.zip') }).catch(() => {});
  },
};
