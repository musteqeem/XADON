// XADON AI · ECONOMY — premium unicode card, no emojis.
module.exports = {
  name: 'daily',
  alias: ['dailyx'],
  desc: 'Claim daily coins',
  category: 'economy',
  async run({ m, reply, ui, db }) {
    const { fonts } = ui;
    const k = `eco:${m.sender}`;
    const b = db.get(k, { coins: 100, last: 0 });
    if (Date.now() - (b.last || 0) < 86400000) {
      const h = Math.ceil((86400000 - (Date.now() - b.last)) / 3600000);
      return reply(ui.notice('warn', 'Already claimed', `Come back in about ${h}h.`));
    }
    b.coins += 250; b.last = Date.now(); db.set(k, b);
    return reply(ui.card({ icon: '◈', title: '+250 coins', subtitle: 'daily reward', rows: [['balance', fonts.bold(String(b.coins))]], body: ui.footer() }));
  },
};
