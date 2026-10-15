// XADON AI · RICH — copy-button message, no emojis.
module.exports = {
  name: 'copycode',
  alias: ['copyx'],
  desc: 'Copy-button snippet',
  usage: '.copycode <text>',
  category: 'rich',
  async run({ sock, m, text, reply, ui, prefix }) {
    const { fonts } = ui;
    if (!text && !m.quoted?.body) return reply(ui.notice('info', 'Copy code', `${fonts.mono(`${prefix}copycode hello world`)}`));
    const body = (text || m.quoted.body).slice(0, 800);
    return sock.sendButtons(m.chat, { text: `◈ ${fonts.bold('TAP COPY')}\n\n${fonts.mono(body)}\n\n${ui.footer()}`, footer: 'XADON AI', buttons: [{ text: 'Copy text', copy: body }, { text: 'Menu', id: `${prefix}menu` }] }, { quoted: m.raw });
  },
};
