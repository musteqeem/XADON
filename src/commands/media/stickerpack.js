// XADON V7 · stickerpack — hidden pastel sticker pack (hidden sticker-pack engine).
const fx = require('../../lib/premium-fx');
const PALETTE = [{ name: 'Rose', r: 255, g: 183, b: 197 }, { name: 'Mint', r: 183, g: 255, b: 216 }, { name: 'Sky', r: 173, g: 216, b: 250 }, { name: 'Lemon', r: 255, g: 245, b: 180 }, { name: 'Lilac', r: 216, g: 180, b: 250 }, { name: 'Peach', r: 255, g: 218, b: 185 }];
module.exports = {
  name: 'stickerpack', alias: ['stickerpk', 'pastelpack'], desc: 'Hidden pastel sticker pack', usage: '.stickerpack [pack name]', category: 'media',
  async run({ sock, m, args, text, reply, ui }) {
    const packName = (text || '').trim().slice(0, 30) || 'XADON Pastels';
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
