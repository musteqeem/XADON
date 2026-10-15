// XADON AI · FUN — premium unicode card, no emojis.
module.exports = {
  name: 'numberfact',
  alias: ['numfact'],
  desc: 'Number trivia fact',
  usage: '.numberfact <n>',
  category: 'fun2',
  async run({ args, reply, ui }) {
    const { fonts } = ui;
    const n = parseInt(args[0] || String(1 + (Date.now() % 99)), 10) || 7;
    try {
      const t = await fetch(`http://numbersapi.com/${n}/trivia`).then((r) => r.text());
      return reply([`◈ ${fonts.bold(`NUMBER ${n}`)}`, '', fonts.italic(t.slice(0, 500)), '', ui.footer()].join('\n'));
    } catch { return reply([`◈ ${fonts.bold(`NUMBER ${n}`)}`, '', fonts.italic(`${n} is a fine number.`), '', ui.footer()].join('\n')); }
  },
};
