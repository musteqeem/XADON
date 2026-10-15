// XADON AI · TOOLS — premium unicode card, no emojis.
module.exports = {
  name: 'binary',
  alias: ['bintext'],
  desc: 'Text to binary',
  usage: '.binary <text>',
  category: 'tools2',
  async run({ text, reply, ui, prefix }) {
    const { fonts } = ui;
    if (!text) return reply(ui.notice('info', 'Binary', `${fonts.mono(`${prefix}binary hi`)}`));
    const out = [...text].map((c) => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ').slice(0, 1500);
    return reply(ui.card({ icon: '01', title: 'Binary', subtitle: 'encoder', rows: [], body: `${fonts.mono(out)}\n\n${ui.footer()}` }));
  },
};
