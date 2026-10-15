// XADON AI · GAMES — premium unicode card, no emojis.
const R = [['I speak without a mouth and hear without ears. What am I?', 'echo'], ['The more of me you take, the more you leave behind. What am I?', 'footsteps'], ['What has keys but opens no locks?', 'keyboard'], ['What runs but never walks?', 'water']];
module.exports = {
  name: 'riddle',
  alias: ['riddlex'],
  desc: 'Random riddle',
  category: 'games',
  async run({ reply, ui }) {
    const { fonts } = ui;
    const r = R[Date.now() % R.length];
    return reply(ui.card({ icon: '?', title: 'Riddle', subtitle: 'solve it', rows: [], body: `${fonts.italic(r[0])}\n\n${fonts.smallCaps('answer')} ⟶ ${fonts.bold(r[1])}\n\n${ui.footer()}` }));
  },
};
