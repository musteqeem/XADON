// XADON AI · delemoji — remove an emoji trigger.
module.exports = {
  name: 'delemoji',
  alias: ['delemojis', 'rmemoji'],
  desc: 'Remove an emoji trigger',
  usage: '.delemoji <emoji> | .delemoji all',
  category: 'extra',
  async run({ args, reply, ui, db }) {
    const map = db.get('emojiMap', {});
    const t = args.join(' ').trim();
    if (!t) return reply(ui.notice('info', 'Del emoji', 'Usage: .delemoji \u{1F60E}  or  .delemoji all'));
    if (/^all$/i.test(t)) { db.set('emojiMap', {}); return reply(ui.notice('success', 'Cleared', 'All emoji triggers removed.')); }
    if (!map[t]) return reply(ui.notice('error', 'Not found', 'That emoji has no trigger.'));
    delete map[t];
    db.set('emojiMap', map);
    return reply(ui.notice('success', 'Removed', `${t} trigger deleted.`));
  },
};
