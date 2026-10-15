// XADON AI · FUN — premium unicode card, no emojis.
module.exports = {
  name: 'bored',
  alias: ['boredx'],
  desc: 'Anti-boredom idea',
  category: 'fun2',
  async run({ reply, ui }) {
    const { fonts } = ui;
    try {
      const j = await fetch('https://www.boredapi.com/api/activity').then((r) => r.json());
      return reply(ui.card({ icon: '\u25CB', title: 'Try this', subtitle: (j.type || 'fun'), rows: [], body: `${fonts.italic(j.activity || 'Learn a new shortcut.')}\n\n${ui.footer()}` }));
    } catch { return reply(ui.notice('info', 'Idea', 'Teach someone one thing you know.')); }
  },
};
