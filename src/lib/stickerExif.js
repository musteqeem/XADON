/** XADON AI · sticker exif — pack/author branding for stickers (node-webpmux, no sharp needed). */
const { Image } = require('node-webpmux');

async function withExif(webp, pack, author) {
  const json = Buffer.from(JSON.stringify({
    'sticker-pack-id': `xadon-${Date.now()}`,
    'sticker-pack-name': String(pack || 'XADON AI'),
    'sticker-pack-publisher': String(author || 'XADON AI'),
    emojis: [''],
  }));
  const head = Buffer.from([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
  const exif = Buffer.concat([head, json]);
  exif.writeUIntLE(json.length, 14, 4);
  const img = new Image();
  await img.load(webp);
  img.exif = exif;
  return img.save(null);
}

module.exports = { withExif };
