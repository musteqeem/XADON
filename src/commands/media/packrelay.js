// XADON V7 · packrelay - relay a named sticker pack (named sticker-pack relay).
const fx = require('../../lib/premium-fx');
const PALETTE = [{ name: 'Ember', r: 255, g: 60, b: 0 }, { name: 'Flame', r: 255, g: 140, b: 0 }, { name: 'Blaze', r: 255, g: 200, b: 40 }, { name: 'Smoke', r: 140, g: 140, b: 150 }, { name: 'Inferno', r: 180, g: 0, b: 0 }, { name: 'Char', r: 40, g: 20, b: 20 }];
module.exports = {
  name: 'packrelay', alias: ['relaypack', 'packdrop2'], desc: 'Relay a named sticker pack', usage: '.packrelay [pack name]', category: 'media',
  async run({ sock, m, text, reply, ui }) {
    const packName = (text || '').trim().slice(0, 30) || 'XADON Fire Pack';
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
