module.exports = { name: 'report', alias: ['bugreport'], desc: 'Report a bug to owner', usage: '.report <issue>', category: 'general',
  async run({ sock, m, text, reply, ui, config }) {
    if (!text) return reply(ui.notice('info', 'Report', 'Describe the issue: .report play is slow'));
    const owner = (config.ownerNumbers[0] || '') + '@s.whatsapp.net';
    await sock.sendMessage(owner, { text: `_*亗 Bug report*_ \n\nFrom: ${m.pushName} (+${m.number})\nChat: ${m.chat}\n\n${text.slice(0, 1000)}` }).catch(() => {});
    return reply(ui.notice('success', 'Report sent', 'The owner will check it. Thanks.'));
  } };
