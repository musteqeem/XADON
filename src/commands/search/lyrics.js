// XADON AI · SEARCH — premium unicode card, no emojis.
module.exports = {
  name: 'lyrics',
  alias: ['lyricfind'],
  desc: 'Find song lyrics',
  usage: '.lyrics artist | title',
  category: 'search',
  async run({ args, text, reply, ui, prefix }) {
    const { fonts } = ui;
    const [artist, ...rest] = text.split('|').map((s) => s.trim());
    const title = rest.join('|').trim();
    if (!artist || !title) return reply(ui.notice('info', 'Song lyrics', `${fonts.mono(`${prefix}lyrics adele | hello`)}`));
    try {
      const r = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
      const j = await r.json();
      if (!j.lyrics) throw new Error('empty');
      const body = j.lyrics.slice(0, 3500);
      return reply(ui.card({ icon: '♪', title: `${artist} - ${title}`, subtitle: 'lyrics', rows: [['artist', fonts.bold(artist)], ['title', fonts.bold(title)]], body: body + `\n\n${ui.footer()}` }));
    } catch { return reply(ui.notice('error', 'No lyrics', 'Could not find those lyrics. Check spelling.')); }
  },
};
