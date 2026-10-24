// XADON AI · statuslist — list recently seen status updates (imported format demo).
module.exports = {
  name: 'statuslist',
  aliases: ['statuses', 'vstatus'],
  description: 'List recent status updates seen by the bot',
  category: 'extra',
  groupOnly: false,
  async execute(sock, m, extra) {
    const { reply, ui } = extra;
    const store = require('../../lib/msgstore');
    const list = store.getStatuses(15);
    if (!list.length) return reply(ui.notice('info', 'No statuses', 'No status updates cached yet. The bot caches status@broadcast as they arrive.'));
    const rows = list.slice(0, 12).map((s) => [String(s.sender || '').split('@')[0].slice(-6) || 'unknown', `${s.type || 'text'} — ${(s.body || '').slice(0, 40) || 'media'}`]);
    return reply(ui.card({ icon: '\u25C9', title: 'Recent statuses', subtitle: `${list.length} cached`, rows }));
  },
};
