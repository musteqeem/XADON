// XADON AI · deleted — show the last 5 deleted messages in this chat (group + private).
// Store: lib/msgstore via connection.js messages.update revoke hook + handler cache.
const store = require('../../lib/msgstore');
module.exports = {
  name: 'deleted',
  alias: ['dels', 'antidel', 'showdeleted'],
  desc: 'Show last deleted messages here',
  usage: '.deleted [1-5] | .deleted clear',
  category: 'extra',
  async run({ m, args, reply, ui }) {
    const t = String(args[0] || '').toLowerCase();
    if (t === 'clear' || t === 'clean') { store.clearDeleted(m.chat); return reply(ui.notice('success', 'Cleared', 'Deleted-message log for this chat was cleared.')); }
    let n = parseInt(args[0] || '5', 10);
    if (!Number.isFinite(n)) n = 5;
    n = Math.max(1, Math.min(5, n));
    const list = store.getDeleted(m.chat, 5).slice(0, n);
    if (!list.length) return reply(ui.notice('info', 'No deleted messages', 'Nothing deleted here yet. The bot logs the last 5 deletes per chat automatically.'));
    const lines = list.map((d, i) => {
      const who = d.sender ? '@' + String(d.sender).split('@')[0].split(':')[0] : 'unknown';
      const when = d.deletedAt ? new Date(d.deletedAt).toLocaleTimeString('en-GB') : '';
      const body = (d.body || `[${d.type || 'media'}]`).slice(0, 400);
      return `${i + 1}. ${who} ${when ? '(' + when + ')' : ''}\n   ${body}`;
    });
    const mentions = list.map((d) => d.sender).filter(Boolean);
    return reply(ui.card({ icon: '\u267B', title: 'Deleted messages', subtitle: `${list.length} of last 5 in this chat`, rows: [], body: lines.join('\n\n') }) , { mentions });
  },
};
