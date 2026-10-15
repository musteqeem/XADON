/** XADON QR — text to QR image via free qrserver API. */
module.exports = {
  name: 'qr',
  alias: ['qrcode', 'makeqr'],
  desc: 'Turn text into a QR code',
  usage: '.qr <text or link>',
  async run({ sock, m, text, reply, ui, prefix }) {
    const { fonts } = ui;
    const input = text || m.quoted?.body;
    if (!input) return reply(ui.notice('info', 'QR maker', `${fonts.mono(`${prefix}qr https://example.com`)}`));
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(input.slice(0, 800))}`;
    await sock.sendMessage(m.chat, { image: { url }, caption: `◈ ${fonts.bold('QR READY')}\n${fonts.smallCaps('content')} ⟶ ${fonts.italic(input.slice(0, 200))}\n\n${ui.footer()}` }, { quoted: m.raw });
  },
};
