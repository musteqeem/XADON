// XADON V11 · PREMIUM — disarm: strip ALL admins except owner circle + bot.
// Rogue-admin cleanup in one shot (2-step confirm).
// Usage: .disarm | .disarm confirm
const privs = require('../../lib/privs');
const config = require('../../../config');
const pending = new Map();
const digits = (j = '') => String(j).split('@')[0].split(':')[0].replace(/\D/g, '');
module.exports = {
  name: 'disarm',
  alias: ['stripadmins', 'demoteall'],
  desc: 'Demote all admins except owner circle + bot',
  usage: '.disarm | .disarm confirm',
  group: true, admin: true, botAdmin: true, category: 'group',
  async run({ sock, m, args, reply, ui, db, group }) {
    const meta = group || await sock.groupMetadata(m.chat).catch(() => null);
    if (!meta) return reply(ui.notice('error', 'Failed', 'Could not read the admin list.'));
    const botNum = digits(sock.user?.id);
    const targets = (meta.participants || []).filter((p) => {
      if (!p.admin) return false;
      const d = digits(p.id);
      if (!d || d === botNum) return false;
      if (privs.isSudoPriv(db, config, d)) return false;
      return true;
    });
    if (!targets.length) return reply(ui.notice('info', 'Nothing to do', 'No demotable admins found (owner circle + bot are safe).'));
    if (String(args[0] || '').toLowerCase() !== 'confirm') {
      pending.set(m.chat, setTimeout(() => pending.delete(m.chat), 60000).unref?.());
      const names = targets.slice(0, 10).map((p) => `• @${digits(p.id)}`).join('\n');
      await sock.sendMessage(m.chat, {
        text: `⛨ ${ui.fonts.bold('DISARM')} · ${targets.length} admins will fall\n${'─'.repeat(22)}\n${names}${targets.length > 10 ? `\n… +${targets.length - 10} more` : ''}\n\nReply ${ui.fonts.mono('.disarm confirm')} within 60s.`,
        mentions: targets.slice(0, 10).map((p) => (/lid$/.test(p.id) ? null : `${digits(p.id)}@s.whatsapp.net`)).filter(Boolean),
      }, { quoted: m.raw });
      return;
    }
    if (!pending.has(m.chat)) return reply(ui.notice('warn', 'Expired', 'Start again with .disarm first.'));
    pending.delete(m.chat);
    let n = 0;
    for (const p of targets) {
      try { await sock.groupParticipantsUpdate(m.chat, [p.id], 'demote'); n++; await new Promise((r) => setTimeout(r, 700)); } catch {}
    }
    return reply(ui.notice('success', 'Disarmed', `${n}/${targets.length} admins demoted. Owner circle + bot untouched.`));
  },
};
