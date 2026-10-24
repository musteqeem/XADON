// XADON AI · autobio (imported format).
module.exports = {
  name: 'autobio',
  aliases: ['bioauto'],
  description: 'Toggle auto-bio time updater flag',
  category: 'extra',
  groupOnly: false,
  ownerOnly: false,
  async execute(sock, m, extra) {
    const { args, reply, ui, db } = extra;
    const a = String(args[0] || '').toLowerCase();
    const cur = !!db.get('autobio', false);
    const val = /^(on|1|yes)$/.test(a) ? true : /^(off|0|no)$/.test(a) ? false : !cur;
    db.set('autobio', val);
    try {
      if (val) { const s = require('../../lib/msgstore'); void s; await sock.updateProfileStatus(`XADON AI | ${new Date().toLocaleTimeString('en-GB')} `).catch(() => {}); }
    } catch {}
    return reply(ui.notice(val ? 'success' : 'warn', 'Autobio ' + (val ? 'on' : 'off'), 'Bot about updates with the time while on.'));
  },
};
