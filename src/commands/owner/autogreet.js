// XADON V10 · AUTO — Auto-reply to greetings in private chats.
module.exports = {
  name: 'autogreet',
  alias: ['autohello'],
  desc: 'Auto-reply to greetings in private chats',
  usage: '.autogreet on|off',
  owner: true, category: 'owner',
  async run({ args, reply, ui, db }) {
    const a = String(args[0] || '').toLowerCase();
    const cur = !!db.get('autogreet', false);
    const val = /^(on|1|yes)$/.test(a) ? true : /^(off|0|no)$/.test(a) ? false : !cur;
    db.set('autogreet', val);
    return reply(ui.notice(val ? 'success' : 'warn', `Auto-greet ${val ? 'on' : 'off'}`, 'Auto-reply to greetings in private chats.'));
  },
};
