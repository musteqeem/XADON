// XADON AI · autosticker (imported format).
module.exports = {
  name: 'autosticker',
  aliases: ['stickauto'],
  description: 'Auto-convert images to stickers',
  category: 'extra',
  groupOnly: true,
  ownerOnly: false,
  async execute(sock, m, extra) {
    const { args, reply, ui, db } = extra;
    const a = String(args[0] || '').toLowerCase();
    const key = `autosticker:${m.chat}`;
    const cur = db.get(key, db.get('autosticker', false));
    const val = /^(on|1|yes)$/.test(a) ? true : /^(off|0|no)$/.test(a) ? false : !cur;
    db.set(key, val);
    return reply(ui.notice(val ? 'success' : 'warn', 'Autosticker ' + (val ? 'on' : 'off'), 'Every image here becomes a sticker while on.'));
  },
};
