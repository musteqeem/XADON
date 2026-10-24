// XADON AI · secret — send view-once text (falls back to normal with notice).
module.exports = {
  name: 'secret',
  alias: ['secretmsg', 'onetime'],
  desc: 'Send a view-once message',
  usage: '.secret <text>',
  category: 'extra',
  async run({ sock, m, text, reply, ui, fail }) {
    if (!text) return fail('Which secret?', 'Usage: .secret the code is 1234');
    try {
      await sock.sendMessage(m.chat, { text: text.slice(0, 1000), viewOnce: true }, { quoted: m.raw });
    } catch {
      await sock.sendMessage(m.chat, { text: text.slice(0, 1000) }, { quoted: m.raw });
      return reply(ui.notice('warn', 'Sent normally', 'This build has no view-once text API.'));
    }
  },
};
