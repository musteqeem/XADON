// XADON AI · scramble — word scramble race (first correct answer wins, via quiz listener).
const { startQuiz } = require('../../message-handler');
const WORDS = ['whatsapp', 'premium', 'banana', 'rocket', 'laptop', 'guitar', 'planet', 'doctor', 'bridge', 'forest', 'camera', 'garden', 'puzzle', 'tiger', 'ocean', 'candle'];
const mix = (s) => { const a = [...s]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.join(''); };
module.exports = {
  name: 'scramble',
  alias: ['wordscramble', 'unscramble'],
  desc: 'Scrambled-word race',
  usage: '.scramble',
  group: true, category: 'extra',
  async run({ sock, m, reply, ui }) {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    let mixed = mix(word);
    if (mixed === word) mixed = mix(word);
    const q = startQuiz(m.chat, `${ui.fonts.bold('UNSCRAMBLE')}  ${ui.fonts.mono(mixed)}\n${ui.fonts.smallCaps('first correct answer wins — 5 minutes')}`, word);
    await sock.sendMessage(m.chat, { text: q + `\n\n${ui.footer()}` }, { quoted: m.raw });
  },
};
