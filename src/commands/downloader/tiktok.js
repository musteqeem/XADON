// XADON AI · DOWNLOADER — premium unicode card, no emojis.
module.exports = {
  name: 'tiktok',
  alias: ['ttdl'],
  desc: 'TikTok video info',
  usage: '.tiktok <link>',
  category: 'downloader',
  async run({ args, reply, ui, prefix, sock, m }) {
    const { fonts } = ui;
    const url = args[0] || '';
    if (!/tiktok\.com/i.test(url)) return reply(ui.notice('info', 'TikTok', `${fonts.mono(`${prefix}tiktok <link>`)}`));
    try {
      const r = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`, { headers: { 'user-agent': 'XADON-AI' } });
      const j = await r.json();
      const d = j?.data;
      if (!d?.play) throw new Error('nf');
      const cap = ui.card({ icon: '▶', title: 'TikTok ready', subtitle: `@${d.author?.nickname || 'tiktok'}`, rows: [['duration', fonts.bold(String(d.duration || 0) + 's')], ['link', fonts.mono('video below')]], body: `${fonts.italic((d.title || '').slice(0, 200))}\n\n${ui.footer()}` });
      await sock.sendMessage(m.chat, { video: { url: d.play }, caption: cap }, { quoted: m.raw });
    } catch { return reply(ui.notice('error', 'Fetch failed', 'That TikTok link could not be resolved.')); }
  },
};
