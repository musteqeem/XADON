// XADON AI · OWNER — premium unicode card, no emojis.
module.exports = {
  name: 'leavegroup',
  alias: ['leavex'],
  desc: 'Leave this group',
  group: true, owner: true, category: 'owner2',
  async run({ sock, m, reply, ui }) {
    await reply(ui.notice('warn', 'Leaving', 'Goodbye. Use the invite link to bring me back.'));
    await sock.groupLeave(m.chat).catch(() => {});
  },
};
