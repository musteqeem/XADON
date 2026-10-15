/** XADON warn system — 3 strikes auto-kick (Cody AI style). */
module.exports = {
  name: 'warn',
  alias: ['warnuser'],
  desc: 'Warn a member (3 = kick)',
  usage: '.warn @user reason  ·  .warn reset @user',
  group: true, admin: true, botAdmin: true,
  async run({ sock, m, args, reply, ui, target, db, fail }) {
    const { fonts } = ui;
    const jid = target();
    if (!jid) return fail('Who to warn?', 'Mention, reply to, or type the number.');
    const key = `warns:${m.chat}:${jid}`;
    if (/^(reset|clear|0)$/i.test(args[0] || '')) { db.set(key, []); return reply(ui.notice('success', 'Warnings cleared', `All warnings for @${jid.split('@')[0]} removed.`)); }
    // When first arg is a mention/number it is consumed as the target; rest is the reason.
    let reason = args.join(' ').replace(/@\d+/g, '').replace(/^\d+\s*/, '').trim() || 'No reason given';
    if (/^(reset|clear)/i.test(reason)) reason = 'No reason given';
    const warns = db.get(key, []);
    warns.push({ by: m.sender, reason: reason.slice(0, 200), at: Date.now() });
    db.set(key, warns.slice(-10));
    if (warns.length >= 3) {
      db.set(key, []);
      try { await sock.groupParticipantsUpdate(m.chat, [jid], 'remove'); } catch {}
      return sock.sendMessage(m.chat, { text: `⊘ ${fonts.bold('3 STRIKES — REMOVED')}\n@${jid.split('@')[0]} ${fonts.smallCaps('reached 3 warnings and was removed')}\n${fonts.smallCaps('last reason')} ⟶ ${fonts.italic(reason.slice(0, 120))}\n\n${ui.footer()}`, mentions: [jid] });
    }
    await sock.sendMessage(m.chat, { text: `⚠ ${fonts.bold(`WARNING ${warns.length}/3`)}\n@${jid.split('@')[0]} ⟶ ${fonts.italic(reason.slice(0, 150))}\n${fonts.smallCaps('3 warnings = automatic removal')}\n\n${ui.footer()}`, mentions: [jid] }, { quoted: m.raw });
  },
};
