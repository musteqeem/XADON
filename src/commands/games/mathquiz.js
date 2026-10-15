// XADON AI · GAMES — premium unicode card, no emojis.
module.exports = {
  name: 'mathquiz',
  alias: ['mathx'],
  desc: 'Quick maths challenge',
  category: 'games',
  async run({ reply, ui }) {
    const { fonts } = ui;
    const a = 2 + (Date.now() % 18), b = 2 + (Math.floor(Date.now() / 7) % 18);
    return reply(ui.card({ icon: '×', title: 'Math quiz', subtitle: 'solve it', rows: [['question', fonts.bold(`${a} x ${b} = ?`)]], body: `${fonts.smallCaps('answer')} ⟶ ${fonts.bold(String(a * b))}\n\n${ui.footer()}` }));
  },
};
