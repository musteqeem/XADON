// XADON AI · GAMES — premium unicode card, no emojis.
const W = ['python', 'planet', 'bridge', 'garden', 'rocket', 'castle'];
module.exports = {
  name: 'hangman',
  alias: ['hangx'],
  desc: 'Hangman word teaser',
  category: 'games',
  async run({ reply, ui }) {
    const { fonts } = ui;
    const word = W[Date.now() % W.length];
    const masked = word[0] + ' _'.repeat(word.length - 1);
    return reply(ui.card({ icon: '□', title: 'Hangman', subtitle: `${word.length} letters`, rows: [['word', fonts.bold(masked)]], body: `${fonts.smallCaps('hint')} ⟶ ${fonts.italic('common noun')}\n\n${ui.footer()}` }));
  },
};
