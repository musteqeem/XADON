// XADON AI · OWNER — premium unicode card, no emojis.
module.exports = {
  name: 'ownerstats',
  alias: [],
  desc: 'Bot usage counters',
  owner: true, category: 'owner2',
  async run({ reply, ui, stats, loader }) {
    const { fonts } = ui;
    return reply(ui.card({ icon: '\u25A3', title: 'Bot stats', subtitle: 'counters', rows: [['messages', fonts.bold(String(stats.messages))], ['commands', fonts.bold(String(stats.commands))], ['files', fonts.bold(String(loader.commands.size))]], body: ui.footer() }));
  },
};
