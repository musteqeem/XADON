// XADON AI · FUN — premium unicode card, no emojis.
module.exports = {
  name: 'kanye',
  alias: ['kanyex'],
  desc: 'Random Kanye quote',
  category: 'fun2',
  async run({ reply, ui }) {
    const { fonts } = ui;
    try {
      const j = await fetch('https://api.kanye.rest/').then((r) => r.json());
      return reply([`◈ ${fonts.bold('KANYE SAYS')}`, '', fonts.italic((j.quote || 'Keep creating.').slice(0, 400)), '', ui.footer()].join('\n'));
    } catch { return reply([`◈ ${fonts.bold('KANYE SAYS')}`, '', fonts.italic('Keep creating.'), '', ui.footer()].join('\n')); }
  },
};
