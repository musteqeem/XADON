// XADON AI · OWNER — premium unicode card, no emojis.
module.exports = {
  name: 'joingroup',
  alias: ['joinx'],
  desc: 'Join via invite link',
  usage: '.joingroup <link>',
  owner: true, category: 'owner2',
  async run({ sock, args, reply, ui }) {
    const m = String(args[0] || '').match(/(?:chat\.whatsapp\.com\/)([\w-]+)/i);
    if (!m) return reply(ui.notice('info', 'Join group', 'Paste a full invite link.'));
    try { const jid = await sock.groupAcceptInvite(m[1]); return reply(ui.notice('success', 'Joined', String(jid))); }
    catch { return reply(ui.notice('error', 'Join failed', 'That invite is invalid or expired.')); }
  },
};
