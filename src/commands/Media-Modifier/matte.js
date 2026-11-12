const sharp = require('sharp');
const { downloadMediaMessage } = require('@musteqeem/baileys');
async function getImage(m) {
  const msg = m?.message?.imageMessage || m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
  if (!msg) return null;
  return downloadMediaMessage({ message: { imageMessage: msg } }, 'buffer', {}, { logger: console });
}
module.exports = {
  name: 'matte',
  alias: ['matfilm', 'faded'],
  category: 'Media-Modifier',
  desc: 'Soft faded film / matte look',
  usage: '.matte (reply to an image)',
  execute: async (sock, m, { reply }) => {
    try {
      const input = await getImage(m);
      if (!input) return reply('🖼️ Reply to an image with .matte');
      const out = await sharp(input).linear(0.9, 16).modulate({ saturation: 0.8, brightness: 1.02 }).jpeg({ quality: 90 }).toBuffer();
      return sock.sendMessage(m.chat, { image: out, caption: '✨ matte complete' }, { quoted: m });
    } catch (e) { console.error('[matte]', e); return reply(`Image processing failed: ${e.message}`); }
  }
};
