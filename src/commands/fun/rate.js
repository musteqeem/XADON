module.exports = {
  name: 'rate',
  alias: ['rank', 'judge'],
  desc: 'Rate anything 0-100',
  usage: '.rate <thing>  |  reply with .rate',
  async run({ m, text, reply, ui }) {
    const { fonts } = ui;
    const thing = text || m.quoted?.body || 'you';
    let h = 0; for (const c of thing) h = (h * 31 + c.charCodeAt(0)) % 101;
    await reply([`◈ ${fonts.bold('XADON RATE')}`, '', `${fonts.italic(thing.slice(0, 120))}`, '', `${ui.bar(h)}`, '', ui.footer()].join('\n'));
  },
};
