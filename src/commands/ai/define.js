/** XADON AI define — free dictionaryapi.dev, no key. */
module.exports = {
  name: 'define',
  alias: ['dict', 'meaning', 'dictionary'],
  desc: 'Define an English word',
  usage: '.define <word>',
  async run({ args, reply, ui, prefix }) {
    const { fonts } = ui;
    const word = (args[0] || '').toLowerCase().replace(/[^a-z-]/g, '');
    if (!word) return reply(ui.notice('info', 'Dictionary', `${fonts.mono(`${prefix}define serendipity`)}`));
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      if (!res.ok) throw new Error('not found');
      const json = await res.json();
      const entry = json?.[0];
      const phon = entry?.phonetic || entry?.phonetics?.find((p) => p.text)?.text || '';
      const defs = (entry?.meanings || []).slice(0, 3).map((mm) => `▸ ${fonts.bold(mm.partOfSpeech || 'word')}\n  ${(mm.definitions || []).slice(0, 2).map((d, i) => `${i + 1}. ${d.definition}`).join('\n  ')}`).join('\n');
      await reply(ui.card({ icon: '❖', title: word, subtitle: phon || 'definition', rows: [], body: `${defs || 'No definition found.'}\n\n${ui.footer()}` }));
    } catch { await reply(ui.notice('error', 'Not found', `No definition for ${fonts.mono(word)}.`)); }
  },
};
