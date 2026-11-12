const sharp = require('sharp');
const { downloadMediaMessage } = require('@musteqeem/baileys');
async function getImage(m) {
  const msg = m?.message?.imageMessage || m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
  if (!msg) return null;
  return downloadMediaMessage({ message: { imageMessage: msg } }, 'buffer', {}, { logger: console });
}
module.exports = {
  name: 'vivid',
  alias: ['saturate', 'colorpop'],
  category: 'Media-Modifier',
  desc: 'Boost or mute colors (0 gray - 2 super vivid)',
  usage: '.vivid [0-2] (reply to an image)',
  execute: async (sock, m, { args, reply }) => {
    try {
      const input = await getImage(m);
      if (!input) return reply('🖼️ Reply to an image with .vivid 1.5');
      const s = Math.min(2, Math.max(0, Number.parseFloat(args[0]) || 1.5));
      const out = await sharp(input)
        .modulate({ saturation: s })
        .jpeg({ quality: 90 })
        .toBuffer();
      return sock.sendMessage(m.chat, { image: out, caption: `✨ vivid x${s} complete` }, { quoted: m });
    } catch (e) { console.error('[vivid]', e); return reply(`Image processing failed: ${e.message}`); }
  }
};
