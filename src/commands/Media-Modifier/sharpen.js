const sharp = require('sharp');
const { downloadMediaMessage } = require('@musteqeem/baileys');
async function getImage(m) {
  const msg = m?.message?.imageMessage || m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
  if (!msg) return null;
  return downloadMediaMessage({ message: { imageMessage: msg } }, 'buffer', {}, { logger: console });
}
module.exports = {
  name: 'sharpen',
  alias: ['hd', 'sharp'],
  category: 'Media-Modifier',
  desc: 'Sharpen image details (level 1-10)',
  usage: '.sharpen [1-10] (reply to an image)',
  execute: async (sock, m, { args, reply }) => {
    try {
      const input = await getImage(m);
      if (!input) return reply('🖼️ Reply to an image with .sharpen [1-10]');
      const level = Math.min(10, Math.max(1, Number.parseFloat(args[0]) || 4));
      const out = await sharp(input)
        .sharpen({ sigma: 0.6 + level * 0.25, m1: 0.5 + level * 0.12, m2: 0.2 + level * 0.05 })
        .jpeg({ quality: 90 })
        .toBuffer();
      return sock.sendMessage(m.chat, { image: out, caption: `✨ sharpen x${level} complete` }, { quoted: m });
    } catch (e) { console.error('[sharpen]', e); return reply(`Image processing failed: ${e.message}`); }
  }
};
