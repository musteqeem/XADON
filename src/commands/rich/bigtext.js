// XADON AI · RICH — styled unicode banner, no emojis.
module.exports = {
  name: 'bigtext',
  alias: ['bannerx'],
  desc: 'Banner text card',
  usage: '.bigtext <words>',
  category: 'rich',
  async run({ text, reply, ui, prefix }) {
    const { fonts } = ui;
    if (!text) return reply(ui.notice('info', 'Banner', `${fonts.mono(`${prefix}bigtext hello`)}`));
    const top = fonts.spaced(text.slice(0, 24).toUpperCase());
    return reply([`◈ ${fonts.bold(top)}`, ui.DOTS, fonts.italic(text.slice(0, 200)), '', ui.footer()].join('\n'));
  },
};
