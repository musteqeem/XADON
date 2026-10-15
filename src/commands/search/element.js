// XADON AI · SEARCH — offline periodic table, no emojis.
const T = { h: ['Hydrogen','1','1.008','Nonmetal'], he: ['Helium','2','4.003','Noble gas'], o: ['Oxygen','8','16.00','Nonmetal'], c: ['Carbon','6','12.01','Nonmetal'], n: ['Nitrogen','7','14.01','Nonmetal'], na: ['Sodium','11','22.99','Metal'], fe: ['Iron','26','55.85','Metal'], au: ['Gold','79','196.97','Metal'], ag: ['Silver','47','107.87','Metal'], cu: ['Copper','29','63.55','Metal'], ca: ['Calcium','20','40.08','Metal'], k: ['Potassium','19','39.10','Metal'], cl: ['Chlorine','17','35.45','Halogen'], si: ['Silicon','14','28.09','Metalloid'] };
module.exports = {
  name: 'element',
  alias: ['atom'],
  desc: 'Periodic table lookup',
  usage: '.element <symbol>',
  category: 'search',
  async run({ args, reply, ui, prefix }) {
    const { fonts } = ui;
    const s = String(args[0] || '').toLowerCase();
    const e = T[s];
    if (!e) return reply(ui.notice('info', 'Elements', `${fonts.mono(`${prefix}element Au`)}${'\n'}${fonts.smallCaps('try h he o c n na fe au ag cu ca k cl si')}`));
    return reply(ui.card({ icon: '⚛', title: e[0], subtitle: `symbol ${s.toUpperCase()}`, rows: [['number', fonts.bold(e[1])], ['mass', fonts.bold(e[2])], ['class', fonts.smallCaps(e[3])]], body: ui.footer() }));
  },
};
