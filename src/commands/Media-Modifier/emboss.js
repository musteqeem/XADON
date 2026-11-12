const sharp = require('sharp');
const { downloadMediaMessage } = require('@musteqeem/baileys');
async function getImage(m) {
  const msg = m?.message?.imageMessage || m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
  if (!msg) return null;
  return downloadMediaMessage({ message: { imageMessage: msg } }, 'buffer', {}, { logger: console });
}
module.exports = {
  name: 'emboss',
  alias: ['embossx', 'carve'],
  category: 'Media-Modifier',
  desc: 'Embossed 3D-carved texture effect',
  usage: '.emboss (reply to an image)',
  execute: async (sock, m, { reply }) => {
    try {
      const input = await getImage(m);
      if (!input) return reply('🖼️ Reply to an image with .emboss');
      const out = await sharp(input).convolve({ width: 3, height: 3, kernel: [-2, -1, 0, -1, 1, 1, 0, 1, 2] }).jpeg({ quality: 90 }).toBuffer();
      return sock.sendMessage(m.chat, { image: out, caption: '✨ emboss complete' }, { quoted: m });
    } catch (e) { console.error('[emboss]', e); return reply(`Image processing failed: ${e.message}`); }
  }
};
