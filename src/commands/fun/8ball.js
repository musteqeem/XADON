const ANSWERS = ['Yes, definitely.', 'Without a doubt.', 'Ask again later.', 'Cannot predict now.', 'Do not count on it.', 'Very likely.', 'My reply is no.', 'Signs point to yes.', 'Focus and ask again.', 'Absolutely not.', 'It is certain.', 'Maybe — trust your gut.'];
module.exports = {
  name: '8ball',
  alias: ['eightball', 'askball', 'magic'],
  desc: 'Magic 8-ball answers',
  usage: '.8ball will I win today?',
  async run({ text, reply, ui, prefix, m }) {
    const { fonts } = ui;
    const q = text || m.quoted?.body;
    if (!q) return reply(ui.notice('info', '8-Ball', `${fonts.mono(`${prefix}8ball will I be lucky?`)}`));
    await reply([`◍ ${fonts.bold('MAGIC 8-BALL')}`, `${fonts.smallCaps('question')} ⟶ ${fonts.italic(q.slice(0, 150))}`, '', `▸ ${fonts.serif(ANSWERS[Math.floor(Math.random() * ANSWERS.length)])}`, '', ui.footer()].join('\n'));
  },
};
