// XADON AI · DOWNLOADER — premium unicode card, no emojis.
module.exports = {
  name: 'ytshort',
  alias: ['shortdl'],
  desc: 'YouTube Shorts helper',
  usage: '.ytshort <link>',
  category: 'downloader',
  async run({ args, reply, ui, prefix }) {
    const { fonts } = ui;
    const url = args[0] || '';
    if (!/youtube\.com\/shorts|youtu\.be/i.test(url)) return reply(ui.notice('info', 'Shorts', `${fonts.mono(`${prefix}ytshort <link>`)}`));
    return reply(ui.card({ icon: '▶', title: 'Short received', subtitle: 'helper', rows: [['link', fonts.mono(url.slice(0, 90))]], body: `${fonts.smallCaps('open the short and use your gallery saver')}\n\n${ui.footer()}` }));
  },
};
