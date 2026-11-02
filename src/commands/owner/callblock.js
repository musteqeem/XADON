/**
 * XADON V9 · callblock — auto-reject incoming calls (enforced in connection.js).
 *   .callblock on | off | status
 */
module.exports = {
  name: 'callblock',
  alias: ['blockcalls', 'rejectcalls', 'nocalls'],
  desc: 'Auto-reject all incoming calls',
  usage: '.callblock on | off | status',
  category: 'owner',
  owner: true,
  async run({ args, reply, ui, db }) {
    const sub = String(args[0] || '').toLowerCase();
    if (sub === 'on' || sub === 'enable') {
      db.set('callblock', true);
      return reply(ui.notice('success', 'Call block on', 'Every incoming call will be auto-rejected from now on.'));
    }
    if (sub === 'off' || sub === 'disable') {
      db.set('callblock', false);
      return reply(ui.notice('warn', 'Call block off', 'Calls will ring normally again.'));
    }
    return reply(ui.card({ icon: '◈', title: 'Call block', subtitle: db.get('callblock', false) ? 'ON — calls rejected' : 'OFF — calls ring', rows: [['toggle', '.callblock on · off']] }));
  },
};
