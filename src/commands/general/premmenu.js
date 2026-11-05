// XADON V11 · PREMIUM — premmenu: the luxury command showcase card.
// Usage: .premmenu
module.exports = {
  name: 'premmenu',
  alias: ['luxmenu', 'vipmenu', 'newcmds'],
  desc: 'Showcase the new V11 premium commands',
  usage: '.premmenu',
  category: 'general',
  async run({ reply, ui, prefix }) {
    const { fonts } = ui;
    return reply(ui.card({
      icon: '◆', title: 'V11 Premium Drop', subtitle: '20 new weapons',
      rows: [
        ['auto-translate', `${prefix}autotranslate on es`],
        ['rogue-admin wall', `${prefix}shield on`],
        ['mass tools', `${prefix}kickall · ${prefix}disarm`],
        ['tracking', `${prefix}listleft · ${prefix}listkicked`],
        ['stealth + clean', `${prefix}ghostkick · ${prefix}vanish`],
        ['lockdown pack', `${prefix}warzone · ${prefix}ownerzone · ${prefix}slowmode`],
        ['recall + backup', `${prefix}recall · ${prefix}groupbackup`],
        ['owner radar', `${prefix}kicklog on · ${prefix}mention status`],
      ],
      body: `${fonts.smallCaps('full list:')} ${prefix}help shield …\n${ui.footer()}`,
    }));
  },
};
