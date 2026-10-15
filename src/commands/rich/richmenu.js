// XADON AI · RICH — nativeFlow rich message v2 showcase, no emojis.
module.exports = {
  name: 'richmenu',
  alias: ['richx'],
  desc: 'Rich buttons demo',
  category: 'rich',
  async run({ sock, m, ui, prefix }) {
    const { fonts } = ui;
    const text = [`◈ ${fonts.bold('XADON RICH MENU')}`, `${fonts.smallCaps('copy · open · run')}`, '', `${fonts.smallCaps('tap a button below')}`, '', ui.footer()].join('\n');
    return sock.sendButtons(m.chat, { text, footer: 'XADON AI · premium', buttons: [{ text: 'Ping', id: `${prefix}ping` }, { text: 'Menu', id: `${prefix}menu` }, { text: 'Copy prefix', copy: prefix }, { text: 'GitHub', url: 'https://github.com/musteqeem/baileys' }] }, { quoted: m.raw });
  },
};
