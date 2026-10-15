// XADON AI · TOOLS — premium unicode card, no emojis.
module.exports = {
  name: 'colorinfo',
  alias: ['colorx'],
  desc: 'Hex color inspector',
  usage: '.colorinfo <hex>',
  category: 'tools2',
  async run({ args, reply, ui, prefix }) {
    const { fonts } = ui;
    const h = String(args[0] || '').replace('#', '');
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return reply(ui.notice('info', 'Color', `${fonts.mono(`${prefix}colorinfo ff5733`)}`));
    const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    return reply(ui.card({ icon: '■', title: `#${h.toUpperCase()}`, subtitle: 'color', rows: [['rgb', fonts.mono(`${r}, ${g}, ${b}`)], ['hsl-hint', fonts.mono(`${Math.round(((r + g + b) / 3) / 2.55)}% light`)]], body: ui.footer() }));
  },
};
