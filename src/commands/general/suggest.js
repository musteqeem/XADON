module.exports = { name: 'suggest', alias: ['suggestion', 'feedback'], desc: 'Send feedback', usage: '.suggest <text>', category: 'general',
  async run({ sock, m, text, reply, ui, config }) {
    if (!text) return reply(ui.notice('info', 'Suggest', 'Type feedback: .suggest love the new menu'));
    const owner = (config.ownerNumbers[0] || '') + '@s.whatsapp.net';
    await sock.sendMessage(owner, { text: `_*亗 Feedback*_ \n\nFrom: ${m.pushName} (+${m.number})\n\n${text.slice(0, 1000)}` }).catch(() => {});
    return reply(ui.notice('success', 'Thanks', 'Your feedback was delivered.'));
  } };
