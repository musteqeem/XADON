// XADON AI · SEARCH — premium unicode card, no emojis.
module.exports = {
  name: 'countryinfo',
  alias: ['country'],
  desc: 'Country facts lookup',
  usage: '.countryinfo <name>',
  category: 'search',
  async run({ text, reply, ui, prefix }) {
    const { fonts } = ui;
    if (!text) return reply(ui.notice('info', 'Country info', `${fonts.mono(`${prefix}countryinfo Nigeria`)}`));
    try {
      const r = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(text)}?fields=name,capital,population,region,currencies,languages,flags`);
      const j = await r.json();
      const c = j?.[0];
      if (!c) throw new Error('nf');
      return reply(ui.card({ icon: '◎', title: c.name?.common || text, subtitle: (c.region || ''), rows: [['capital', fonts.bold((c.capital || ['N/A'])[0])], ['population', fonts.bold(Number(c.population || 0).toLocaleString())], ['currency', fonts.mono(Object.keys(c.currencies || {}).join(', ') || 'N/A')], ['language', fonts.smallCaps(Object.values(c.languages || {}).join(', ') || 'N/A')]], body: ui.footer() }));
    } catch { return reply(ui.notice('error', 'Not found', 'No country matched that name.')); }
  },
};
