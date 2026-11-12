// Picked from WHATSAPP INVESTIGATION: albumpic.js — swipeable image carousel (uses premium-fx)
module.exports = {
  name: 'gallery', alias: ['albumpic', 'photostrip'], desc: 'Swipeable image carousel (10 pics)', usage: '.gallery cats | .gallery', category: 'media',
  async run({ sock, m, text, reply, ui }) {
    const fx = require('../../lib/premium-fx');
    const q = (text || 'beautiful landscape').slice(0, 80);
    try {
      const items = Array.from({ length: 5 }, (_, i) => ({ url: `https://picsum.photos/seed/${encodeURIComponent(q)}-${i}/600/400`, title: `${q} ${i + 1}`, body: `Photo ${i + 1} · ${q}` }));
      await fx.carousel(sock, m.chat, items, { title: `Gallery: ${q}`, footer: ui.footer(), quoted: m.raw });
    } catch { return reply(ui.notice('error', 'Gallery failed', 'Image service is busy. Try again.')); }
  },
};
