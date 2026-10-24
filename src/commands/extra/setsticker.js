// XADON AI · setsticker — map a sticker to a command. Send that sticker (no prefix) to run it.
// Usage: reply to a sticker with .setsticker ping
function hashOf(quoted) {
  try {
    const st = quoted?.message?.stickerMessage;
    const h = st?.fileSha256 || st?.fileEncSha256;
    if (!h) return null;
    return Buffer.isBuffer(h) ? h.toString('base64') : String(h);
  } catch { return null; }
}
module.exports = {
  name: 'setsticker',
  alias: ['addsticker'],
  desc: 'Map a sticker trigger to a command',
  usage: 'reply to a sticker with .setsticker <command>',
  category: 'extra',
  async run({ m, args, reply, ui, db, loader, prefix }) {
    const cmdName = String(args[0] || '').toLowerCase();
    if (!cmdName) return reply(ui.notice('info', 'Set sticker', `Reply to a sticker with ${prefix}setsticker ping`));
    const cmd = loader.find(cmdName);
    if (!cmd) return reply(ui.notice('error', 'No command', `Command "${cmdName}" not found.`));
    const q = m.quoted;
    if (!q || q.type !== 'stickerMessage') return reply(ui.notice('error', 'Reply to a sticker', `Reply to the sticker you want to map, with ${prefix}setsticker ${cmdName}`));
    let h = hashOf(q);
    if (!h) {
      try {
        const crypto = require('crypto');
        const buf = await q.download();
        h = crypto.createHash('sha256').update(buf).digest('base64');
      } catch {}
    }
    if (!h) return reply(ui.notice('error', 'No hash', 'Could not fingerprint that sticker. Try another one.'));
    const map = db.get('stickerMap', {});
    map[h] = cmd.name;
    db.set('stickerMap', map);
    return reply(ui.notice('success', 'Sticker saved', `That sticker  ⟶  ${prefix}${cmd.name}\nJust send the sticker to run it.`));
  },
};
