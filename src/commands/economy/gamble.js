// XADON AI · ECONOMY — premium unicode card, no emojis.
module.exports = {
  name: 'gamble',
  alias: ['betx'],
  desc: 'Bet coins (50/50)',
  usage: '.gamble <amount>',
  category: 'economy',
  async run({ m, args, reply, ui, db, prefix }) {
    const { fonts } = ui;
    const amt = Math.max(10, parseInt(args[0] || '0', 10) || 0);
    if (!amt) return reply(ui.notice('info', 'Gamble', `${fonts.mono(`${prefix}gamble 50`)}`));
    const k = `eco:${m.sender}`;
    const b = db.get(k, { coins: 100, last: 0 });
    if (b.coins < amt) return reply(ui.notice('error', 'No funds', `Balance: ${b.coins}.`));
    const win = (Date.now() + m.sender.length) % 2 === 0;
    b.coins += win ? amt : -amt; db.set(k, b);
    return reply(ui.card({ icon: win ? '✓' : '✗', title: win ? 'You won' : 'You lost', subtitle: 'coin flip', rows: [['change', fonts.bold(`${win ? '+' : '-'}${amt}`)], ['balance', fonts.bold(String(b.coins))]], body: ui.footer() }));
  },
};
