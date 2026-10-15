// XADON AI · GROUP — premium unicode card, no emojis.
module.exports = {
  name: 'lockgc',
  alias: ['gclock'],
  desc: 'Lock group (admins only)',
  group: true, admin: true, botAdmin: true, category: 'group2',
  async run({ sock, m, reply, ui }) {
    await sock.groupSettingUpdate(m.chat, 'announcement').catch(() => { throw new Error('lock failed'); });
    return reply(ui.notice('success', 'Group locked', 'Only admins can send messages now.'));
  },
};
