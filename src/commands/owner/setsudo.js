// XADON V8 · setsudo — grant NEAR-owner access (works even in private mode, no owner cmds).
const privs = require('../../lib/privs');
module.exports = {
  name: 'setsudo',
  alias: ['addsudo', 'sudoadd'],
  desc: 'Grant near-owner access (bypasses private mode)',
  usage: '.setsudo @user | reply with .setsudo | .setsudo 2348000000000',
  category: 'owner', owner: true,
  async run({ m, args, reply, ui, db }) {
    const num = privs.parseTarget(args, m);
    if (!num) return reply(ui.notice('info', 'Set sudo', 'Mention someone, reply to them, or type the number.\nUsage: .setsudo @user'));
    const r = privs.addUnique(db, 'sudos', num);
    if (r.reason === 'exists') return reply(ui.notice('warn', 'Already sudo', `@${num} already has near-owner access.`));
    if (!r.ok) return reply(ui.notice('error', 'Bad number', 'Supply a valid 7–15 digit number.'));
    return reply(ui.notice('success', 'Sudo granted', `@${num} now has NEAR-owner access:\n- bypasses private mode, cooldown and disabled commands\n- can use admin/group commands\n- CANNOT use owner-only commands (ask for .setmod for that)\n\nManage: .listsudo · .delsudo`));
  },
};
