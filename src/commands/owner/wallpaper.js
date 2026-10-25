// XADON V7 · wallpaper — set WhatsApp chat theme + list theme IDs.
const fx = require('../../lib/premium-fx');
module.exports = {
  name: 'wallpaper', alias: ['wallpaperids', 'wplist'], desc: 'Set chat theme wallpaper', usage: '.wallpaper ids | .wallpaper <theme-id>', category: 'owner', owner: true,
  async run({ sock, m, args, reply, ui }) {
    const a = String(args[0] || '').toLowerCase();
    if (!a || a === 'ids' || a === 'list') {
      return reply(ui.card({ icon: '\u2756', title: 'Chat theme IDs', subtitle: `${fx.THEME_IDS.length} themes`, rows: [], body: fx.THEME_IDS.map((t, i) => `${i + 1}. ${t}`).join('\n') + '\n\nTest one: .wallpaper WhatsApp-Green' }));
    }
    try {
      const hit = await fx.chatTheme(sock, m.chat, args[0], { quoted: m.raw });
      return reply(ui.notice('success', 'Theme sent', `Chat theme payload sent: ${hit}`));
    } catch (e) { return reply(ui.notice('error', 'Theme failed', String(e.message || e).slice(0, 200))); }
  },
};
