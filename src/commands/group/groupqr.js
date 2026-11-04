// XADON V8 · groupqr — group invite link + QR image.
module.exports = {
  name: 'groupqr', alias: ['gcqr', 'gclinkx', 'qrinvite'], desc: 'Group invite link + QR', usage: '.groupqr', group: true, admin: true, category: 'group',
  async run({ sock, m, reply, ui }) {
    let code = null;
    try { code = await sock.groupInviteCode(m.chat); } catch { return reply(ui.notice('error', 'No link', 'I need admin rights to read the invite link.')); }
    const link = `https://chat.whatsapp.com/${code}`;
    const qr = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(link)}`;
    try { await sock.sendMessage(m.chat, { image: { url: qr }, caption: `◈ ${ui.fonts.bold('GROUP INVITE')}\n${link}\n\n${ui.footer()}` }, { quoted: m.raw }); }
    catch { return reply(`◈ GROUP INVITE\n${link}`); }
  },
};
