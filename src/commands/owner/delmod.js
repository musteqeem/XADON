// XADON V8 · delmod — revoke full owner access (hard-owner only).
const privs = require('../../lib/privs');
module.exports = {
  name: 'delmod',
  alias: ['remmod', 'delmods', 'unmod'],
  desc: 'Revoke FULL owner access (hard-owner only)',
  usage: '.delmod @user | reply with .delmod | .delmod 2348000000000',
  category: 'owner', owner: true,
  async run({ m, args, reply, ui, db, isHardOwner }) {
    if (!isHardOwner) return reply(ui.notice('error', 'Hard-owner only', 'Only the config owner can revoke mod access.'));
    const num = privs.parseTarget(args, m);
    if (!num) return reply(ui.notice('info', 'Del mod', 'Mention someone, reply to them, or type the number.\nUsage: .delmod @user'));
    const r = privs.delEntry(db, 'mods', num);
    if (!r.removed) return reply(ui.notice('warn', 'Not mod', `@${num} is not on the mod list.`));
    return reply(ui.notice('success', 'Mod revoked', `@${num} lost FULL owner access.`));
  },
};
