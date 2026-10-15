// XADON AI · SEARCH — premium unicode card, no emojis.
module.exports = {
  name: 'quran',
  alias: ['ayah'],
  desc: 'Quran verse lookup',
  usage: '.quran 112:1',
  category: 'search',
  async run({ text, reply, ui, prefix }) {
    const { fonts } = ui;
    const m = String(text || '').match(/(\d{1,3})[:\s](\d{1,3})/);
    if (!m) return reply(ui.notice('info', 'Quran', `${fonts.mono(`${prefix}quran 112:1`)}`));
    try {
      const r = await fetch(`https://api.alquran.cloud/v1/ayah/${m[1]}:${m[2]}/en.asad`);
      const j = await r.json();
      const t = j?.data?.text || '';
      if (!t) throw new Error('empty');
      return reply(ui.card({ icon: '☪', title: `Surah ${m[1]}:${m[2]}`, subtitle: 'english meaning', rows: [], body: `${fonts.italic(t.slice(0, 900))}\n\n${ui.footer()}` }));
    } catch { return reply(ui.notice('error', 'Not found', 'Check the surah:ayah numbers.')); }
  },
};
