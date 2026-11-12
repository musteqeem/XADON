const sharp = require('sharp');
const { downloadMediaMessage } = require('@musteqeem/baileys');
async function getImage(m) {
  const msg = m?.message?.imageMessage || m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
  if (!msg) return null;
  return downloadMediaMessage({ message: { imageMessage: msg } }, 'buffer', {}, { logger: console });
}
module.exports = {
  name: 'contrast',
  alias: ['contrastx'],
  category: 'Media-Modifier',
  desc: 'Adjust photo contrast (-50 soft, +100 punchy)',
  usage: '.contrast [-50 to 100] (reply to an image)',
  execute: async (sock, m, { args, reply }) => {
    try {
      const input = await getImage(m);
      if (!input) return reply('🖼️ Reply to an image with .contrast 30');
      const c = Math.min(100, Math.max(-50, Number.parseFloat(args[0]) || 30));
      const factor = 1 + c / 100;
      const offset = -(128 * (factor - 1));
      const out = await sharp(input)
        .linear(factor, offset)
        .jpeg({ quality: 90 })
        .toBuffer();
      return sock.sendMessage(m.chat, { image: out, caption: `✨ contrast ${c > 0 ? '+' : ''}${c} complete` }, { quoted: m });
    } catch (e) { console.error('[contrast]', e); return reply(`Image processing failed: ${e.message}`); }
  }
};
