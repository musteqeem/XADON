// XADON AI · SEARCH — premium unicode card, no emojis.
module.exports = {
  name: 'web',
  alias: ['askweb'],
  desc: 'Quick web answer',
  usage: '.web <question>',
  category: 'search',
  async run({ text, reply, ui, prefix }) {
    const { fonts } = ui;
    if (!text) return reply(ui.notice('info', 'Web search', `${fonts.mono(`${prefix}web tallest mountain`)}`));
    try {
      const r = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(text)}&format=json&no_html=1&skip_disambig=1`, { headers: { 'user-agent': 'XADON-AI' } });
      const j = await r.json();
      const ans = (j.AbstractText || j.Answer || '').slice(0, 900);
      if (!ans) throw new Error('empty');
      return reply(ui.card({ icon: '⌕', title: 'Web answer', subtitle: (j.Heading || 'duckduckgo'), rows: [], body: `${ans}\n\n${ui.footer()}` }));
    } catch { return reply(ui.card({ icon: '⌕', title: 'Web answer', subtitle: 'offline hint', rows: [], body: `${fonts.italic('No instant answer. Try a more specific question.')}\n\n${ui.footer()}` })); }
  },
};
