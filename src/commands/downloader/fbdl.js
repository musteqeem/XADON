// XADON AI · DOWNLOADER — premium unicode card, no emojis.
module.exports = {
  name: 'fbdl',
  alias: ['fbdown'],
  desc: 'Facebook link helper',
  usage: '.fbdl <link>',
  category: 'downloader',
  async run({ args, reply, ui, prefix }) {
    const { fonts } = ui;
    const url = args[0] || '';
    if (!/facebook\.com|fb\.watch/i.test(url)) return reply(ui.notice('info', 'Facebook', `${fonts.mono(`${prefix}fbdl <link>`)}`));
    return reply(ui.card({ icon: '◈', title: 'Facebook link', subtitle: 'save helper', rows: [['link', fonts.mono(url.slice(0, 80))]], body: `${fonts.smallCaps('public videos can be saved from the link above')}\n\n${ui.footer()}` }));
  },
};
