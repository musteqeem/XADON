/**
 * XADON V9 · busymode — when ON, anyone who tags the owner gets your busy note.
 * Works together with .mention (mention replies first, busy covers the rest).
 *   .busymode on In a meeting, back by 6pm  |  .busymode off | status
 */
module.exports = {
  name: 'busymode',
  alias: ['busy', 'dndmode'],
  desc: 'Busy auto-notice for owner tags',
  usage: '.busymode on [reason] | off | status',
  category: 'xadon9',
  owner: true,
  async run({ args, reply, ui, db, prefix }) {
    const sub = String(args[0] || '').toLowerCase();
    if (sub === 'on' || sub === 'enable') {
      const reason = args.slice(1).join(' ').trim() || 'The owner is busy right now.';
      db.set('busy', { on: true, reason: reason.slice(0, 300) });
      return reply(ui.notice('success', 'Busy mode on', `Anyone who tags you will hear:\n${reason.slice(0, 200)}`));
    }
    if (sub === 'off' || sub === 'disable') {
      db.set('busy', { on: false, reason: db.get('busy', {}).reason || '' });
      return reply(ui.notice('warn', 'Busy mode off', 'Tags will no longer get the busy notice.'));
    }
    const cur = db.get('busy', {});
    return reply(ui.card({ icon: '◈', title: 'Busy mode', subtitle: cur.on ? 'ON' : 'OFF', rows: [['notice', cur.reason || '— not set —'], ['toggle', `${prefix}busymode on <reason> · off`]] }));
  },
};
