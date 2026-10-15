// XADON AI · ANIME — premium unicode card, no emojis.
module.exports = {
  name: 'kissx',
  alias: ['kiss2'],
  desc: 'Kiss a friend',
  usage: '.kissx [@user]',
  category: 'anime',
  async run({ sock, m, reply, ui, target }) {
    const { fonts } = ui;
    const who = target() || null;
    const mention = who ? [who] : [];
    const tag = who ? `@${who.split('@')[0]}` : fonts.smallCaps('for you');
    try {
      let gif = '';
      try {
        const r = await fetch('https://nekos.best/api/v2/kiss');
        const j = await r.json();
        gif = j?.results?.[0]?.url || '';
      } catch {}
      if (!gif) {
        const r2 = await fetch('https://api.waifu.pics/sfw/kiss').catch(() => null);
        const j2 = r2 ? await r2.json().catch(() => ({})) : {};
        gif = j2.url || '';
      }
      if (!gif) throw new Error('empty');
      const cap = [`◈ ${fonts.bold('KISS A FRIEND')}`, '', `${tag}`, '', ui.footer()].join('\n');
      if (/\.gif$/i.test(gif)) await sock.sendMessage(m.chat, { video: { url: gif }, gifPlayback: true, caption: cap, mentions: mention }, { quoted: m.raw });
      else await sock.sendMessage(m.chat, { image: { url: gif }, caption: cap, mentions: mention }, { quoted: m.raw });
    } catch { return reply(ui.notice('error', 'Anime offline', 'Image server is busy. Try again.')); }
  },
};
