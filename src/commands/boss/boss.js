// BOSS · main boss panel (owner only)
module.exports = {
  name: 'boss', alias: ['bossmenu', 'bosshelp'], desc: 'Boss control panel (10 boss commands)', usage: '.boss', category: 'boss', owner: true,
  async run({ reply, ui, prefix }) {
    const rows = [
      ['bossmode', 'public/private + boss-only lockdown'],
      ['bossblast', 'broadcast to all groups'],
      ['bosshide', 'hidden tag-all (boss style)'],
      ['bosskill', 'kick + ban in one shot'],
      ['bosslock', 'lock / unlock group chat'],
      ['bossmute', 'mute group (admins only)'],
      ['bossunmute', 'unmute group'],
      ['bossnick', 'rename bot + bio instantly'],
      ['bossclean', 'delete bot clutter / clear'],
      ['bossstats', 'boss-level stats + health'],
    ];
    return reply(ui.card({ icon: '♛', title: 'Boss panel', subtitle: '10 boss commands', rows, body: `Try ${prefix}bossblast Hello team` }));
  },
};
