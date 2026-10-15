// XADON AI · MEDIA — premium unicode card, no emojis.
module.exports = {
  name: 'memegen',
  alias: ['memex'],
  desc: 'Meme text generator',
  usage: '.memegen top | bottom',
  category: 'media',
  async run({ text, reply, ui, prefix, sock, m }) {
    const { fonts } = ui;
    const [top, bottom] = text.split('|').map((s) => (s || '').trim().replace(/\s+/g, '_').slice(0, 40));
    if (!top) return reply(ui.notice('info', 'Meme maker', `${fonts.mono(`${prefix}memegen when code works | party time`)}`));
    try {
      const url = `https://api.memegen.link/images/doge/${encodeURIComponent(top || '_')}/${encodeURIComponent(bottom || '_')}.png`;
      await sock.sendMessage(m.chat, { image: { url }, caption: ui.footer() }, { quoted: m.raw });
    } catch { return reply(ui.notice('error', 'Meme failed', 'Try simpler text.')); }
  },
};
