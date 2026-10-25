// XADON V7 · bigpack - 12-color mega sticker pack (named sticker-pack relay).
const fx = require('../../lib/premium-fx');
const PALETTE = [{ name: 'Red', r: 220, g: 0, b: 0 }, { name: 'Orange', r: 255, g: 120, b: 0 }, { name: 'Yellow', r: 255, g: 210, b: 0 }, { name: 'Green', r: 0, g: 180, b: 70 }, { name: 'Teal', r: 0, g: 180, b: 170 }, { name: 'Blue', r: 0, g: 110, b: 220 }, { name: 'Indigo', r: 60, g: 60, b: 200 }, { name: 'Purple', r: 150, g: 50, b: 200 }, { name: 'Pink', r: 255, g: 120, b: 180 }, { name: 'Brown', r: 140, g: 90, b: 50 }, { name: 'Grey', r: 130, g: 130, b: 130 }, { name: 'Black', r: 10, g: 10, b: 10 }];
module.exports = {
  name: 'bigpack', alias: ['megapack', 'rainbowpack'], desc: '12-color mega sticker pack', usage: '.bigpack [pack name]', category: 'media',
  async run({ sock, m, text, reply, ui }) {
    const packName = (text || '').trim().slice(0, 30) || 'XADON Mega Pack';
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
