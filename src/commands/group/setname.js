module.exports = {
  name: 'setname',
  alias: ['subject', 'setsubject', 'gname'],
  desc: 'Change group name',
  usage: '.setname <new name>',
  group: true, admin: true, botAdmin: true,
  async run({ sock, m, args, reply, ui }) {
    const name = args.join(' ').trim();
    if (!name) return reply(ui.notice('info', 'Group name', 'Type the new name after the command.'));
    try { await sock.groupUpdateSubject(m.chat, name.slice(0, 100)); await reply(ui.notice('success', 'Updated', `Group renamed to ${name.slice(0, 60)}.`)); }
    catch { await reply(ui.notice('error', 'Failed', 'I need admin rights to rename the group.')); }
  },
};
