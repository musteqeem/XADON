// XADON AI · ECONOMY — premium unicode card, no emojis.
module.exports = {
  name: 'balance',
  alias: ['balx'],
  desc: 'Check coin balance',
  category: 'economy',
  async run({ m, reply, ui, db }) {
    const { fonts } = ui;
    const b = db.get(`eco:${m.sender}`, { coins: 100, last: 0 });
    return reply(ui.card({ icon: '◈', title: 'Wallet', subtitle: m.pushName, rows: [['coins', fonts.bold(String(b.coins))]], body: ui.footer() }));
  },
};
