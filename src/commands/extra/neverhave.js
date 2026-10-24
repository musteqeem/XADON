// XADON AI · neverhave (imported format).
module.exports = {
  name: 'neverhave',
  aliases: ['nhie', 'neverever'],
  description: 'Never-have-I-ever prompt',
  category: 'extra',
  groupOnly: false,
  ownerOnly: false,
  async execute(sock, m, extra) {
    const { reply, ui } = extra;
    const list = ['Never have I ever travelled alone', 'Never have I ever cooked at midnight', 'Never have I ever forgotten a birthday', 'Never have I ever sung in the shower loudly', 'Never have I ever stayed up all night gaming', 'Never have I ever talked to a stranger first', 'Never have I ever lost my phone in my own house', 'Never have I ever finished a whole series in one day'];
    const q = list[Math.floor(Math.random() * list.length)];
    return reply(ui.card({ icon: '\u275D', title: 'Never have I ever', subtitle: 'reply: have or never', rows: [], body: q }));
  },
};
