const LIST = ['Send a voice note singing your favourite song.', 'Text your crush "hey" right now and show proof.', 'Do 20 push-ups and report back.', 'Change your profile photo to a funny face for 1 hour.', 'Speak only in voice notes for the next 10 minutes.', 'Send the last photo in your gallery to this chat.', 'Call a friend and say "XADON AI sent me".', 'Type with your elbows for the next 3 messages.'];
module.exports = {
  name: 'dare',
  alias: ['daregame', 'challenge'],
  desc: 'Dare challenge',
  async run({ reply, ui }) {
    const { fonts } = ui;
    await reply([`◉ ${fonts.bold('DARE')}`, '', fonts.serif(LIST[Math.floor(Math.random() * LIST.length)]), '', ui.footer()].join('\n'));
  },
};
