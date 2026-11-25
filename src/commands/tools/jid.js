/** XADON AI · jid — resolve chat / invite / number to JID with a tap-to-copy button. */
const { sendCopyCard } = require('../../lib/rich');

module.exports = {
  name: 'jid',
  alias: ['getjid', 'chatid'],
  desc: 'Resolve a JID with tap-to-copy button',
  usage: '.jid  ·  .jid <number>  ·  .jid <invite link>',
  category: 'tools',
  async run({ sock, m, args, reply, ui }) {
    let jid = '';
    try {
      if (!args[0]) {
        jid = m.chat;
      } else if (args[0].includes('chat.whatsapp.com')) {
        const code = args[0].split('chat.whatsapp.com/')[1].split('?')[0];
        const info = await sock.groupGetInviteInfo(code);
        jid = info.id;
      } else {
        let number = String(args[0]).replace(/[^0-9]/g, '');
        if (number.startsWith('0')) number = number.substring(1);
        if (!number) throw new Error('bad number');
        jid = `${number}@s.whatsapp.net`;
      }
    } catch { return reply(ui.notice('error', 'JID', 'Could not resolve that. Send .jid, .jid 2348012345678 or a group invite link.')); }
    try {
      await sendCopyCard(sock, m.chat, { text: `◈ JID ⟶\n${jid}`, copyText: jid, footer: ui.footer(), quoted: m.raw });
    } catch { await reply(`${jid}`); }
  },
};
