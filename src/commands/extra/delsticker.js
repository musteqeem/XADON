// XADON AI · delsticker — remove a sticker trigger (reply to the sticker).
function hashOf(quoted) {
  try {
    const st = quoted?.message?.stickerMessage;
    const h = st?.fileSha256 || st?.fileEncSha256;
    if (!h) return null;
    return Buffer.isBuffer(h) ? h.toString('base64') : String(h);
  } catch { return null; }
}
module.exports = {
  name: 'delsticker',
  alias: ['rmsticker'],
  desc: 'Remove a sticker trigger',
  usage: 'reply to a sticker with .delsticker  |  .delsticker all',
  category: 'extra',
  async run({ m, args, reply, ui, db }) {
    if (/^all$/i.test(args[0] || '')) { db.set('stickerMap', {}); return reply(ui.notice('success', 'Cleared', 'All sticker triggers removed.')); }
    const q = m.quoted;
    if (!q || q.type !== 'stickerMessage') return reply(ui.notice('info', 'Del sticker', 'Reply to the mapped sticker with .delsticker, or use .delsticker all.'));
    const h = hashOf(q);
    const map = db.get('stickerMap', {});
    const keys = h && map[h] ? [h] : Object.keys(map).filter((k) => k !== '__any__').slice(0, 1);
    if (h && map[h]) { delete map[h]; db.set('stickerMap', map); return reply(ui.notice('success', 'Removed', `Sticker trigger for .${map[h] || 'command'} deleted.`)); }
    return reply(ui.notice('error', 'Not found', 'That sticker has no trigger.'));
  },
};
