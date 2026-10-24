// XADON AI · tagadmins — mention only group admins.
module.exports = {
  name: 'tagadmins',
  alias: ['admins', 'admintag'],
  desc: 'Mention all group admins',
  usage: '.tagadmins [message]',
  group: true, category: 'extra',
  async run({ sock, m, text, reply, ui }) {
    const meta = await sock.groupMetadata(m.chat).catch(() => null);
    if (!meta) return reply(ui.notice('error', 'No metadata', 'Could not fetch group info.'));
    const admins = (meta.participants || []).filter((p) => p.admin).map((p) => p.id || p.jid).filter(Boolean);
    if (!admins.length) return reply(ui.notice('info', 'No admins', 'No admin records found.'));
    const body = `${ui.fonts.bold('ADMINS')} ${(text || '').slice(0, 300)}\n` + admins.map((j) => '@' + j.split('@')[0]).join(' ');
    await sock.sendMessage(m.chat, { text: body + `\n\n${ui.footer()}`, mentions: admins }, { quoted: m.raw });
  },
};
