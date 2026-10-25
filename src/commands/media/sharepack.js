// XADON V7 · sharepack - share the royal sticker pack (named sticker-pack relay).
const fx = require('../../lib/premium-fx');
const PALETTE = [{ name: 'Gold', r: 212, g: 175, b: 55 }, { name: 'Crimson', r: 170, g: 20, b: 40 }, { name: 'Ivory', r: 250, g: 245, b: 235 }, { name: 'Onyx', r: 20, g: 20, b: 25 }, { name: 'Emerald', r: 0, g: 150, b: 110 }, { name: 'Sapphire', r: 30, g: 80, b: 200 }];
module.exports = {
  name: 'sharepack', alias: ['royalpack', 'goldpack'], desc: 'Share the royal sticker pack', usage: '.sharepack [pack name]', category: 'media',
  async run({ sock, m, text, reply, ui }) {
    const packName = (text || '').trim().slice(0, 30) || 'XADON Royal Pack';
    try {
      await fx.namedPackRelay(sock, m.chat, { name: packName, publisher: require('../../lib/botstate').botName(), description: packName, colors: PALETTE, quoted: m.raw });
      await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(() => {});
    } catch (e) {
      try {
        const n = await fx.packAsStickers(sock, m.chat, { colors: PALETTE, quoted: m.raw });
        return reply(ui.notice('success', 'Pack sent', packName + ': ' + n + ' stickers delivered.'));
      } catch (e2) { return reply(ui.notice('error', 'Pack failed', String(e2.message || e2).slice(0, 200))); }
    }
  },
};
