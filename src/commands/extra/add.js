// XADON AI · add — add a member by mention/reply/number (bot must be admin).
module.exports = {
  name: 'add',
  alias: ['adduser', 'addmember'],
  desc: 'Add a member to the group',
  usage: '.add @user | 2348012345678',
  group: true, admin: true, botAdmin: true, category: 'extra',
  async run({ sock, m, args, reply, ui, fail, target }) {
    const jid = target();
    if (!jid) return fail('Who?', 'Mention, reply to, or type the number: .add 2348012345678');
    try {
      const [res] = await sock.groupParticipantsUpdate(m.chat, [jid], 'add');
      if (res?.status === '200' || res?.status === 200) return reply(ui.notice('success', 'Added', `@${jid.split('@')[0]} is in the group now.`));
      return reply(ui.notice('warn', 'Invite instead', `@${jid.split('@')[0]} could not be added directly (privacy settings). Send them the group link.`));
    } catch { return reply(ui.notice('error', 'Add failed', 'WhatsApp refused the add. The user may block unknown-group adds.')); }
  },
};
