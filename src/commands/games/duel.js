// XADON AI · GAMES — premium unicode card, no emojis.
module.exports = {
  name: 'duel',
  alias: ['duelx'],
  desc: 'Duel a friend',
  usage: '.duel @user',
  group: true,
  category: 'games',
  async run({ sock, m, reply, ui, target }) {
    const { fonts } = ui;
    const jid = target();
    if (!jid) return reply(ui.notice('info', 'Duel', 'Mention or reply to an opponent.'));
    const win = (Date.now() + jid.length) % 2 === 0;
    const winner = win ? m.sender : jid;
    return sock.sendMessage(m.chat, { text: [`⚔ ${fonts.bold('DUEL RESULT')}`, '', `@${m.sender.split('@')[0]}  vs  @${jid.split('@')[0]}`, '', `${fonts.bold('Winner:')} @${winner.split('@')[0]}`, '', ui.footer()].join('\n'), mentions: [m.sender, jid] }, { quoted: m.raw });
  },
};
