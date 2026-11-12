const sharp = require('sharp');
const { downloadMediaMessage } = require('@musteqeem/baileys');
async function getImage(m) {
  const msg = m?.message?.imageMessage || m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
  if (!msg) return null;
  return downloadMediaMessage({ message: { imageMessage: msg } }, 'buffer', {}, { logger: console });
}
module.exports = {
  name: 'circle',
  alias: ['round', 'pfp'],
  category: 'Media-Modifier',
  desc: 'Crop a photo into a perfect circle (profile-pic style)',
  usage: '.circle (reply to an image)',
  execute: async (sock, m, { reply }) => {
    try {
      const input = await getImage(m);
      if (!input) return reply('🖼️ Reply to an image with .circle');
      const meta = await sharp(input).metadata();
      const size = Math.min(meta.width || 512, meta.height || 512);
      const svg = `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`;
      const out = await sharp(input).resize(size, size, { fit: 'cover' }).composite([{ input: Buffer.from(svg), blend: 'dest-in' }]).png().toBuffer();
      return sock.sendMessage(m.chat, { image: out, caption: '✨ circle crop complete' }, { quoted: m });
    } catch (e) { console.error('[circle]', e); return reply(`Image processing failed: ${e.message}`); }
  }
};
