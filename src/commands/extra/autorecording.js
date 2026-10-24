// XADON AI · autorecording (imported format).
module.exports = {
  name: 'autorecording',
  aliases: ['autorec'],
  description: 'Toggle auto-recording presence',
  category: 'extra',
  groupOnly: false,
  ownerOnly: false,
  async execute(sock, m, extra) {
    const { args, reply, ui, db } = extra;
    const a = String(args[0] || '').toLowerCase();
    const cur = !!db.get('autorecording', false);
    const val = /^(on|1|yes)$/.test(a) ? true : /^(off|0|no)$/.test(a) ? false : !cur;
    db.set('autorecording', val);
    if (val) db.set('autotyping', false);
    return reply(ui.notice(val ? 'success' : 'warn', 'Autorecording ' + (val ? 'on' : 'off'), 'Bot shows recording before replies.'));
  },
};
