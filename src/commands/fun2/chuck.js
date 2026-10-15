// XADON AI · FUN — premium unicode card, no emojis.
module.exports = {
  name: 'chuck',
  alias: ['chuckx'],
  desc: 'Chuck Norris joke',
  category: 'fun2',
  async run({ reply, ui }) {
    const { fonts } = ui;
    try {
      const j = await fetch('https://api.chucknorris.io/jokes/random').then((r) => r.json());
      return reply([`◈ ${fonts.bold('CHUCK NORRIS')}`, '', fonts.italic((j.value || 'Chuck never sleeps.').slice(0, 500)), '', ui.footer()].join('\n'));
    } catch { return reply([`◈ ${fonts.bold('CHUCK NORRIS')}`, '', fonts.italic('Chuck counted to infinity twice.'), '', ui.footer()].join('\n')); }
  },
};
