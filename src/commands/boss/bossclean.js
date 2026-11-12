// BOSSCLEAN · clear recent bot messages + enable autoclean
module.exports = {
  name: 'bossclean', alias: ['bclean'], desc: 'Clean bot clutter', usage: '.bossclean on|off', category: 'boss', owner: true,
  async run({ args, reply, ui, db }) {
    const v = (args[0] || 'on').toLowerCase();
    if (v === 'off') { db.set('autoclean', false); return reply(ui.notice('success', 'Autoclean off', 'Bot messages will stay.')); }
    db.set('autoclean', true);
    return reply(ui.notice('success', 'Boss clean', 'Autoclean ON — bot replies self-delete after 60s. Chat stays neat.'));
  },
};
