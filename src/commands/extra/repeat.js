// XADON AI · repeat — bot repeats your text (admins only in groups).
module.exports = {
  name: 'repeat',
  alias: ['sayit', 'echoit'],
  desc: 'Make the bot say something',
  usage: '.repeat <text>',
  category: 'extra',
  async run({ sock, m, text, reply, ui, fail, isAdmin, isOwner }) {
    if (!text) return fail('Say what?', 'Usage: .repeat hello everyone');
    if (m.isGroup && !isAdmin && !isOwner) return fail('Admins only', 'Only admins can use .repeat in groups.');
    await sock.sendMessage(m.chat, { text: text.slice(0, 1000) });
  },
};
