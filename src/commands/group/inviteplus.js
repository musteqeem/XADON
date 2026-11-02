/** XADON V9 · inviteplus — group invite link + one-tap reset. */
module.exports = {
  name: 'inviteplus',
  alias: ['glink2', 'gclink2'],
  desc: 'Get or reset the group invite link',
  usage: '.inviteplus | .inviteplus reset',
  category: 'group',
  group: true, admin: true, botAdmin: true,
  async run({ sock, m, args, reply, ui }) {
    const sub = String(args[0] || '').toLowerCase();
    try {
      if (sub === 'reset' || sub === 'revoke' || sub === 'new') {
        await sock.groupRevokeInvite(m.chat);
      }
      const code = await sock.groupInviteCode(m.chat);
      return reply(ui.card({
        icon: '◈', title: sub === 'reset' ? 'Invite reset' : 'Group invite',
        rows: [['link', `https://chat.whatsapp.com/${code}`]],
        body: sub === 'reset' ? 'Old link is dead. Share the new one.' : 'Share it · reset anytime with .inviteplus reset',
      }));
    } catch (e) {
      return reply(ui.notice('error', 'Invite failed', `${String(e.message || e).slice(0, 200)}\nI need admin rights for this.`));
    }
  },
};
