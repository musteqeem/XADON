// XADON AI · wyr (imported format).
module.exports = {
  name: 'wyr',
  aliases: ['wouldyourather', 'rather'],
  description: 'Would-you-rather question',
  category: 'extra',
  groupOnly: false,
  ownerOnly: false,
  async execute(sock, m, extra) {
    const { reply, ui } = extra;
    const list = ['fly like a bird or swim like a fish', 'always whisper or always shout', 'read minds or see the future', 'be rich or be famous', 'live in space or under the sea', 'never use the internet or never travel again', 'talk to animals or speak every language', 'have more time or more money'];
    const q = list[Math.floor(Math.random() * list.length)];
    return reply(ui.card({ icon: '\u275D', title: 'Would you rather', rows: [], body: q }));
  },
};
