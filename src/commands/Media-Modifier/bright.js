const sharp = require('sharp');
const { downloadMediaMessage } = require('@musteqeem/baileys');
async function getImage(m) {
  const msg = m?.message?.imageMessage || m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
  if (!msg) return null;
  return downloadMediaMessage({ message: { imageMessage: msg } }, 'buffer', {}, { logger: console });
}
module.exports = {
  name: 'bright',
  alias: ['brightness', 'lighten'],
  category: 'Media-Modifier',
  desc: 'Adjust photo brightness (0.3 dark - 2.0 bright)',
  usage: '.bright [0.3-2] (reply to an image)',
  execute: async (sock, m, { args, reply }) => {
    try {
      const input = await getImage(m);
      if (!input) return reply('🖼️ Reply to an image with .bright 1.4');
      const factor = Math.min(2, Math.max(0.3, Number.parseFloat(args[0]) || 1.3));
      const out = await sharp(input)
        .modulate({ brightness: factor })
        .jpeg({ quality: 90 })
        .toBuffer();
      return sock.sendMessage(m.chat, { image: out, caption: `✨ brightness x${factor} complete` }, { quoted: m });
    } catch (e) { console.error('[bright]', e); return reply(`Image processing failed: ${e.message}`); }
  }
};
