// XADON AI · DOWNLOADER — premium unicode card, no emojis.
module.exports = {
  name: 'spotify',
  alias: ['spfind'],
  desc: 'Spotify search link',
  usage: '.spotify <song>',
  category: 'downloader',
  async run({ text, reply, ui, prefix }) {
    const { fonts } = ui;
    if (!text) return reply(ui.notice('info', 'Spotify', `${fonts.mono(`${prefix}spotify blinding lights`)}`));
    return reply(ui.card({ icon: '♪', title: text.slice(0, 60), subtitle: 'spotify search', rows: [['open', fonts.mono(`https://open.spotify.com/search/${encodeURIComponent(text)}`)]], body: ui.footer() }));
  },
};
