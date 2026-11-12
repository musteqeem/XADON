module.exports = {
  name: 'bossmute', alias: ['bmute'], desc: 'Mute group quickly', usage: '.bossmute', category: 'boss', group: true, admin: true, botAdmin: true,
  async run({ reply, ui, sock, m }) {
    try { await sock.groupSettingUpdate(m.chat, 'announcement'); return reply(ui.notice('success', 'Muted', 'Group muted by boss.')); }
    catch { return reply(ui.notice('error', 'Failed', 'Make the bot admin first.')); }
  },
};
