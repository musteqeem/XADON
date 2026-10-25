// XADON V7 · colorstix — sticker-by-sticker color drop (max compatibility) (hidden sticker-pack engine).
const fx = require('../../lib/premium-fx');
const PALETTE = [{ name: 'Deep', r: 0, g: 40, b: 120 }, { name: 'Wave', r: 0, g: 130, b: 200 }, { name: 'Foam', r: 200, g: 240, b: 255 }, { name: 'Teal', r: 0, g: 180, b: 170 }, { name: 'Abyss', r: 0, g: 10, b: 60 }, { name: 'Coral', r: 255, g: 120, b: 110 }];
module.exports = {
  name: 'colorstix', alias: ['colorstickers', 'oceanpack'], desc: 'Ocean stickers, sent one by one', usage: '.colorstix [pack name]', category: 'media',
  async run({ sock, m, args, text, reply, ui }) {
    const packName = (text || '').trim().slice(0, 30) || 'XADON Ocean';
    try {
      const n = await fx.hiddenPack(sock, m.chat, { name: packName, colors: PALETTE, quoted: m.raw });
      await sock.sendMessage(m.chat, { react: { text: '\u2705', key: m.key } }).catch(() => {});
      return reply(ui.notice('success', 'Pack sent', `${packName}: ${n} hidden stickers delivered.`));
    } catch (e) {
      // fallback: stickers one by one (works everywhere)
      try {
        const n = await fx.packAsStickers(sock, m.chat, { colors: PALETTE, quoted: m.raw });
        return reply(ui.notice('success', 'Pack sent', `${packName}: ${n} stickers delivered.`));
      } catch (e2) { return reply(ui.notice('error', 'Pack failed', String(e2.message || e2).slice(0, 200))); }
    }
  },
};
