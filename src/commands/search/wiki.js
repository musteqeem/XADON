// XADON AI · SEARCH — premium unicode card, no emojis.
module.exports = {
  name: 'wiki',
  alias: ['wikipedia'],
  desc: 'Wikipedia summary',
  usage: '.wiki <topic>',
  category: 'search',
  async run({ text, reply, ui, prefix }) {
    const { fonts } = ui;
    if (!text) return reply(ui.notice('info', 'Wikipedia', `${fonts.mono(`${prefix}wiki Nikola Tesla`)}`));
    try {
      const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(text)}`);
      const j = await r.json();
      if (!j.extract) throw new Error('empty');
      return reply(ui.card({ icon: '⚬', title: j.title || text, subtitle: 'wikipedia', rows: j.thumbnail ? [] : [], body: `${fonts.italic(j.description || '')}\n\n${j.extract.slice(0, 1200)}${j.content_urls?.desktop?.page ? `\n\n${fonts.mono(j.content_urls.desktop.page)}` : ''}\n\n${ui.footer()}` }));
    } catch { return reply(ui.notice('error', 'No article', 'Nothing found on Wikipedia.')); }
  },
};
