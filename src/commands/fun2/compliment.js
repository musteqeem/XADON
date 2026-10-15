// XADON AI · FUN — premium unicode card, no emojis.
const F = ['Your code reviews make juniors feel senior.', 'You debug like the logs confess to you.', 'Your calm in chaos is a superpower.', 'You ship clean work under pressure.'];
module.exports = {
  name: 'compliment',
  alias: ['compx'],
  desc: 'Send a compliment',
  usage: '.compliment [@user]',
  category: 'fun2',
  async run({ sock, m, ui, target }) {
    const { fonts } = ui;
    const who = target();
    const line = F[Date.now() % F.length];
    const txt = [`◈ ${fonts.bold('COMPLIMENT')}`, '', fonts.italic(line), '', ui.footer()].join('\n');
    if (who) return sock.sendMessage(m.chat, { text: txt.replace(ui.footer(), `@${who.split('@')[0]}\n\n${ui.footer()}`), mentions: [who] }, { quoted: m.raw });
    return sock.sendMessage(m.chat, { text: txt }, { quoted: m.raw });
  },
};
