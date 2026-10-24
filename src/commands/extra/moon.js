// XADON AI · moon (imported format).
module.exports = {
  name: 'moon',
  aliases: ['moonphase', 'lunar'],
  description: 'Today moon phase',
  category: 'extra',
  groupOnly: false,
  ownerOnly: false,
  async execute(sock, m, extra) {
    const { reply, ui } = extra;
    const synodic = 29.53058867;
    const ref = Date.UTC(2000, 0, 6, 18, 14) / 86400000;
    const days = Date.now() / 86400000 - ref;
    const age = ((days % synodic) + synodic) % synodic;
    const names = [[1.84566, 'New moon'], [5.53699, 'Waxing crescent'], [9.22831, 'First quarter'], [12.91963, 'Waxing gibbous'], [16.61096, 'Full moon'], [20.30228, 'Waning gibbous'], [23.99361, 'Last quarter'], [27.68493, 'Waning crescent']];
    let phase = 'New moon';
    for (const [limit, n] of names) { phase = n; if (age < limit) break; }
    return reply(ui.card({ icon: '\u263D', title: 'Moon phase', subtitle: new Date().toISOString().slice(0, 10), rows: [['phase', phase], ['age', age.toFixed(1) + ' days']] }));
  },
};
