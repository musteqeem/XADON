// XADON AI · TOOLS — premium unicode card, no emojis.
module.exports = {
  name: 'calendar',
  alias: ['calx'],
  desc: 'Month calendar card',
  usage: '.calendar [month] [year]',
  category: 'tools2',
  async run({ args, reply, ui }) {
    const { fonts } = ui;
    const now = new Date();
    const mo = Math.min(12, Math.max(1, parseInt(args[0] || String(now.getMonth() + 1), 10) || now.getMonth() + 1)) - 1;
    const yr = parseInt(args[1] || String(now.getFullYear()), 10) || now.getFullYear();
    const first = new Date(yr, mo, 1).getDay();
    const days = new Date(yr, mo + 1, 0).getDate();
    const cells = [...Array(first).fill('  '), ...Array.from({ length: days }, (_, i) => String(i + 1).padStart(2, ' '))];
    const rows = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7).join(' '));
    return reply(ui.card({ icon: '▤', title: `${yr}-${String(mo + 1).padStart(2, '0')}`, subtitle: 'calendar', rows: [], body: `${fonts.mono('Su Mo Tu We Th Fr Sa')}\n${fonts.mono(rows.join('\n'))}\n\n${ui.footer()}` }));
  },
};
