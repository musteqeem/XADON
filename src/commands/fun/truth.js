const LIST = ['What is your biggest fear?', 'Who was your first crush?', 'What lie have you told that no one found out?', 'What is the most embarrassing song on your playlist?', 'Have you ever cheated in a game? How?', 'What would you do with 1 million dollars in one day?', 'Who in this group makes you laugh the most?', 'What secret are you keeping from your best friend?'];
module.exports = {
  name: 'truth',
  alias: ['truthgame'],
  desc: 'Truth question',
  async run({ reply, ui }) {
    const { fonts } = ui;
    await reply([`◐ ${fonts.bold('TRUTH')}`, '', fonts.serif(LIST[Math.floor(Math.random() * LIST.length)]), '', ui.footer()].join('\n'));
  },
};
