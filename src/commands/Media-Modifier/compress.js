const sharp = require('sharp');
const { downloadMediaMessage } = require('@musteqeem/baileys');
async function getImage(m) {
  const msg = m?.message?.imageMessage || m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
  if (!msg) return null;
  return downloadMediaMessage({ message: { imageMessage: msg } }, 'buffer', {}, { logger: console });
}
function kb(b) { return (b.length / 1024).toFixed(1) + 'KB'; }
module.exports = {
  name: 'compress',
  alias: ['smallimg', 'reduce'],
  category: 'Media-Modifier',
  desc: 'Compress a photo to a smaller file size',
  usage: '.compress [quality 10-90] (reply to an image)',
  execute: async (sock, m, { args, reply }) => {
    try {
      const input = await getImage(m);
      if (!input) return reply('🖼️ Reply to an image with .compress [quality]');
      const q = Math.min(90, Math.max(10, Number.parseInt(args[0], 10) || 60));
      const out = await sharp(input)
        .jpeg({ quality: q, mozjpeg: true })
        .toBuffer();
      return sock.sendMessage(m.chat, { image: out, caption: `✨ compressed ${kb(input)} → ${kb(out)} (q${q})` }, { quoted: m });
    } catch (e) { console.error('[compress]', e); return reply(`Image processing failed: ${e.message}`); }
  }
};
