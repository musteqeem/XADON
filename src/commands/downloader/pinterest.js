// XADON AI · DOWNLOADER — premium unicode card, no emojis.
module.exports = {
  name: 'pinterest',
  alias: ['pinimg'],
  desc: 'Pinterest image (lorem)',
  usage: '.pinterest <word>',
  category: 'downloader',
  async run({ text, reply, ui, prefix, sock, m }) {
    const { fonts } = ui;
    const q = (text || 'aesthetic').slice(0, 40);
    try {
      const url = `https://picsum.photos/seed/${encodeURIComponent(q)}/800/1000`;
      await sock.sendMessage(m.chat, { image: { url }, caption: ui.card({ icon: '◈', title: q, subtitle: 'pinterest style', rows: [], body: ui.footer() }) }, { quoted: m.raw });
    } catch { return reply(ui.notice('error', 'Image failed', 'Try again in a moment.')); }
  },
};
