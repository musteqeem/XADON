// XADON AI · SEARCH — premium unicode card, no emojis.
module.exports = {
  name: 'movie',
  alias: ['tvshow'],
  desc: 'Search films and shows',
  usage: '.movie <title>',
  category: 'search',
  async run({ text, reply, ui, prefix }) {
    const { fonts } = ui;
    if (!text) return reply(ui.notice('info', 'Movie search', `${fonts.mono(`${prefix}movie inception`)}`));
    try {
      const r = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(text)}`);
      const j = await r.json();
      const s = j?.[0]?.show;
      if (!s) throw new Error('empty');
      const clean = String(s.summary || 'No summary.').replace(/<[^>]+>/g, '').slice(0, 900);
      return reply(ui.card({ icon: '◉', title: s.name || text, subtitle: 'tvmaze', rows: [['rating', fonts.bold(String(s.rating?.average || 'N/A'))], ['status', fonts.smallCaps(s.status || 'unknown')], ['genres', fonts.smallCaps((s.genres || []).join(', ') || 'general')]], body: `${clean}\n\n${ui.footer()}` }));
    } catch { return reply(ui.notice('error', 'Not found', 'No show matched that title.')); }
  },
};
