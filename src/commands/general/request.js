module.exports = { name: 'request', alias: ['feature'], desc: 'Request a feature', usage: '.request <idea>', category: 'general',
  async run({ sock, m, text, reply, ui, config }) {
    if (!text) return reply(ui.notice('info', 'Request', 'Share your idea: .request add football scores'));
    const owner = (config.ownerNumbers[0] || '') + '@s.whatsapp.net';
    await sock.sendMessage(owner, { text: `_*亗 Feature request*_ \n\nFrom: ${m.pushName} (+${m.number})\n\n${text.slice(0, 1000)}` }).catch(() => {});
    return reply(ui.notice('success', 'Request sent', 'Noted for XADON V4.'));
  } };
