// XADON AI · FUN — premium unicode card, no emojis.
module.exports = {
  name: 'catfact',
  alias: ['catfactx'],
  desc: 'Random cat fact',
  category: 'fun2',
  async run({ reply, ui }) {
    const { fonts } = ui;
    try {
      const j = await fetch('https://catfact.ninja/fact').then((r) => r.json());
      return reply([`◈ ${fonts.bold('CAT FACT')}`, '', fonts.italic(j.fact || 'Cats sleep 70 percent of their lives.'), '', ui.footer()].join('\n'));
    } catch { return reply([`◈ ${fonts.bold('CAT FACT')}`, '', fonts.italic('Cats sleep 70 percent of their lives.'), '', ui.footer()].join('\n')); }
  },
};
