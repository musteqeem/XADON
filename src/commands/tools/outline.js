// XADON V8 · outline — turn pasted text into a structured outline (offline).
module.exports = {
  name: 'outline', alias: ['summarizex', 'tldr'], desc: 'Outline long text', usage: '.outline <text>', category: 'tools',
  async run({ text, m, reply, ui }) {
    const s = (text || m.quoted?.body || '').trim();
    if (s.length < 60) return reply(ui.notice('info', 'Outline', 'Paste at least a few sentences.'));
    const sentences = s.replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+/g) || [s];
    const words = (w) => (w.toLowerCase().match(/[a-z]{4,}/g) || []);
    const freq = {};
    for (const w of words(s)) freq[w] = (freq[w] || 0) + 1;
    const score = (t) => words(t).reduce((a, w) => a + (freq[w] || 0), 0) / Math.max(words(t).length, 1);
    const top = [...sentences].sort((a, b) => score(b) - score(a)).slice(0, 5);
    return reply(ui.card({
      icon: '≡', title: `Outline (${top.length} points)`, subtitle: `${sentences.length} sentences scanned`,
      body: top.map((t, i) => `${i + 1}. ${t.trim().slice(0, 220)}`).join('\n'),
    }));
  },
};
