// XADON AI · age (imported format).
module.exports = {
  name: 'age',
  aliases: ['howold', 'myage'],
  description: 'Age from birthdate',
  category: 'extra',
  groupOnly: false,
  ownerOnly: false,
  async execute(sock, m, extra) {
    const { args, reply, ui } = extra;
    const s = String(args[0] || '');
    const mt = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!mt) return reply(ui.notice('info', 'Age', 'Usage: .age 2001-05-14'));
    const born = new Date(`${s}T00:00:00Z`);
    if (Number.isNaN(born.getTime()) || born > new Date()) return reply(ui.notice('error', 'Bad date', 'Use a past date YYYY-MM-DD.'));
    const now = new Date();
    let y = now.getUTCFullYear() - born.getUTCFullYear();
    let mo = now.getUTCMonth() - born.getUTCMonth();
    let d = now.getUTCDate() - born.getUTCDate();
    if (d < 0) { mo--; d += 30; }
    if (mo < 0) { y--; mo += 12; }
    return reply(ui.card({ icon: '\u25C9', title: 'Age', subtitle: s, rows: [['years', String(y)], ['months', String(mo)], ['days', String(d)]] }));
  },
};
