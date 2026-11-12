const sharp = require('sharp');
const { downloadMediaMessage } = require('@musteqeem/baileys');
async function getImage(m) {
  const msg = m?.message?.imageMessage || m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
  if (!msg) return null;
  return downloadMediaMessage({ message: { imageMessage: msg } }, 'buffer', {}, { logger: console });
}
const NAMED = { white: '#ffffff', black: '#000000', red: '#d93025', blue: '#1a73e8', green: '#188038', yellow: '#f9ab00', pink: '#ff4fa3', purple: '#9334e6', orange: '#fa903e', gold: '#d4af37', cyan: '#00bcd4' };
module.exports = {
  name: 'border',
  alias: ['frame', 'frameit'],
  category: 'Media-Modifier',
  desc: 'Add a colored frame around a photo',
  usage: '.border [color] [width] (reply to an image)',
  execute: async (sock, m, { args, reply }) => {
    try {
      const input = await getImage(m);
      if (!input) return reply('🖼️ Reply to an image with .border red 20');
      let color = '#ffffff';
      let width = 18;
      for (const a of args) {
        const t = String(a).toLowerCase().replace(/^#/, '');
        if (/^[0-9a-f]{6}$/.test(t) || /^[0-9a-f]{3}$/.test(t)) color = '#' + t;
        else if (NAMED[t]) color = NAMED[t];
        else if (/^\d+$/.test(t)) width = Math.min(100, Math.max(4, Number.parseInt(t, 10)));
      }
      const out = await sharp(input).extend({ top: width, bottom: width, left: width, right: width, background: color }).jpeg({ quality: 90 }).toBuffer();
      return sock.sendMessage(m.chat, { image: out, caption: `✨ border ${color} x${width}px complete` }, { quoted: m });
    } catch (e) { console.error('[border]', e); return reply(`Image processing failed: ${e.message}`); }
  }
};
