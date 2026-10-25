// XADON V7 · colorpack — hidden color sticker pack (hidden sticker-pack engine).
const fx = require('../../lib/premium-fx');
const PALETTE = [{ name: 'Neon Pink', r: 255, g: 20, b: 147 }, { name: 'Neon Green', r: 57, g: 255, b: 20 }, { name: 'Neon Blue', r: 20, g: 200, b: 255 }, { name: 'Neon Orange', r: 255, g: 110, b: 0 }, { name: 'Neon Purple', r: 180, g: 60, b: 255 }, { name: 'Neon Yellow', r: 255, g: 240, b: 0 }];
module.exports = {
  name: 'colorpack', alias: ['colors', 'colorpk'], desc: 'Hidden neon color sticker pack', usage: '.colorpack [pack name]', category: 'media',
  async run({ sock, m, args, text, reply, ui }) {
    const packName = (text || '').trim().slice(0, 30) || 'XADON Neons';
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
