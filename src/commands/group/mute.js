module.exports = {
  name: 'mute',
  alias: ['lock', 'close'],
  desc: 'Only admins can send messages',
  group: true, admin: true, botAdmin: true,
  async run({ sock, m, reply, ui }) {
    await sock.groupSettingUpdate(m.chat, 'announcement');
    await reply(ui.notice('success', 'Group muted', 'Only admins can send messages now. Use .unmute to reopen.'));
  },
};
