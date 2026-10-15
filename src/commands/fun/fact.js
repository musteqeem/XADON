module.exports = {
  name: 'fact',
  alias: ['facts', 'didyouknow'],
  desc: 'Random fun fact',
  async run({ reply, ui }) {
    const { fonts } = ui;
    try {
      const j = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en').then((r) => r.json());
      await reply([`◈ ${fonts.bold('DID YOU KNOW?')}`, '', fonts.italic(j.text || 'Honey never spoils.'), '', ui.footer()].join('\n'));
    } catch { await reply(`◈ ${fonts.bold('DID YOU KNOW?')}\n\n${fonts.italic('Octopuses have three hearts.')}\n\n${ui.footer()}`); }
  },
};
