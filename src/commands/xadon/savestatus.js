/** XADON V9 · savestatus — show recently seen statuses + how to repost them. */
module.exports = {
  name: 'savestatus',
  alias: ['statusdl', 'statusave', 'viewstatus'],
  desc: 'List recently seen statuses',
  usage: '.savestatus [1-10]',
  category: 'xadon9',
  owner: true,
  async run({ m, args, reply, ui }) {
    const store = require('../../lib/msgstore');
    let n = parseInt(args[0] || '10', 10);
    if (!Number.isFinite(n)) n = 10;
    n = Math.max(1, Math.min(10, n));
    const list = store.getStatuses(n);
    if (!list.length) return reply(ui.notice('info', 'No statuses yet', 'No status updates cached. The bot logs statuses it receives while online.'));
    const lines = list.map((s, i) => {
      const who = s.sender ? '@' + String(s.sender).split('@')[0].split(':')[0] : 'unknown';
      const body = (s.body || `[${s.type || 'media'}]`).slice(0, 120);
      return `${i + 1}. ${who} — ${body}`;
    });
    const mentions = list.map((s) => s.sender).filter(Boolean);
    return reply(ui.card({ icon: '◈', title: 'Recent statuses', subtitle: `${list.length} cached`, rows: [], body: lines.join('\n') }), { mentions });
  },
};
