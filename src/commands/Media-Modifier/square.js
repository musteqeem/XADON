const sharp = require('sharp');
const { downloadMediaMessage } = require('@musteqeem/baileys');
async function getImage(m) {
  const msg = m?.message?.imageMessage || m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
  if (!msg) return null;
  return downloadMediaMessage({ message: { imageMessage: msg } }, 'buffer', {}, { logger: console });
}
module.exports = {
  name: 'square',
  alias: ['squarecrop', 'crop'],
  category: 'Media-Modifier',
  desc: 'Center-crop a photo into a perfect square',
  usage: '.square (reply to an image)',
  execute: async (sock, m, { reply }) => {
    try {
      const input = await getImage(m);
      if (!input) return reply('🖼️ Reply to an image with .square');
      const meta = await sharp(input).metadata();
      const w = meta.width || 512;
      const h = meta.height || 512;
      const size = Math.min(w, h);
      const out = await sharp(input).extract({ left: Math.floor((w - size) / 2), top: Math.floor((h - size) / 2), width: size, height: size }).jpeg({ quality: 90 }).toBuffer();
      return sock.sendMessage(m.chat, { image: out, caption: '✨ square crop complete' }, { quoted: m });
    } catch (e) { console.error('[square]', e); return reply(`Image processing failed: ${e.message}`); }
  }
};
