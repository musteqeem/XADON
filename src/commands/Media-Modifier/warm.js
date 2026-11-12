const sharp = require('sharp');
const { downloadMediaMessage } = require('@musteqeem/baileys');
async function getImage(m) {
  const msg = m?.message?.imageMessage || m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
  if (!msg) return null;
  return downloadMediaMessage({ message: { imageMessage: msg } }, 'buffer', {}, { logger: console });
}
module.exports = {
  name: 'warm',
  alias: ['temperature', 'cool'],
  category: 'Media-Modifier',
  desc: 'Shift photo temperature: warm sunset or cool icy',
  usage: '.warm [warm|cool] (reply to an image)',
  execute: async (sock, m, { args, reply }) => {
    try {
      const input = await getImage(m);
      if (!input) return reply('🖼️ Reply to an image with .warm or .warm cool');
      const mode = String(args[0] || 'warm').toLowerCase();
      const isCool = ['cool', 'cold', 'icy', 'blue'].includes(mode);
      const matrix = isCool
        ? [[0.9, 0, 0], [0, 1.0, 0], [0, 0, 1.12]]
        : [[1.12, 0, 0], [0, 1.0, 0], [0, 0, 0.9]];
      const out = await sharp(input)
        .recomb(matrix)
        .modulate({ brightness: 1.02, saturation: 1.08 })
        .jpeg({ quality: 90 })
        .toBuffer();
      return sock.sendMessage(m.chat, { image: out, caption: `✨ ${isCool ? 'cool' : 'warm'} tone complete` }, { quoted: m });
    } catch (e) { console.error('[warm]', e); return reply(`Image processing failed: ${e.message}`); }
  }
};
