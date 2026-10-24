// XADON AI · autoreact (imported format).
module.exports = {
  name: 'autoreact',
  aliases: ['reactauto'],
  description: 'Auto-react to every message',
  category: 'extra',
  groupOnly: false,
  ownerOnly: false,
  async execute(sock, m, extra) {
    const { args, reply, ui, db } = extra;
    const t = args.join(' ').trim();
    if (!t || /^off$/i.test(t)) { db.set('autoreact', null); return reply(ui.notice('warn', 'Autoreact off', 'Bot will not auto-react.')); }
    db.set('autoreact', t.slice(0, 8));
    return reply(ui.notice('success', 'Autoreact on', `Reacting with ${t.slice(0, 8)} to every command.`));
  },
};
