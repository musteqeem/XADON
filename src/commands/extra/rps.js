// XADON AI · rps (imported format).
module.exports = {
  name: 'rps',
  aliases: ['rpsgame', 'rockpaper'],
  description: 'Rock paper scissors vs the bot',
  category: 'extra',
  groupOnly: false,
  ownerOnly: false,
  async execute(sock, m, extra) {
    const { args, reply, ui } = extra;
    const pick = String(args[0] || '').toLowerCase();
    const norm = { rock: 'rock', r: 'rock', paper: 'paper', p: 'paper', scissors: 'scissors', s: 'scissors', scissor: 'scissors' }[pick];
    if (!norm) return reply(ui.notice('info', 'Rock paper scissors', 'Usage: .rps rock | paper | scissors'));
    const bot = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)];
    const win = norm === bot ? 'draw' : (norm === 'rock' && bot === 'scissors') || (norm === 'paper' && bot === 'rock') || (norm === 'scissors' && bot === 'paper') ? 'you win' : 'bot wins';
    return reply(ui.card({ icon: '\u25C9', title: 'Rock paper scissors', subtitle: win, rows: [['you', norm], ['bot', bot]] }));
  },
};
