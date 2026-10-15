module.exports = {
  name: 'revoke',
  alias: ['resetlink', 'revokelink'],
  desc: 'Reset the group invite link',
  group: true, admin: true, botAdmin: true,
  async run({ sock, m, reply, ui }) {
    try {
      await sock.groupRevokeInvite(m.chat);
      const code = await sock.groupInviteCode(m.chat);
      await reply(ui.notice('success', 'Link reset', `New link: https://chat.whatsapp.com/${code}`));
    } catch { await reply(ui.notice('error', 'Failed', 'I need admin rights to reset the link.')); }
  },
};
