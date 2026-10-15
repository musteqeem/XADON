// XADON AI · TOOLS — premium unicode card, no emojis.
module.exports = {
  name: 'currency',
  alias: ['fxrate'],
  desc: 'Currency converter',
  usage: '.currency 100 USD NGN',
  category: 'tools2',
  async run({ args, reply, ui, prefix }) {
    const { fonts } = ui;
    const [amt, from, to] = [args[0], (args[1] || '').toUpperCase(), (args[2] || '').toUpperCase()];
    if (!parseFloat(amt) || !from || !to) return reply(ui.notice('info', 'Currency', `${fonts.mono(`${prefix}currency 100 USD NGN`)}`));
    try {
      const r = await fetch(`https://open.er-api.com/v6/latest/${from}`);
      const j = await r.json();
      const rate = j?.rates?.[to];
      if (!rate) throw new Error('nf');
      const out = (parseFloat(amt) * rate).toLocaleString();
      return reply(ui.card({ icon: '¤', title: `${amt} ${from} = ${out} ${to}`, subtitle: 'live rate', rows: [['rate', fonts.bold(`1 ${from} = ${rate} ${to}`)]], body: ui.footer() }));
    } catch { return reply(ui.notice('error', 'FX offline', 'Check the currency codes.')); }
  },
};
