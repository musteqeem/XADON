module.exports = {
  name: 'promote',
  alias: ['admin', 'makeadmin'],
  desc: 'Promote a member to admin',
  usage: '.promote @user  |  reply with .promote',
  group: true, admin: true, botAdmin: true,
  async run({ sock, m, ui, target, fail }) {
    const jid = target();
    if (!jid) return fail('Who to promote?', 'Mention someone, reply to them, or type their number.');
    await sock.groupParticipantsUpdate(m.chat, [jid], 'promote');
    await sock.sendMessage(m.chat, { text: `♛ ${ui.fonts.bold('PROMOTED')}\n@${jid.split('@')[0]} ${ui.fonts.smallCaps('is now an admin')}\n\n${ui.footer()}`, mentions: [jid] }, { quoted: m.raw });
  },
};
