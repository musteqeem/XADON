// XADON AI · acronym (imported format).
module.exports = {
  name: 'acronym',
  aliases: ['acronymize', 'abbr'],
  description: 'Phrase to acronym',
  category: 'extra',
  groupOnly: false,
  ownerOnly: false,
  async execute(sock, m, extra) {
    const { args, reply, ui } = extra;
    const t = args.join(' ').trim();
    if (!t) return reply(ui.notice('info', 'Acronym', 'Usage: .acronym National Aeronautics and Space'));
    const skip = new Set(['and', 'of', 'the', 'a', 'an', 'to', 'in', 'for']);
    const out = t.split(/\s+/).filter((x) => x && !skip.has(x.toLowerCase())).map((x) => x[0].toUpperCase()).join('');
    if (!out) return reply(ui.notice('error', 'Too short', 'Give real words.'));
    return reply(ui.card({ icon: '\u25A3', title: 'Acronym', rows: [['result', out]], body: t.slice(0, 200) }));
  },
};
