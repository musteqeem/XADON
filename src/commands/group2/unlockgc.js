// XADON AI · GROUP — premium unicode card, no emojis.
module.exports = {
  name: 'unlockgc',
  alias: ['gcunlock'],
  desc: 'Unlock group chat',
  group: true, admin: true, botAdmin: true, category: 'group2',
  async run({ sock, m, reply, ui }) {
    await sock.groupSettingUpdate(m.chat, 'not_announcement').catch(() => { throw new Error('unlock failed'); });
    return reply(ui.notice('success', 'Group unlocked', 'Everyone can send messages now.'));
  },
};
