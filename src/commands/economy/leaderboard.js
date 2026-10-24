// XADON AI · ECONOMY — premium unicode card, no emojis.
module.exports = {
  name: 'leaderboard',
  alias: ['richlist'],
  desc: 'Top coin holders',
  category: 'economy',
  async run({ reply, ui, db }) {
    const { fonts } = ui;
    const all = db.all();
    const rows = Object.entries(all).filter(([k]) => k.startsWith('eco:')).map(([k, v]) => [k.slice(4).split('@')[0], v.coins || 0]).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const body = rows.length ? rows.map(([n, c], i) => `${fonts.mono(String(i + 1).padStart(2, '0'))} ${n}  ${fonts.bold(String(c))}`).join('\n') : fonts.smallCaps('no players yet — use .daily');
    return reply(ui.card({ icon: '♛', title: 'Leaderboard', subtitle: 'coin rank', rows: [], body: body + `\n\n${ui.footer()}` }));
  },
};
