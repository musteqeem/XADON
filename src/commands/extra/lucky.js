// XADON AI · lucky (imported format).
module.exports = {
  name: 'lucky',
  aliases: ['luck', 'lucktoday'],
  description: 'Your luck of the day (same all day)',
  category: 'extra',
  groupOnly: false,
  ownerOnly: false,
  async execute(sock, m, extra) {
    const crypto = require('crypto');
    const { reply, ui } = extra;
    const day = new Date().toISOString().slice(0, 10);
    const h = crypto.createHash('sha256').update(m.sender + day).digest();
    const num = (h[0] % 99) + 1;
    const colors = ['red', 'gold', 'blue', 'green', 'purple', 'black', 'white', 'orange'];
    return reply(ui.card({ icon: '\u2726', title: 'Luck of the day', subtitle: day, rows: [['number', String(num)], ['color', colors[h[1] % colors.length]], ['score', (55 + (h[2] % 45)) + '%']] }));
  },
};
