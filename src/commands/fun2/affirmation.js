// XADON AI · FUN — premium unicode card, no emojis.
module.exports = {
  name: 'affirmation',
  alias: ['affirmx'],
  desc: 'Daily affirmation',
  category: 'fun2',
  async run({ reply, ui }) {
    const { fonts } = ui;
    try {
      const j = await fetch('https://www.affirmations.dev/').then((r) => r.json());
      return reply([`◈ ${fonts.bold('AFFIRMATION')}`, '', fonts.italic(j.affirmation || 'I am focused and capable.'), '', ui.footer()].join('\n'));
    } catch { return reply([`◈ ${fonts.bold('AFFIRMATION')}`, '', fonts.italic('I am focused and capable.'), '', ui.footer()].join('\n')); }
  },
};
