// XADON AI · editbot — edit the bot's own message.
module.exports = {
  name: 'editbot',
  alias: ['editmsg', 'ebot'],
  desc: "Edit the bot's last message",
  usage: 'reply to bot message with .editbot <new text>',
  category: 'extra',
  async run({ sock, m, text, reply, ui, fail }) {
    if (!m.quoted) return fail('Reply to bot message', 'Reply to a bot message with .editbot <new text>.');
    if (!text) return fail('New text?', 'Usage: .editbot corrected message here');
    try {
      await sock.sendMessage(m.chat, { text: text.slice(0, 2000), edit: m.quoted.raw?.key || { remoteJid: m.chat, id: m.quoted.id, fromMe: true } });
    } catch { return reply(ui.notice('error', 'Edit failed', 'WhatsApp only allows editing recent bot messages.')); }
  },
};
