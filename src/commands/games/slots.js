// XADON AI · GAMES — premium unicode card, no emojis.
const S = ['◈', '◉', '★', '♦', '♣'];
module.exports = {
  name: 'slots',
  alias: ['slotx'],
  desc: 'Slot machine spin',
  category: 'games',
  async run({ reply, ui }) {
    const { fonts } = ui;
    const t = Date.now();
    const r = [S[t % 5], S[(t >> 3) % 5], S[(t >> 5) % 5]];
    const win = r[0] === r[1] && r[1] === r[2];
    return reply(ui.card({ icon: '▣', title: r.join(' | '), subtitle: win ? 'jackpot' : 'spin again', rows: [['result', win ? fonts.bold('WIN') : fonts.smallCaps('no luck')]], body: ui.footer() }));
  },
};
