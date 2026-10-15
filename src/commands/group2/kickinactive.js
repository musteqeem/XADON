// XADON AI · GROUP — premium unicode card, no emojis.
module.exports = {
  name: 'kickinactive',
  alias: ['inactivex'],
  desc: 'Preview inactive sweep',
  group: true, admin: true, category: 'group2',
  async run({ reply, ui, sock, m }) {
    const { fonts } = ui;
    const meta = await sock.groupMetadata(m.chat).catch(() => null);
    const n = meta?.participants?.length || 0;
    return reply(ui.card({ icon: '\u2717', title: 'Inactive sweep', subtitle: 'safe preview', rows: [['members', fonts.bold(String(n))]], body: `${fonts.smallCaps('auto-kick needs 30-day logs. Reply-kick one by one with .kick for now.')}\n\n${ui.footer()}` }));
  },
};
