// XADON AI · GAMES — premium unicode card, no emojis.
module.exports = {
  name: 'trivia',
  alias: ['triviax'],
  desc: 'Random trivia question',
  category: 'games',
  async run({ reply, ui }) {
    const { fonts } = ui;
    try {
      const r = await fetch('https://opentdb.com/api.php?amount=1&type=multiple');
      const j = await r.json();
      const q = j?.results?.[0];
      if (!q) throw new Error('e');
      const clean = (s) => s.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&');
      return reply(ui.card({ icon: '?', title: 'Trivia', subtitle: clean(q.category || 'general'), rows: [], body: `${fonts.bold(clean(q.question))}\n\n${fonts.italic('Answer: ' + clean(q.correct_answer))}\n\n${ui.footer()}` }));
    } catch { return reply(ui.notice('error', 'Trivia offline', 'Try again in a moment.')); }
  },
};
