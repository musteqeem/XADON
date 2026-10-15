// XADON AI · MEDIA — premium unicode card, no emojis.
module.exports = {
  name: 'brat',
  alias: ['bratx'],
  desc: 'Brat text sticker',
  usage: '.brat <text>',
  category: 'media',
  async run({ text, reply, ui, prefix, sock, m }) {
    const { fonts } = ui;
    if (!text) return reply(ui.notice('info', 'Brat', `${fonts.mono(`${prefix}brat hello`)}`));
    try {
      const url = `https://brat.caliphdev.com/api/brat?text=${encodeURIComponent(text.slice(0, 60))}`;
      await sock.sendMessage(m.chat, { sticker: { url } }, { quoted: m.raw });
    } catch { return reply(ui.notice('error', 'Brat failed', 'Try shorter text.')); }
  },
};
