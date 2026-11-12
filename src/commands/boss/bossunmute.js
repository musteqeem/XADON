module.exports = {
  name: 'bossunmute', alias: ['bunmute'], desc: 'Unmute group quickly', usage: '.bossunmute', category: 'boss', group: true, admin: true, botAdmin: true,
  async run({ reply, ui, sock, m }) {
    try { await sock.groupSettingUpdate(m.chat, 'not_announcement'); return reply(ui.notice('success', 'Unmuted', 'Everyone can talk again.')); }
    catch { return reply(ui.notice('error', 'Failed', 'Make the bot admin first.')); }
  },
};
