const sharp = require('sharp');
const { downloadMediaMessage } = require('@musteqeem/baileys');
async function getImage(m) {
  const msg = m?.message?.imageMessage || m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
  if (!msg) return null;
  return downloadMediaMessage({ message: { imageMessage: msg } }, 'buffer', {}, { logger: console });
}
module.exports = {
  name: 'rotate',
  alias: ['spin', 'turn'],
  category: 'Media-Modifier',
  desc: 'Rotate a photo by any angle',
  usage: '.rotate <degrees> (reply to an image)',
  execute: async (sock, m, { args, reply }) => {
    try {
      const input = await getImage(m);
      if (!input) return reply('🖼️ Reply to an image with .rotate 90');
      const angle = Math.min(360, Math.max(-360, Number.parseFloat(args[0]) || 90));
      const out = await sharp(input).rotate(angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).jpeg({ quality: 90 }).toBuffer();
      return sock.sendMessage(m.chat, { image: out, caption: `✨ rotated ${angle}° complete` }, { quoted: m });
    } catch (e) { console.error('[rotate]', e); return reply(`Image processing failed: ${e.message}`); }
  }
};
