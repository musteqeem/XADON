// XADON V7 · delreply — remove a custom reply
const fmt = require('../../lib/format');
module.exports = {
  name: 'delreply', alias: ['delcustom', 'resetreply'], desc: 'Remove a custom command reply', usage: '.delreply ping', category: 'owner', owner: true,
  async run({ args, reply, ui }) {
    const sub = String(args[0] || '').toLowerCase();
    if (!sub) return reply(ui.notice('info', 'Del reply', 'Usage: .delreply ping'));
    fmt.delCustom(sub);
    return reply(ui.notice('success', 'Custom reply removed', `${sub} is back to default.`));
  },
};
