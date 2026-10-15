// XADON AI · FUN — premium unicode card, no emojis.
module.exports = {
  name: 'dogfact',
  alias: ['dogfactx'],
  desc: 'Random dog fact',
  category: 'fun2',
  async run({ reply, ui }) {
    const { fonts } = ui;
    try {
      const j = await fetch('https://dogapi.dog/api/v2/facts?limit=1').then((r) => r.json());
      const t = j?.data?.[0]?.attributes?.body || 'Dogs can learn over 100 words.';
      return reply([`◈ ${fonts.bold('DOG FACT')}`, '', fonts.italic(t), '', ui.footer()].join('\n'));
    } catch { return reply([`◈ ${fonts.bold('DOG FACT')}`, '', fonts.italic('Dogs can learn over 100 words.'), '', ui.footer()].join('\n')); }
  },
};
