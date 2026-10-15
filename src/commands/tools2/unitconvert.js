// XADON AI · TOOLS — premium unicode card, no emojis.
const U = { km_mi: 0.621371, mi_km: 1.60934, kg_lb: 2.20462, lb_kg: 0.453592, c_f: (c) => c * 9 / 5 + 32, f_c: (f) => (f - 32) * 5 / 9 };
module.exports = {
  name: 'unitconvert',
  alias: ['convert'],
  desc: 'Unit converter',
  usage: '.unitconvert 10 km_mi',
  category: 'tools2',
  async run({ args, reply, ui, prefix }) {
    const { fonts } = ui;
    const v = parseFloat(args[0] || '');
    const k = String(args[1] || '').toLowerCase();
    if (!v || !U[k]) return reply(ui.notice('info', 'Convert', `${fonts.mono(`${prefix}unitconvert 10 km_mi`)}${'\n'}${fonts.smallCaps('km_mi mi_km kg_lb lb_kg c_f f_c')}`));
    const out = typeof U[k] === 'function' ? U[k](v) : v * U[k];
    return reply(ui.card({ icon: '⇄', title: `${v} ${k} = ${Number(out.toFixed(2))}`, subtitle: 'converter', rows: [], body: ui.footer() }));
  },
};
