// XADON AI · GROUP — premium unicode card, no emojis.
module.exports = {
  name: 'rules',
  alias: ['grouprules'],
  desc: 'Set or show group rules',
  usage: '.rules <text>',
  group: true, category: 'group2',
  async run({ m, text, reply, ui, db, isAdmin }) {
    const { fonts } = ui;
    const k = `rules:${m.chat}`;
    if (text && isAdmin) { db.set(k, text.slice(0, 800)); return reply(ui.notice('success', 'Rules saved', 'Members can read them with .rules.')); }
    const r = db.get(k, '');
    if (!r) return reply(ui.notice('info', 'No rules', 'Admins can set rules with .rules <text>.'));
    return reply(ui.card({ icon: '\u2630', title: 'Group rules', subtitle: 'be kind', rows: [], body: `${r}\n\n${ui.footer()}` }));
  },
};
