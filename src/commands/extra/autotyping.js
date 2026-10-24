// XADON AI · autotyping (imported format).
module.exports = {
  name: 'autotyping',
  aliases: ['typing'],
  description: 'Toggle auto-typing presence',
  category: 'extra',
  groupOnly: false,
  ownerOnly: false,
  async execute(sock, m, extra) {
    const { args, reply, ui, db } = extra;
    const a = String(args[0] || '').toLowerCase();
    const cur = !!db.get('autotyping', false);
    const val = /^(on|1|yes)$/.test(a) ? true : /^(off|0|no)$/.test(a) ? false : !cur;
    db.set('autotyping', val);
    if (val) db.set('autorecording', false);
    return reply(ui.notice(val ? 'success' : 'warn', 'Autotyping ' + (val ? 'on' : 'off'), 'Bot shows typing before replies.'));
  },
};
