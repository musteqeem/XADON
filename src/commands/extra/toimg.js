// XADON AI · toimg — sticker to photo.
let sharp;
try { sharp = require('sharp'); } catch {}
module.exports = {
  name: 'toimg',
  alias: ['stickertoimg', 'topng'],
  desc: 'Convert sticker to image',
  usage: 'reply to a sticker with .toimg',
  category: 'extra',
  async run({ sock, m, reply, ui, fail }) {
    const q = m.quoted;
    const src = m.type === 'stickerMessage' ? m : q?.type === 'stickerMessage' ? q : null;
    if (!src) return fail('Reply to a sticker', 'Reply to a sticker with .toimg.');
    if (!sharp) return fail('No image engine', 'Ask the owner to run: npm install sharp');
    try {
      const buf = await src.download();
      const png = await sharp(buf).png().toBuffer();
      await sock.sendMessage(m.chat, { image: png, caption: ui.footer() }, { quoted: m.raw });
    } catch { return reply(ui.notice('error', 'Convert failed', 'Could not convert that sticker.')); }
  },
};
