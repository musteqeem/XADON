const sharp = require('sharp');
const { downloadMediaMessage } = require('@musteqeem/baileys');
async function getImage(m) {
  const msg = m?.message?.imageMessage || m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
  if (!msg) return null;
  return downloadMediaMessage({ message: { imageMessage: msg } }, 'buffer', {}, { logger: console });
}
module.exports = {
  name: 'sepia',
  alias: ['vintage', 'oldphoto'],
  category: 'Media-Modifier',
  desc: 'Classic warm sepia / vintage tone',
  usage: '.sepia (reply to an image)',
  execute: async (sock, m, { reply }) => {
    try {
      const input = await getImage(m);
      if (!input) return reply('🖼️ Reply to an image with .sepia');
      const out = await sharp(input)
        .recomb([
          [0.393, 0.769, 0.189],
          [0.349, 0.686, 0.168],
          [0.272, 0.534, 0.131]
        ])
        .jpeg({ quality: 90 })
        .toBuffer();
      return sock.sendMessage(m.chat, { image: out, caption: '✨ sepia complete' }, { quoted: m });
    } catch (e) { console.error('[sepia]', e); return reply(`Image processing failed: ${e.message}`); }
  }
};
