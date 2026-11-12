const sharp = require('sharp');
const { downloadMediaMessage } = require('@musteqeem/baileys');
async function getImage(m) {
  const msg = m?.message?.imageMessage || m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
  if (!msg) return null;
  return downloadMediaMessage({ message: { imageMessage: msg } }, 'buffer', {}, { logger: console });
}
module.exports = {
  name: 'resize',
  alias: ['shrink', 'imgsize'],
  category: 'Media-Modifier',
  desc: 'Resize a photo by width, keeps aspect ratio',
  usage: '.resize <width 64-2048> (reply to an image)',
  execute: async (sock, m, { args, reply }) => {
    try {
      const input = await getImage(m);
      if (!input) return reply('🖼️ Reply to an image with .resize 512');
      const width = Math.min(2048, Math.max(64, Number.parseInt(args[0], 10) || 512));
      const out = await sharp(input)
        .resize({ width, fit: 'inside', withoutEnlargement: false, kernel: 'lanczos3' })
        .jpeg({ quality: 90 })
        .toBuffer();
      const meta = await sharp(out).metadata();
      return sock.sendMessage(m.chat, { image: out, caption: `✨ resized to ${meta.width}x${meta.height}` }, { quoted: m });
    } catch (e) { console.error('[resize]', e); return reply(`Image processing failed: ${e.message}`); }
  }
};
