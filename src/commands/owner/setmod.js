// XADON V8 · setmod — grant FULL owner access (hard-owner only can grant).
const privs = require('../../lib/privs');
module.exports = {
  name: 'setmod',
  alias: ['addmod', 'modadd'],
  desc: 'Grant FULL owner access (hard-owner only)',
  usage: '.setmod @user | reply with .setmod | .setmod 2348000000000',
  category: 'owner', owner: true,
  async run({ m, args, reply, ui, db, isHardOwner }) {
    if (!isHardOwner) return reply(ui.notice('error', 'Hard-owner only', 'Only the config owner can grant mod (full owner) access.'));
    const num = privs.parseTarget(args, m);
    if (!num) return reply(ui.notice('info', 'Set mod', 'Mention someone, reply to them, or type the number.\nUsage: .setmod @user'));
    const r = privs.addUnique(db, 'mods', num);
    if (r.reason === 'exists') return reply(ui.notice('warn', 'Already mod', `@${num} already has FULL owner access.`));
    if (!r.ok) return reply(ui.notice('error', 'Bad number', 'Supply a valid 7–15 digit number.'));
    return reply(ui.notice('success', 'Mod granted', `@${num} now has FULL owner access:\n- passes every owner-only check\n- bypasses private mode, cooldown and disabled commands\n- can manage sudos (.setsudo/.delsudo)\n\nManage: .listmod · .delmod`));
  },
};
