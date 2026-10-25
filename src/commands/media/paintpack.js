// XADON V7 · paintpack — hidden fire sticker pack (hidden sticker-pack engine).
const fx = require('../../lib/premium-fx');
const PALETTE = [{ name: 'Ember', r: 255, g: 60, b: 0 }, { name: 'Flame', r: 255, g: 140, b: 0 }, { name: 'Blaze', r: 255, g: 200, b: 40 }, { name: 'Ash', r: 80, g: 60, b: 60 }, { name: 'Smoke', r: 140, g: 140, b: 150 }, { name: 'Inferno', r: 180, g: 0, b: 0 }];
module.exports = {
  name: 'paintpack', alias: ['firepack', 'emberpack'], desc: 'Hidden fire sticker pack', usage: '.paintpack [pack name]', category: 'media',
  async run({ sock, m, args, text, reply, ui }) {
    const packName = (text || '').trim().slice(0, 30) || 'XADON Fire';
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
