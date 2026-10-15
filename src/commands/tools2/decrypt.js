// XADON AI · TOOLS — premium unicode card, no emojis.
module.exports = {
  name: 'decrypt',
  alias: ['decx'],
  desc: 'Caesar cipher decrypt',
  usage: '.decrypt <shift> <text>',
  category: 'tools2',
  async run({ args, reply, ui, prefix }) {
    const { fonts } = ui;
    const s = parseInt(args[0] || '', 10);
    const t = args.slice(1).join(' ');
    if (Number.isNaN(s) || !t) return reply(ui.notice('info', 'Decrypt', `${fonts.mono(`${prefix}decrypt 3 khoor`)}`));
    const out = [...t].map((c) => { const c0 = c.charCodeAt(0); if (c >= 'a' && c <= 'z') return String.fromCharCode(((c0 - 97 - s) % 26 + 26) % 26 + 97); if (c >= 'A' && c <= 'Z') return String.fromCharCode(((c0 - 65 - s) % 26 + 26) % 26 + 65); return c; }).join('');
    return reply(ui.card({ icon: '⚿', title: 'Decrypted', subtitle: `shift ${s}`, rows: [], body: `${fonts.mono(out.slice(0, 1200))}\n\n${ui.footer()}` }));
  },
};
