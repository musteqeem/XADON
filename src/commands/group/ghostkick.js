// XADON V11 · PREMIUM — ghostkick: remove a member with no group announcement.
// Only the owner DM gets the log line. Confirmation self-deletes.
// Usage: .ghostkick @user | reply with .ghostkick
const config = require('../../../config');
module.exports = {
  name: 'ghostkick',
  alias: ['silentkick', 'shadowkick'],
  desc: 'Remove a member silently (owner DM log only)',
  usage: '.ghostkick @user  ·  reply with .ghostkick',
  group: true, admin: true, botAdmin: true, category: 'group',
  async run({ sock, m, target, fail, ui }) {
    const jid = target();
    if (!jid) return fail('Who should vanish?', 'Mention someone, reply to them, or type the number.');
    const [result] = await sock.groupParticipantsUpdate(m.chat, [jid], 'remove').catch(() => [{}]);
    if (result?.status && result.status !== '200') return fail('Could not remove', `WhatsApp said: ${ui.fonts.mono(String(result.status))}`);
    try {
      const ownerJid = `${String(config.ownerNumbers[0]).replace(/\D/g, '')}@s.whatsapp.net`;
      await sock.sendMessage(ownerJid, { text: `GHOSTKICK: ${jid.split('@')[0]} removed from ${(m.chat || '').split('@')[0]} by ${m.sender.split('@')[0]}` }).catch(() => {});
    } catch {}
    try {
      const sent = await sock.sendMessage(m.chat, { text: ui.fonts.smallCaps('done.') }, { quoted: m.raw });
      if (sent?.key) setTimeout(() => sock.sendMessage(m.chat, { delete: sent.key }).catch(() => {}), 5000).unref?.();
    } catch {}
  },
};
