module.exports = {
  name: 'dice',
  alias: ['roll', 'die'],
  desc: 'Roll a dice',
  usage: '.dice 6',
  async run({ args, reply, ui }) {
    const { fonts } = ui;
    const sides = Math.max(2, Math.min(100, Number(args[0]) || 6));
    const n = 1 + Math.floor(Math.random() * sides);
    await reply([`⚄ ${fonts.bold('DICE ROLL')}`, '', `  ${fonts.serif(`${n}`)} ${fonts.smallCaps(`of ${sides}`)}`, '', ui.footer()].join('\n'));
  },
};
