module.exports = {
  name: 'setdesc',
  alias: ['description', 'setdescription'],
  desc: 'Change group description',
  usage: '.setdesc <new description>',
  group: true, admin: true, botAdmin: true,
  async run({ sock, m, args, reply, ui }) {
    const desc = args.join(' ').trim();
    if (!desc) return reply(ui.notice('info', 'Description', 'Type the new description after the command.'));
    try { await sock.groupUpdateDescription(m.chat, desc.slice(0, 500)); await reply(ui.notice('success', 'Updated', 'Group description changed.')); }
    catch { await reply(ui.notice('error', 'Failed', 'I need admin rights to change the description.')); }
  },
};
