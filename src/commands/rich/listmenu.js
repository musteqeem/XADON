// XADON AI · RICH — list-style directory, no emojis.
module.exports = {
  name: 'listmenu',
  alias: ['listx'],
  desc: 'Section list menu',
  category: 'rich',
  async run({ sock, m, ui, prefix, loader }) {
    const { fonts } = ui;
    const groups = loader.byCategory();
    const names = Object.keys(groups).slice(0, 12);
    const lines = names.map((c) => `▸ ${fonts.bold(c)} ${fonts.smallCaps(`${groups[c].length} cmds`)} ${fonts.mono(`${prefix}${groups[c][0].name}`)}`).join('\n');
    return sock.sendButtons(m.chat, { text: [`◈ ${fonts.bold('COMMAND INDEX')}`, '', lines, '', ui.footer()].join('\n'), footer: 'XADON AI', buttons: [{ text: 'Full menu', id: `${prefix}menu` }, { text: 'Ping', id: `${prefix}ping` }, { text: 'Copy prefix', copy: prefix }] }, { quoted: m.raw });
  },
};
