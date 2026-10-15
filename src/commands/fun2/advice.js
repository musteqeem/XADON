// XADON AI · FUN — premium unicode card, no emojis.
module.exports = {
  name: 'advice',
  alias: ['advicex'],
  desc: 'Random life advice',
  category: 'fun2',
  async run({ reply, ui }) {
    const { fonts } = ui;
    try {
      const j = await fetch('https://api.adviceslip.com/advice').then((r) => r.json());
      const t = j?.slip?.advice || 'Take one small step today.';
      return reply([`◈ ${fonts.bold('ADVICE')}`, '', fonts.italic(t), '', ui.footer()].join('\n'));
    } catch { return reply([`◈ ${fonts.bold('ADVICE')}`, '', fonts.italic('Drink water and rest your eyes.'), '', ui.footer()].join('\n')); }
  },
};
