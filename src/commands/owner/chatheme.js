// XADON V7 · chatheme — animated wallpaper payload test.
module.exports = {
  name: 'chatheme', alias: ['animatedbg', 'wallpaperx'], desc: 'Animated wallpaper payload', usage: '.chatheme <wallpaper-id>', category: 'owner', owner: true,
  async run({ sock, m, args, reply, ui }) {
    const id = args[0];
    if (!id) return reply(ui.notice('info', 'Animated wallpaper', 'Usage: .chatheme <real WhatsApp animated wallpaper ID>'));
    try {
      await sock.sendMessage(m.chat, { chatTheme: { animatedWallpaper: { id, dimLevel: 0.25 } } }, { quoted: m.raw });
      return reply(ui.notice('success', 'Payload sent', `Animated wallpaper payload sent for ID: ${id}`));
    } catch (e) { return reply(ui.notice('error', 'Theme failed', String(e.message || e).slice(0, 200))); }
  },
};
