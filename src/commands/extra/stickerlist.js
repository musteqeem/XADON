// XADON AI · stickerlist — show sticker triggers.
module.exports = {
  name: 'stickerlist',
  alias: ['stickers', 'liststicker'],
  desc: 'List sticker triggers',
  usage: '.stickerlist',
  category: 'extra',
  async run({ reply, ui, db }) {
    const map = db.get('stickerMap', {});
    const keys = Object.keys(map).filter((k) => k !== '__any__');
    if (!keys.length) return reply(ui.notice('info', 'No sticker triggers', 'Reply to a sticker with .setsticker ping to add one.'));
    const rows = keys.slice(0, 30).map((k, i) => [`sticker ${i + 1}`, `.${map[k]}  (${k.slice(0, 10)}…)`]);
    return reply(ui.card({ icon: '\u25A3', title: 'Sticker triggers', subtitle: `${keys.length} active`, rows }));
  },
};
