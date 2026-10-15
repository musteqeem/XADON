// XADON AI · DOWNLOADER — premium unicode card, no emojis.
module.exports = {
  name: 'igdl',
  alias: ['igdown'],
  desc: 'Instagram link helper',
  usage: '.igdl <link>',
  category: 'downloader',
  async run({ args, reply, ui, prefix }) {
    const { fonts } = ui;
    const url = args[0] || '';
    if (!/instagram\.com|instagr\.am/i.test(url)) return reply(ui.notice('info', 'Instagram', `${fonts.mono(`${prefix}igdl <link>`)}`));
    return reply(ui.card({ icon: '◈', title: 'Instagram link', subtitle: 'save helper', rows: [['link', fonts.mono(url.slice(0, 80))]], body: `${fonts.smallCaps('open the link, tap share, save the media, then forward it here and use')} ${fonts.mono(`${prefix}sticker`)}${'\n\n'}${ui.footer()}` }));
  },
};
