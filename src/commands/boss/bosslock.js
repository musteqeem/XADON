// BOSSLOCK · lock/unlock group (announcement mode)
module.exports = {
  name: 'bosslock', alias: ['block2'], desc: 'Lock or unlock the group', usage: '.bosslock on|off', category: 'boss', group: true, admin: true, botAdmin: true,
  async run({ args, reply, ui, sock, m }) {
    const v = (args[0] || 'on').toLowerCase();
    try {
      await sock.groupSettingUpdate(m.chat, v === 'off' ? 'not_announcement' : 'announcement');
      return reply(ui.notice('success', v === 'off' ? 'Unlocked' : 'Locked', v === 'off' ? 'Everyone can talk now.' : 'Only admins can talk now. Boss order.'));
    } catch { return reply(ui.notice('error', 'Failed', 'Make the bot admin first.')); }
  },
};
