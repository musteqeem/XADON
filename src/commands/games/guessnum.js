// XADON AI · GAMES — premium unicode card, no emojis.
module.exports = {
  name: 'guessnum',
  alias: ['guessx'],
  desc: 'Guess the number (1-10)',
  usage: '.guessnum <1-10>',
  category: 'games',
  async run({ args, reply, ui, prefix }) {
    const { fonts } = ui;
    const pick = (Date.now() % 10) + 1;
    const g = parseInt(args[0] || '', 10);
    if (!g) return reply(ui.notice('info', 'Guess 1-10', `${fonts.mono(`${prefix}guessnum 7`)}`));
    const win = g === pick;
    return reply(ui.card({ icon: '#', title: win ? 'Correct' : 'Wrong', subtitle: 'number game', rows: [['you', fonts.bold(String(g))], ['machine', fonts.bold(String(pick))]], body: ui.footer() }));
  },
};
