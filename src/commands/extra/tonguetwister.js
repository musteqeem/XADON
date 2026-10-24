// XADON AI · tonguetwister (imported format).
module.exports = {
  name: 'tonguetwister',
  aliases: ['twister', 'tws'],
  description: 'Random tongue twister',
  category: 'extra',
  groupOnly: false,
  ownerOnly: false,
  async execute(sock, m, extra) {
    const { reply, ui } = extra;
    const list = ['She sells seashells by the seashore', 'Red lorry, yellow lorry', 'Peter Piper picked a peck of pickled peppers', 'How much wood would a woodchuck chuck', 'Fuzzy Wuzzy was a bear', 'Six slippery snails slid slowly seaward', 'Betty Botter bought some butter', 'A big black bug bit a big black bear'];
    return reply(ui.card({ icon: '\u275D', title: 'Tongue twister', subtitle: 'say it 3x fast', rows: [], body: list[Math.floor(Math.random() * list.length)] }));
  },
};
