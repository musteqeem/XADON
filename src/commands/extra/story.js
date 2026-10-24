// XADON AI · story (imported format).
module.exports = {
  name: 'story',
  aliases: ['tale', 'microstory'],
  description: 'Random micro story',
  category: 'extra',
  groupOnly: false,
  ownerOnly: false,
  async execute(sock, m, extra) {
    const { reply, ui } = extra;
    const list = ['The last lighthouse keeper found a letter addressed to the sea — and the sea wrote back.', 'She planted stars in her garden; by morning the whole street could read by them.', 'The clockmaker built one clock that ran backwards, just to give yesterday one more chance.', 'A stray dog led the night guard to a lost child, then vanished like it was never there.', 'He kept every ticket stub of his life in a jar; when it broke, the memories stayed.', 'The old radio played one station nobody else could hear: tomorrow.', 'Two strangers shared one umbrella and parted as friends who never met again.', 'The baker wrote wishes into bread; the whole town woke up kinder.'];
    return reply(ui.card({ icon: '\u275D', title: 'Micro story', rows: [], body: list[Math.floor(Math.random() * list.length)] }));
  },
};
