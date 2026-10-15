module.exports = {
  name: 'unmute',
  alias: ['unlock', 'open'],
  desc: 'Everyone can send messages',
  group: true, admin: true, botAdmin: true,
  async run({ sock, m, reply, ui }) {
    await sock.groupSettingUpdate(m.chat, 'not_announcement');
    await reply(ui.notice('success', 'Group opened', 'Everyone can send messages now.'));
  },
};
