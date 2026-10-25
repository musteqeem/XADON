// XADON V7 · packdrop - drop a black/white sticker pack (named sticker-pack relay).
const fx = require('../../lib/premium-fx');
const PALETTE = [{ name: 'Black', r: 10, g: 10, b: 10 }, { name: 'Grey', r: 130, g: 130, b: 130 }, { name: 'White', r: 250, g: 250, b: 250 }];
module.exports = {
  name: 'packdrop', alias: ['droppack', 'monopack'], desc: 'Drop a black/white sticker pack', usage: '.packdrop [pack name]', category: 'media',
  async run({ sock, m, text, reply, ui }) {
    const packName = (text || '').trim().slice(0, 30) || 'XADON Mono Pack';
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
