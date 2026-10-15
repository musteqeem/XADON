// XADON AI · TOOLS — premium unicode card, no emojis.
const M = { a: '.-', b: '-...', c: '-.-.', d: '-..', e: '.', f: '..-.', g: '--.', h: '....', i: '..', j: '.---', k: '-.-', l: '.-..', m: '--', n: '-.', o: '---', p: '.--.', q: '--.-', r: '.-.', s: '...', t: '-', u: '..-', v: '...-', w: '.--', x: '-..-', y: '-.--', z: '--..', 0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.', ' ': '/' };
module.exports = {
  name: 'morse',
  alias: ['morsecode'],
  desc: 'Text to morse code',
  usage: '.morse <text>',
  category: 'tools2',
  async run({ text, reply, ui, prefix }) {
    const { fonts } = ui;
    if (!text) return reply(ui.notice('info', 'Morse', `${fonts.mono(`${prefix}morse hello`)}`));
    const out = [...text.toLowerCase()].map((c) => M[c] || '').join(' ').slice(0, 1500);
    return reply(ui.card({ icon: '⋯', title: 'Morse code', subtitle: 'encoder', rows: [], body: `${fonts.mono(out)}\n\n${ui.footer()}` }));
  },
};
