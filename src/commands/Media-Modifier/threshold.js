const sharp = require('sharp');
const { downloadMediaMessage } = require('@musteqeem/baileys');
async function getImage(m) {
  const msg = m?.message?.imageMessage || m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
  if (!msg) return null;
  return downloadMediaMessage({ message: { imageMessage: msg } }, 'buffer', {}, { logger: console });
}
module.exports = {
  name: 'threshold',
  alias: ['bw', 'poster'],
  category: 'Media-Modifier',
  desc: 'Stark black-and-white poster effect',
  usage: '.threshold [1-254] (reply to an image)',
  execute: async (sock, m, { args, reply }) => {
    try {
      const input = await getImage(m);
      if (!input) return reply('🖼️ Reply to an image with .threshold');
      const level = Math.min(254, Math.max(1, Number.parseInt(args[0], 10) || 128));
      const out = await sharp(input).threshold(level, { grayscale: true }).jpeg({ quality: 90 }).toBuffer();
      return sock.sendMessage(m.chat, { image: out, caption: `✨ threshold ${level} complete` }, { quoted: m });
    } catch (e) { console.error('[threshold]', e); return reply(`Image processing failed: ${e.message}`); }
  }
};
