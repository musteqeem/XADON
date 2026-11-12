const sharp = require('sharp');
const { downloadMediaMessage } = require('@musteqeem/baileys');
async function getImage(m) {
  const msg = m?.message?.imageMessage || m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
  if (!msg) return null;
  return downloadMediaMessage({ message: { imageMessage: msg } }, 'buffer', {}, { logger: console });
}
module.exports = {
  name: 'mirror',
  alias: ['mirrorx', 'twins'],
  category: 'Media-Modifier',
  desc: 'Side-by-side mirror collage of a photo',
  usage: '.mirror (reply to an image)',
  execute: async (sock, m, { reply }) => {
    try {
      const input = await getImage(m);
      if (!input) return reply('🖼️ Reply to an image with .mirror');
      const meta = await sharp(input).metadata();
      const w = meta.width || 512;
      const flipped = await sharp(input).flop().toBuffer();
      const out = await sharp(input).extend({ right: w, background: { r: 0, g: 0, b: 0, alpha: 1 } }).composite([{ input: flipped, left: w, top: 0 }]).jpeg({ quality: 90 }).toBuffer();
      return sock.sendMessage(m.chat, { image: out, caption: '✨ mirror complete' }, { quoted: m });
    } catch (e) { console.error('[mirror]', e); return reply(`Image processing failed: ${e.message}`); }
  }
};
