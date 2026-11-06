/** XADON V9 · barcode — real Code128 barcode image for any text. */
module.exports = {
  name: 'barcode',
  alias: ['makebarcode', 'codebar'],
  desc: 'Turn text into a barcode',
  usage: '.barcode <text>',
  category: 'xadon9',
  async run({ sock, m, text, reply, ui, prefix }) {
    const input = (text || m.quoted?.body || '').trim();
    if (!input) return reply(ui.notice('info', 'Barcode', `Usage: ${prefix}barcode 0123456789`));
    const url = `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(input.slice(0, 100))}&code=Code128&translate-eb=hide&dpi=150`;
    try {
      await sock.sendMessage(m.chat, { image: { url }, caption: `◈ 𝗕𝗔𝗥𝗖𝗢𝗗𝗘 ⟶ ${input.slice(0, 100)}\n\n${ui.footer()}` }, { quoted: m.raw });
    } catch {
      return reply(ui.notice('error', 'Barcode failed', 'The barcode service did not respond. Try again.'));
    }
  },
};
