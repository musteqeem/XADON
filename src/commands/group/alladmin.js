// XADON V8 · alladmin — give every group admin access to admin commands (incl. private-mode bypass).
const { savePolicy, groupPolicy } = require('../../message-handler');
module.exports = {
  name: 'alladmin',
  alias: ['alladmins', 'adminall', 'adminmode'],
  desc: 'Let all group admins use admin commands (on|off)',
  usage: '.alladmin on | .alladmin off',
  group: true, admin: true, category: 'group',
  async run({ m, args, reply, ui, sock }) {
    const cur = !!groupPolicy(m.chat)?.alladmin;
    const a = String(args[0] || '').toLowerCase();
    let val;
    if (/^(on|enable|yes|1)$/.test(a)) val = true;
    else if (/^(off|disable|no|0)$/.test(a)) val = false;
    else val = !cur;
    const meta = await sock.groupMetadata(m.chat).catch(() => null);
    savePolicy(m.chat, { alladmin: val, groupName: meta?.subject || 'the group' });
    return reply(ui.notice(val ? 'success' : 'warn', `All-admin ${val ? 'ENABLED' : 'DISABLED'}`,
      val
        ? 'Every group admin can now use admin commands here, and bypasses PRIVATE mode inside this group.\nOwner-only commands still need sudo/mod/owner.\nDisable: .alladmin off'
        : 'Group admins keep their normal admin rights, but no longer bypass private mode.\nEnable: .alladmin on'));
  },
};
