// XADON V10 · AUTO — mirror an armed chat to your DM (forwarded copies).
module.exports = {
  name: 'autofwd',
  alias: ['automirror', 'mirrorchat'],
  desc: 'Mirror this chat to your DM',
  usage: '.autofwd on|off (run inside the chat to mirror)',
  owner: true, category: 'owner',
  async run({ args, m, reply, ui, db }) {
    const a = String(args[0] || '').toLowerCase();
    const key = `autofwd:${m.chat}`;
    const cur = !!db.get(key, false);
    const val = /^(on|1|yes)$/.test(a) ? true : /^(off|0|no)$/.test(a) ? false : !cur;
    db.set(key, val);
    return reply(ui.notice(val ? 'success' : 'warn', `Mirror ${val ? 'on' : 'off'}`, val ? 'Every new message here will be forwarded to your DM.' : 'This chat is no longer mirrored.'));
  },
};
