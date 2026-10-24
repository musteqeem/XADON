// XADON AI · GROUP — premium unicode card, no emojis.
module.exports = {
  name: 'gclink',
  alias: ['glinkx'],
  desc: 'Get group invite link',
  group: true, admin: true, botAdmin: true, category: 'group2',
  async run({ sock, m, reply, ui }) {
    const { fonts } = ui;
    try {
      const code = await sock.groupInviteCode(m.chat);
      return reply(ui.card({ icon: '\u2318', title: 'Invite link', subtitle: 'share carefully', rows: [], body: `${fonts.mono(`https://chat.whatsapp.com/${code}`)}\n\n${ui.footer()}` }));
    } catch { return reply(ui.notice('error', 'No link', 'I need admin rights to fetch the link.')); }
  },
};
