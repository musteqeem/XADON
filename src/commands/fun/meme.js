module.exports = {
  name: 'meme',
  alias: ['memes', 'lol'],
  desc: 'Random meme image',
  async run({ sock, m, reply, ui, fail }) {
    const { fonts } = ui;
    try {
      const j = await fetch('https://meme-api.com/gimme').then((r) => r.json());
      if (!j?.url) throw new Error('no meme');
      await sock.sendMessage(m.chat, { image: { url: j.url }, caption: `◉ ${fonts.bold('XADON MEME')}\n${fonts.italic((j.title || '').slice(0, 150))}\n\n${ui.footer()}` }, { quoted: m.raw });
    } catch { return fail('Meme failed', 'The meme service is busy. Try again.'); }
  },
};
