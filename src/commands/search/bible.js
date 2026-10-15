// XADON AI · SEARCH — premium unicode card, no emojis.
module.exports = {
  name: 'bible',
  alias: ['verse'],
  desc: 'Bible verse lookup',
  usage: '.bible John 3:16',
  category: 'search',
  async run({ text, reply, ui, prefix }) {
    const { fonts } = ui;
    if (!text) return reply(ui.notice('info', 'Bible', `${fonts.mono(`${prefix}bible John 3:16`)}`));
    try {
      const r = await fetch(`https://bolls.life/get-text/KJV/${encodeURIComponent(text)}/`);
      const j = await r.json();
      const v = Array.isArray(j) ? j[0] : j;
      const t = v?.text ? String(v.text).replace(/<[^>]+>/g, '').trim() : '';
      if (!t) throw new Error('empty');
      return reply(ui.card({ icon: '✝', title: text, subtitle: 'kjv', rows: [], body: `${fonts.italic(t.slice(0, 900))}\n\n${ui.footer()}` }));
    } catch { return reply(ui.notice('error', 'Not found', 'Use the form Book Chapter:Verse.')); }
  },
};
