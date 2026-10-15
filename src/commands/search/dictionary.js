// XADON AI · SEARCH — premium unicode card, no emojis.
module.exports = {
  name: 'dictionary',
  alias: ['define2', 'dictfind'],
  desc: 'English word meaning',
  usage: '.dictionary <word>',
  category: 'search',
  async run({ args, reply, ui, prefix }) {
    const { fonts } = ui;
    const word = (args[0] || '').toLowerCase();
    if (!word) return reply(ui.notice('info', 'Dictionary', `${fonts.mono(`${prefix}dictionary serendipity`)}`));
    try {
      const r = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      const j = await r.json();
      const e = Array.isArray(j) ? j[0] : null;
      if (!e) throw new Error('empty');
      const means = (e.meanings || []).slice(0, 3).map((mm) => `▸ ${fonts.bold(mm.partOfSpeech || 'word')}: ${fonts.italic(((mm.definitions || [])[0] || {}).definition || '').slice(0, 220)}`).join('\n');
      return reply(ui.card({ icon: '⚉', title: word, subtitle: (e.phonetic || 'english'), rows: [['word', fonts.bold(word)]], body: means + `\n\n${ui.footer()}` }));
    } catch { return reply(ui.notice('error', 'Not found', 'No definition for that word.')); }
  },
};
