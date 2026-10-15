// XADON AI · TOOLS — premium unicode card, no emojis.
module.exports = {
  name: 'textinfo',
  alias: ['countx'],
  desc: 'Word and char counter',
  usage: '.textinfo <text>',
  category: 'tools2',
  async run({ text, reply, ui, prefix, m }) {
    const { fonts } = ui;
    const t = text || m.quoted?.body || '';
    if (!t) return reply(ui.notice('info', 'Text info', `${fonts.mono(`${prefix}textinfo hello world`)}`));
    const words = t.trim().split(/\s+/).length;
    return reply(ui.card({ icon: '☰', title: 'Text stats', subtitle: 'counter', rows: [['chars', fonts.bold(String(t.length))], ['words', fonts.bold(String(words))], ['lines', fonts.bold(String(t.split('\n').length))]], body: ui.footer() }));
  },
};
