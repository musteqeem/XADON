// XADON AI · GROUP — premium unicode card, no emojis.
module.exports = {
  name: 'listonline',
  alias: ['onlinex'],
  desc: 'Show presence hint',
  group: true, category: 'group2',
  async run({ sock, m, reply, ui, group }) {
    const { fonts } = ui;
    const n = group?.participants?.length || 0;
    return reply(ui.card({ icon: '\u25C9', title: 'Group presence', subtitle: 'members', rows: [['members', fonts.bold(String(n))]], body: `${fonts.smallCaps('tip: use .tagall for an activity ping')}\n\n${ui.footer()}` }));
  },
};
