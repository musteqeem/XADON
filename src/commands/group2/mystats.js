// XADON V12 · PREMIUM — mystats: your activity rank in this chat.
// Usage: .mystats  (or reply with .mystats to check someone else)
const { getRecent, digit } = require('../../message-handler');
const short = (j = '') => String(j).split('@')[0].split(':')[0];
module.exports = {
  name: 'mystats',
  alias: ['myrank', 'meboard'],
  desc: 'Your message rank in this chat',
  usage: '.mystats',
  group: true, category: 'group2',
  async run({ m, reply, ui, target }) {
    const recent = getRecent(m.chat, 400);
    if (!recent.length) return reply(ui.notice('info', 'No data', 'Not enough recent activity cached yet.'));
    const who = target() || (m.quoted?.sender ?? m.sender);
    const counts = {};
    for (const e of recent) { const k = short(e.sender); counts[k] = (counts[k] || 0) + 1; }
    const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const mine = String(who).split('@')[0].split(':')[0];
    const pos = ranked.findIndex(([num]) => num === mine || digit(num) === digit(mine));
    const total = new Set(recent.map((e) => short(e.sender))).size;
    if (pos < 0) return reply(ui.notice('info', 'Ghost 👻', `@${mine} sent nothing in the last ${recent.length} messages.`));
    const pct = Math.round(((total - pos) / Math.max(1, total)) * 100);
    return reply(ui.card({
      icon: '◍', title: 'My stats', subtitle: `@${mine} · rank #${pos + 1}/${total}`,
      rows: [
        ['messages', `${ranked[pos][1]} of last ${recent.length}`],
        ['rank', `#${pos + 1} of ${total} talkers`],
        ['percentile', `top ${100 - pct + 1}%`],
      ],
      body: pos === 0 ? 'Chat champion. Unmatched. 👑' : `${ranked[0][1] - ranked[pos][1]} msgs behind @${ranked[0][0]}.`,
    }), { mentions: [mine, ranked[0][0]].filter((x) => x && !/lid$/.test(x)).map((x) => `${x}@s.whatsapp.net`) });
  },
};
