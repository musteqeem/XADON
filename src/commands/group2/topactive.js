// XADON V12 · PREMIUM — topactive: most active talkers (cached window).
// Usage: .topactive [5-20]
const { getRecent } = require('../../message-handler');
const short = (j = '') => String(j).split('@')[0].split(':')[0];
module.exports = {
  name: 'topactive',
  alias: ['activeboard', 'talkers'],
  desc: 'Top talkers leaderboard',
  usage: '.topactive 10',
  group: true, category: 'group2',
  async run({ m, args, reply, ui }) {
    const n = Math.min(20, Math.max(5, Number(args[0]) || 10));
    const recent = getRecent(m.chat, 400);
    if (!recent.length) return reply(ui.notice('info', 'No data', 'Not enough recent activity cached yet.'));
    const counts = {};
    for (const e of recent) { const k = short(e.sender); counts[k] = (counts[k] || 0) + 1; }
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, n);
    const medals = ['🥇', '🥈', '🥉'];
    const lines = top.map(([num, c], i) => `${medals[i] || `${i + 1}.`} @${num} — ${c} msgs`).join('\n');
    return reply(ui.card({
      icon: '◉', title: 'Top active', subtitle: `last ${recent.length} messages`,
      rows: [['chattiest', `@${top[0][0]} · ${top[0][1]}`]],
      body: lines,
    }), { mentions: top.map(([num]) => (/lid$/.test(num) ? null : `${num}@s.whatsapp.net`)).filter(Boolean) });
  },
};
