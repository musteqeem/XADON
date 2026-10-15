// XADON AI · DOWNLOADER — premium unicode card, no emojis.
module.exports = {
  name: 'apkdl',
  alias: ['apkfind'],
  desc: 'APK search helper',
  usage: '.apkdl <app name>',
  category: 'downloader',
  async run({ text, reply, ui, prefix }) {
    const { fonts } = ui;
    if (!text) return reply(ui.notice('info', 'APK finder', `${fonts.mono(`${prefix}apkdl whatsapp`)}`));
    return reply(ui.card({ icon: '▣', title: text.slice(0, 60), subtitle: 'apk search', rows: [['safe source', fonts.mono(`https://apkpure.com/search?q=${encodeURIComponent(text)}`)]], body: `${fonts.smallCaps('download only from trusted stores')}\n\n${ui.footer()}` }));
  },
};
