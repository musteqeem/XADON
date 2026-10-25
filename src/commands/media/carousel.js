// XADON V7 · carousel — swipeable album cards — swipeable image carousel (albumpic engine).
const fx = require('../../lib/premium-fx');
module.exports = {
  name: 'carousel', alias: ['albumswipe', 'swipecards'], desc: 'Swipeable image carousel cards', usage: '.carousel 5 [caption]', category: 'media',
  async run({ sock, m, args, text, reply, ui, prefix }) {
    try {
      const n = Math.max(2, Math.min(10, parseInt(args[0], 10) || 5));
      const items = [];
      for (let i = 0; i < n; i++) items.push({ url: 'https://picsum.photos/600/400?random=' + (Date.now() % 100000 + i * 7), title: 'Image ' + (i + 1), body: (text.replace(/^\d+\s*/, '') || 'XADON gallery').slice(0, 120), footer: require('../../lib/botstate').botName(), buttons: [{ text: 'Menu', id: prefix + 'menu' }, { text: 'Ping', id: prefix + 'ping' }] });
      await fx.carousel(sock, m.chat, items, { title: '*IMAGE CAROUSEL*\nSwipe to browse', footer: require('../../lib/botstate').botName(), quoted: m.raw });
      await sock.sendMessage(m.chat, { react: { text: '\u2705', key: m.key } }).catch(() => {});
    } catch (e) {
      // fallback: plain images (works on every Baileys runtime)
      try {
        for (let i = 0; i < 3; i++) await sock.sendMessage(m.chat, { image: { url: 'https://picsum.photos/600/400?random=' + (Date.now() % 100000 + i) }, caption: 'Card ' + (i + 1) }, { quoted: m.raw });
      } catch { return reply(ui.notice('error', 'Carousel failed', String(e.message || e).slice(0, 200))); }
    }
  },
};
