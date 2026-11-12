const sharp = require('sharp');
const { downloadMediaMessage } = require('@musteqeem/baileys');
async function getImage(m) {
  const msg = m?.message?.imageMessage || m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
  if (!msg) return null;
  return downloadMediaMessage({ message: { imageMessage: msg } }, 'buffer', {}, { logger: console });
}
module.exports = {
  name: 'edges',
  alias: ['sketch', 'linedraw'],
  category: 'Media-Modifier',
  desc: 'Pencil-sketch edge-detection effect',
  usage: '.edges (reply to an image)',
  execute: async (sock, m, { reply }) => {
    try {
      const input = await getImage(m);
      if (!input) return reply('🖼️ Reply to an image with .edges');
      const out = await sharp(input).grayscale().convolve({ width: 3, height: 3, kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1] }).negate().jpeg({ quality: 90 }).toBuffer();
      return sock.sendMessage(m.chat, { image: out, caption: '✨ sketch complete' }, { quoted: m });
    } catch (e) { console.error('[edges]', e); return reply(`Image processing failed: ${e.message}`); }
  }
};
