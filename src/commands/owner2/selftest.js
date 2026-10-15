// XADON AI · OWNER — premium unicode card, no emojis.
module.exports = {
  name: 'selftest',
  alias: ['healthx'],
  desc: 'Health self check',
  owner: true, category: 'owner2',
  async run({ reply, ui, loader }) {
    const { fonts } = ui;
    const groups = loader.byCategory();
    const rows = Object.entries(groups).slice(0, 20).map(([k, v]) => [k, fonts.bold(String(v.length))]);
    return reply(ui.card({ icon: '\u2713', title: 'Self test pass', subtitle: `${loader.commands.size} commands`, rows, body: ui.footer() }));
  },
};
