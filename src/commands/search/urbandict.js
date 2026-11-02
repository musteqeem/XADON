/** XADON V9 · urbandict — street definitions for any slang/word (no key). */
module.exports = {
  name: 'urbandict',
  alias: ['urban', 'slang', 'streetdef'],
  desc: 'Urban Dictionary meaning of a word',
  usage: '.urbandict <word>',
  category: 'search',
  async run({ m, text, reply, ui, prefix }) {
    const q = (text || m.quoted?.body || '').trim();
    if (!q) return reply(ui.notice('info', 'Urban dict', `Usage: ${prefix}urbandict cruise`));
    try {
      const res = await fetch(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(q.slice(0, 60))}`);
      const json = await res.json();
      const top = (json.list || [])[0];
      if (!top) return reply(ui.notice('warn', 'No definition', `Urban Dictionary has nothing for "${q.slice(0, 60)}".`));
      const clean = (s = '') => s.replace(/[\[\]]/g, '').slice(0, 600);
      return reply(ui.card({
        icon: '◈', title: top.word || q, subtitle: `👍 ${top.thumbs_up || 0} · 👎 ${top.thumbs_down || 0}`,
        rows: [], body: `${clean(top.definition)}\n\n— e.g. ${clean(top.example)}`,
      }));
    } catch {
      return reply(ui.notice('error', 'Lookup failed', 'Urban Dictionary did not respond. Try again.'));
    }
  },
};
