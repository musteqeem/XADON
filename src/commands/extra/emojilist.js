// XADON AI · emojilist — show all emoji triggers.
module.exports = {
  name: 'emojilist',
  alias: ['emojis', 'listemoji'],
  desc: 'List emoji triggers',
  usage: '.emojilist',
  category: 'extra',
  async run({ reply, ui, db, prefix }) {
    const map = db.get('emojiMap', {});
    const keys = Object.keys(map);
    if (!keys.length) return reply(ui.notice('info', 'No emoji triggers', `Add one with ${prefix}setemoji ping \u{1F60E}`));
    const rows = keys.slice(0, 30).map((e) => [e, `${prefix}${map[e]}`]);
    return reply(ui.card({ icon: '\u263A', title: 'Emoji triggers', subtitle: `${keys.length} active`, rows }));
  },
};
