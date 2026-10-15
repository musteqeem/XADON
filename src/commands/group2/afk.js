// XADON AI · GROUP — premium unicode card, no emojis.
module.exports = {
  name: 'afk',
  alias: ['afkx'],
  desc: 'Set AFK status',
  usage: '.afk <reason>',
  category: 'group2',
  async run({ m, text, reply, ui, db }) {
    const { fonts } = ui;
    db.set(`afk:${m.sender}`, { at: Date.now(), reason: text.slice(0, 120) || 'Away' });
    return reply(ui.card({ icon: '\u25D4', title: 'AFK on', subtitle: m.pushName, rows: [['reason', fonts.italic(text.slice(0, 120) || 'Away')]], body: ui.footer() }));
  },
};
