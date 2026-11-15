const sharp = require('sharp');
const { downloadMediaMessage } = require('@musteqeem/baileys');
async function getImage(m) {
  const msg = m?.message?.imageMessage || m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
  if (!msg) return null;
  return downloadMediaMessage({ message: { imageMessage: msg } }, 'buffer', {}, { logger: console });
}
const NAMED = { red: '#d93025', blue: '#1a73e8', green: '#188038', yellow: '#f9ab00', pink: '#ff4fa3', purple: '#9334e6', orange: '#fa903e', gold: '#d4af37', cyan: '#00bcd4', teal: '#009688' };
module.exports = {
  name: 'tint',
  alias: ['tintx', 'colorize'],
  category: 'Media-Modifier',
  desc: 'Tint a photo any color (hex or name)',
  usage: '.tint ff4fa3 (reply to an image)',
  execute: async (sock, m, { args, reply }) => {
    try {
      const input = await getImage(m);
      if (!input) return reply('🖼️ Reply to an image with .tint ff4fa3');
      const raw = String(args[0] || 'pink').toLowerCase().replace(/^#/, '');
      const hex = NAMED[raw] || (/^[0-9a-f]{6}$/.test(raw) || /^[0-9a-f]{3}$/.test(raw) ? '#' + raw : null);
      if (!hex) return reply('🎨 Give a color: .tint ff4fa3 or .tint blue');
      const out = await sharp(input).tint(hex).jpeg({ quality: 90 }).toBuffer();
      return sock.sendMessage(m.chat, { image: out, caption: `✨ tint ${hex} complete` }, { quoted: m });
    } catch (e) { console.error('[tint]', e); return reply(`Image processing failed: ${e.message}`); }
  }
};
