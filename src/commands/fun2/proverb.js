// XADON AI · FUN — premium unicode card, no emojis.
const P = ['A calm sea never made a skilled sailor.', 'Patience cooks a stone.', 'Slow motion is better than no motion.', 'Unity is strength.'];
module.exports = {
  name: 'proverb',
  alias: ['proverbx'],
  desc: 'African proverb drop',
  category: 'fun2',
  async run({ reply, ui }) {
    const { fonts } = ui;
    return reply([`\u25C8 ${fonts.bold('PROVERB')}`, '', fonts.italic(P[Date.now() % P.length]), '', ui.footer()].join('\n'));
  },
};
