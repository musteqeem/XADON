/** XADON V9 · delmeta — remove Meta AI from a group. */
const { META_JID } = require('./addmeta');
module.exports = {
  name: 'delmeta',
  alias: ['metadel', 'removemeta', 'delai'],
  desc: 'Remove Meta AI from this group',
  usage: '.delmeta',
  category: 'xadon9',
  group: true, admin: true, botAdmin: true,
  async run({ sock, m, reply, ui }) {
    try {
      await sock.groupParticipantsUpdate(m.chat, [META_JID], 'remove');
      return reply(ui.notice('success', 'Meta AI removed', 'Meta AI is no longer in this group. Bring it back with .addmeta'));
    } catch (e) {
      return reply(ui.notice('error', 'Remove failed', String(e.message || e).slice(0, 250)));
    }
  },
};
