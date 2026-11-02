// XADON · stickerinfo — inspect any sticker (pack, size, animated?).
module.exports = {
  name: 'stickerinfo',
  alias: ['stickerabout', 'stinfo', 'stickerdetails'],
  desc: 'Show metadata of a quoted sticker',
  usage: 'reply to a sticker with .stickerinfo',
  category: 'tools',
  async run({ m, reply, ui }) {
    const src = m.type === 'stickerMessage' ? m : m.quoted?.type === 'stickerMessage' ? m.quoted : null;
    if (!src) return reply(ui.notice('info', 'Sticker info', 'Reply to a sticker with .stickerinfo.'));
    const sm = src.message?.stickerMessage || {};
    const kb = sm.fileLength ? `${(Number(sm.fileLength) / 1024).toFixed(1)} KB` : 'unknown';
    const rows = [
      ['size', kb],
      ['dimensions', sm.width && sm.height ? `${sm.width}×${sm.height}` : 'unknown'],
      ['animated', sm.isAnimated ? 'yes' : 'no'],
      ['avatar', sm.isAvatar ? 'yes' : 'no'],
      ['mimetype', sm.mimetype || 'image/webp'],
    ];
    if (sm.fileSha256) {
      const h = Buffer.isBuffer(sm.fileSha256) ? sm.fileSha256.toString('base64') : String(sm.fileSha256);
      rows.push(['sha256', h.slice(0, 24) + '…']);
    }
    return reply(ui.card({ icon: '◈', title: 'Sticker info', rows, body: 'Tip: .toimg converts it to a photo, .steal re-packs it.' }));
  },
};
