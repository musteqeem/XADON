module.exports = {
  name: 'quote',
  alias: ['quotes', 'inspire'],
  desc: 'Random inspirational quote',
  async run({ reply, ui }) {
    const { fonts } = ui;
    try {
      const j = await fetch('https://dummyjson.com/quotes/random').then((r) => r.json());
      await reply([`❝ ${fonts.bold('XADON QUOTE')} ❞`, '', fonts.serif(`"${j.quote}"`), '', `— ${fonts.bold(j.author || 'Unknown')}`, '', ui.footer()].join('\n'));
    } catch { await reply(`❝ ${fonts.bold('XADON QUOTE')} ❞\n\n${fonts.serif('"Push yourself, because no one else will do it for you."')}\n\n${ui.footer()}`); }
  },
};
