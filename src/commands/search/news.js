// XADON AI · SEARCH — premium unicode card, no emojis.
module.exports = {
  name: 'news',
  alias: ['headlines'],
  desc: 'Top tech headlines',
  usage: '.news',
  category: 'search',
  async run({ reply, ui }) {
    const { fonts } = ui;
    try {
      const r = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      const ids = (await r.json()).slice(0, 5);
      const items = [];
      for (const id of ids) {
        const s = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then((x) => x.json()).catch(() => null);
        if (s?.title) items.push(`▸ ${fonts.bold(s.title.slice(0, 90))}`);
      }
      if (!items.length) throw new Error('empty');
      return reply(ui.card({ icon: '☑', title: 'Top stories', subtitle: 'hacker news', rows: [], body: items.join('\n') + `\n\n${ui.footer()}` }));
    } catch { return reply(ui.notice('error', 'News offline', 'Headlines are unreachable right now.')); }
  },
};
