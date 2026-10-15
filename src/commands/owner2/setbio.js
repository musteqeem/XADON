// XADON AI · OWNER — premium unicode card, no emojis.
module.exports = {
  name: 'setbio',
  alias: ['bio set'],
  desc: 'Change bot bio',
  usage: '.setbio <text>',
  owner: true, category: 'owner2',
  async run({ sock, text, reply, ui }) {
    if (!text) return reply(ui.notice('info', 'Bio', 'Give me the new bio text.'));
    try { await sock.updateProfileStatus(text.slice(0, 139)); return reply(ui.notice('success', 'Bio updated', text.slice(0, 139))); }
    catch { return reply(ui.notice('error', 'Bio failed', 'Could not update status.')); }
  },
};
