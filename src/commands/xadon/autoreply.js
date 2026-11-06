/**
 * XADON V9 · autoreply — automatic DM replies while you are away.
 *   .autoreply on I am offline, will reply soon
 *   .autoreply off | status   (runs from the message handler, no prefix needed)
 */
module.exports = {
  name: 'autoreply',
  alias: ['dmreply', 'autodm'],
  desc: 'Auto-reply to DMs while away',
  usage: '.autoreply on <text> | off | status',
  category: 'xadon9',
  owner: true,
  async run({ args, reply, ui, db }) {
    const sub = String(args[0] || '').toLowerCase();
    if (sub === 'on' || sub === 'set') {
      const text = args.slice(1).join(' ').trim();
      if (!text) return reply(ui.notice('info', 'Auto reply', 'Usage: .autoreply on I am offline right now, will reply soon'));
      db.set('autoreply', { on: true, text: text.slice(0, 500) });
      return reply(ui.notice('success', 'Auto-reply on', `Every DM will now get:\n${text.slice(0, 200)}`));
    }
    if (sub === 'off') {
      const cur = db.get('autoreply', {});
      db.set('autoreply', { ...cur, on: false });
      return reply(ui.notice('warn', 'Auto-reply off', 'DMs will no longer get automatic replies.'));
    }
    const cur = db.get('autoreply', {});
    return reply(ui.card({ icon: '◈', title: 'Auto-reply', subtitle: cur.on ? 'ON' : 'OFF', rows: [['message', cur.text || '— not set —']] }));
  },
};
