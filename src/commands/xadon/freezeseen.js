/**
 * XADON V9 · freezeseen — freeze "last seen" (stay offline-looking).
 * When ON the bot sends unavailable presence so your last-seen never updates.
 *   .freezeseen on | off | status
 */
module.exports = {
  name: 'freezeseen',
  alias: ['stayoffline', 'ghostmode'],
  desc: 'Freeze last-seen / stay offline-looking',
  usage: '.freezeseen on | off | status',
  category: 'xadon9',
  owner: true,
  async run({ sock, args, reply, ui, db }) {
    const sub = String(args[0] || '').toLowerCase();
    if (sub === 'on' || sub === 'enable') {
      db.set('freezeseen', true);
      try { await sock.sendPresenceUpdate('unavailable'); } catch {}
      return reply(ui.notice('success', 'Last-seen frozen', 'Your last-seen will not update while this is on.'));
    }
    if (sub === 'off' || sub === 'disable') {
      db.set('freezeseen', false);
      try { await sock.sendPresenceUpdate('available'); } catch {}
      return reply(ui.notice('warn', 'Last-seen live', 'Your presence is normal again.'));
    }
    return reply(ui.card({ icon: '◈', title: 'Freeze seen', subtitle: db.get('freezeseen', false) ? 'ON — frozen' : 'OFF — normal', rows: [['toggle', '.freezeseen on · off']] }));
  },
};
