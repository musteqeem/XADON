const sharp = require('sharp');
const { downloadMediaMessage } = require('@musteqeem/baileys');
async function getImage(m) {
  const msg = m?.message?.imageMessage || m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
  if (!msg) return null;
  return downloadMediaMessage({ message: { imageMessage: msg } }, 'buffer', {}, { logger: console });
}
module.exports = {
  name: 'vignette',
  alias: ['vignettex', 'focus'],
  category: 'Media-Modifier',
  desc: 'Darken photo edges for a pro focus look',
  usage: '.vignette [1-10] (reply to an image)',
  execute: async (sock, m, { args, reply }) => {
    try {
      const input = await getImage(m);
      if (!input) return reply('🖼️ Reply to an image with .vignette [1-10]');
      const level = Math.min(10, Math.max(1, Number.parseFloat(args[0]) || 5));
      const meta = await sharp(input).metadata();
      const w = meta.width || 512;
      const h = meta.height || 512;
      const opacity = (0.35 + level * 0.055).toFixed(2);
      const svg = `<svg width="${w}" height="${h}"><defs><radialGradient id="v" cx="50%" cy="50%" r="72%"><stop offset="55%" stop-color="black" stop-opacity="0"/><stop offset="100%" stop-color="black" stop-opacity="${opacity}"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#v)"/></svg>`;
      const out = await sharp(input)
        .composite([{ input: Buffer.from(svg), blend: 'over' }])
        .jpeg({ quality: 90 })
        .toBuffer();
      return sock.sendMessage(m.chat, { image: out, caption: `✨ vignette x${level} complete` }, { quoted: m });
    } catch (e) { console.error('[vignette]', e); return reply(`Image processing failed: ${e.message}`); }
  }
};
