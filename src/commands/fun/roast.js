const LIST = ['You bring everyone joy… when you leave the chat.', 'Your WiFi is faster than your thinking.', 'You are proof that auto-correct still has work to do.', 'If laziness was a sport, you would win gold from your bed.', 'Your phone needs a password because your jokes need protection.'];
module.exports = {
  name: 'roast',
  alias: ['insult', 'burn'],
  desc: 'Light playful roast',
  usage: '.roast @user  |  reply with .roast',
  async run({ sock, m, ui, target }) {
    const { fonts } = ui;
    const jid = target() || m.sender;
    await sock.sendMessage(m.chat, { text: [`◉ ${fonts.bold('XADON ROAST')}`, '', fonts.italic(LIST[Math.floor(Math.random() * LIST.length)]), '', `@${jid.split('@')[0]} ${fonts.smallCaps('no hard feelings')}`, ui.footer()].join('\n'), mentions: [jid] }, { quoted: m.raw });
  },
};
