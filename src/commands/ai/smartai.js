/**
 * XADON V9 · smartai — auto AI replies (chatbot power switch).
 * When ON the bot answers on its own: group tags/replies + every DM.
 *   .smartai on | off | status
 */
module.exports = {
  name: 'smartai',
  alias: ['autochat', 'aiauto', 'botbrain'],
  desc: 'Auto AI replies when tagged or in DMs',
  usage: '.smartai on | off | status',
  category: 'ai',
  owner: true,
  async run({ args, reply, ui, db }) {
    const sub = String(args[0] || '').toLowerCase();
    if (sub === 'on' || sub === 'enable') {
      db.set('smartai', { on: true });
      return reply(ui.notice('success', 'Smart AI on', 'I will now reply with AI whenever someone tags me, replies to me, or chats me privately.'));
    }
    if (sub === 'off' || sub === 'disable') {
      db.set('smartai', { on: false });
      return reply(ui.notice('warn', 'Smart AI off', 'Auto AI replies disabled. .ai and .chatbot still work manually.'));
    }
    const on = !!db.get('smartai', {}).on;
    return reply(ui.card({ icon: '◈', title: 'Smart AI', subtitle: on ? 'ON — auto replies live' : 'OFF', rows: [['trigger', 'tag / reply / private dm'], ['toggle', '.smartai on · off']] }));
  },
};
