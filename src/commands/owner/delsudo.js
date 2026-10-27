// XADON V8 · delsudo — revoke near-owner access.
const privs = require('../../lib/privs');
module.exports = {
  name: 'delsudo',
  alias: ['remsudo', 'delsudos', 'unsudo'],
  desc: 'Revoke near-owner access',
  usage: '.delsudo @user | reply with .delsudo | .delsudo 2348000000000',
  category: 'owner', owner: true,
  async run({ m, args, reply, ui, db }) {
    const num = privs.parseTarget(args, m);
    if (!num) return reply(ui.notice('info', 'Del sudo', 'Mention someone, reply to them, or type the number.\nUsage: .delsudo @user'));
    const r = privs.delEntry(db, 'sudos', num);
    if (!r.removed) return reply(ui.notice('warn', 'Not sudo', `@${num} is not on the sudo list.`));
    return reply(ui.notice('success', 'Sudo revoked', `@${num} lost near-owner access.`));
  },
};
