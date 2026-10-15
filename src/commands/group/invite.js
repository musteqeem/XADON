module.exports = {
  name: 'invite',
  alias: ['invitelink', 'grouplink'],
  desc: 'Get the group invite link',
  group: true, admin: true, botAdmin: true,
  async run({ sock, m, reply, ui }) {
    const { fonts } = ui;
    try {
      const code = await sock.groupInviteCode(m.chat);
      await reply(ui.card({ icon: '✉', title: 'Invite link', subtitle: 'share with care', rows: [], body: `${fonts.mono(`https://chat.whatsapp.com/${code}`)}\n\n${ui.footer()}` }));
    } catch { await reply(ui.notice('error', 'No link', 'I need admin rights to fetch the invite code.')); }
  },
};
