module.exports = {
  name: 'coin',
  alias: ['toss', 'flip', 'heads'],
  desc: 'Flip a coin',
  async run({ reply, ui }) {
    const { fonts } = ui;
    const win = Math.random() < 0.5;
    await reply([`◎ ${fonts.bold('COIN TOSS')}`, '', `  ${fonts.serif(win ? 'H E A D S' : 'T A I L S')}`, '', ui.footer()].join('\n'));
  },
};
