// XADON AI · clearchat (imported format).
module.exports = {
  name: 'clearchat',
  aliases: ['clear', 'wipedb'],
  description: 'Delete bot command replies hint / clear deleted log',
  category: 'extra',
  groupOnly: false,
  ownerOnly: false,
  async execute(sock, m, extra) {
    const { args, reply, ui } = extra;
    const store = require('../../lib/msgstore');
    store.clearDeleted(m.chat);
    return reply(ui.notice('success', 'Chat log cleared', 'Deleted-message log for this chat was wiped. Note: WhatsApp lets bots delete only their own messages.'));
  },
};
