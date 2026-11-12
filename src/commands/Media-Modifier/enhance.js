const sharp = require('sharp');
const { downloadMediaMessage } = require('@musteqeem/baileys');
async function getImage(m) {
  const msg = m?.message?.imageMessage || m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
  if (!msg) return null;
  return downloadMediaMessage({ message: { imageMessage: msg } }, 'buffer', {}, { logger: console });
}
module.exports = {
  name: 'enhance',
  alias: ['autofix', 'hdphoto', 'improve'],
  category: 'Media-Modifier',
  desc: 'Auto-enhance a photo (light, color + sharpness)',
  usage: '.enhance (reply to an image)',
  execute: async (sock, m, { reply }) => {
    try {
      const input = await getImage(m);
      if (!input) return reply('🖼️ Reply to an image with .enhance');
      const out = await sharp(input)
        .normalize()
        .modulate({ brightness: 1.05, saturation: 1.18 })
        .sharpen({ sigma: 1, m1: 0.8, m2: 0.4 })
        .jpeg({ quality: 90 })
        .toBuffer();
      return sock.sendMessage(m.chat, { image: out, caption: '✨ enhance complete' }, { quoted: m });
    } catch (e) { console.error('[enhance]', e); return reply(`Image processing failed: ${e.message}`); }
  }
};
