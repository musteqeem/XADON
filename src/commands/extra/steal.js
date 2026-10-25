// XADON AI · steal — steal a sticker with your own pack/author names.
const botstate = require('../../lib/botstate');
let sharp, Image;
try { sharp = require('sharp'); Image = require('node-webpmux').Image; } catch {}
async function withExif(webp, pack, author) {
  const json = Buffer.from(JSON.stringify({ 'sticker-pack-id': `xadon-${Date.now()}`, 'sticker-pack-name': pack, 'sticker-pack-publisher': author, emojis: [''] }));
  const head = Buffer.from([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
  const exif = Buffer.concat([head, json]);
  exif.writeUIntLE(json.length, 14, 4);
  const img = new Image();
  await img.load(webp);
  img.exif = exif;
  return img.save(null);
}
module.exports = {
  name: 'steal',
  alias: ['take', 'pack'],
  desc: 'Resticker with custom pack name',
  usage: 'reply to a sticker with .steal pack | author',
  category: 'extra',
  async run({ sock, m, text, reply, ui, fail, config }) {
    const q = m.quoted;
    const src = m.type === 'stickerMessage' ? m : q?.type === 'stickerMessage' ? q : null;
    if (!src) return fail('Reply to a sticker', 'Reply to a sticker with .steal my pack | my name.');
    const [pack, author] = (text || `${botstate.botName()}|${m.pushName}`).split('|').map((s) => s.trim());
    if (!sharp) return fail('No image engine', 'Ask the owner to run: npm install sharp node-webpmux');
    try {
      const input = await src.download();
      const webp = await sharp(input).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 85 }).toBuffer();
      const out = await withExif(webp, pack || botstate.botName(), author || m.pushName).catch(() => webp);
      await sock.sendMessage(m.chat, { sticker: out }, { quoted: m.raw });
    } catch { return fail('Steal failed', 'Could not process that sticker.'); }
  },
};
