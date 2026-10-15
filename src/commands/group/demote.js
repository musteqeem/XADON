module.exports = {
  name: 'demote',
  alias: ['unadmin', 'deadmin'],
  desc: 'Demote a group admin',
  usage: '.demote @user  |  reply with .demote',
  group: true, admin: true, botAdmin: true,
  async run({ sock, m, ui, target, fail }) {
    const jid = target();
    if (!jid) return fail('Who to demote?', 'Mention someone, reply to them, or type their number.');
    await sock.groupParticipantsUpdate(m.chat, [jid], 'demote');
    await sock.sendMessage(m.chat, { text: `◦ ${ui.fonts.bold('DEMOTED')}\n@${jid.split('@')[0]} ${ui.fonts.smallCaps('is no longer an admin')}\n\n${ui.footer()}`, mentions: [jid] }, { quoted: m.raw });
  },
};
