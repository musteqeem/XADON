// XADON AI · GROUP — premium unicode card, no emojis.
module.exports = {
  name: 'listadmins',
  alias: ['adminsx'],
  desc: 'List group admins',
  group: true, category: 'group2',
  async run({ sock, m, reply, ui }) {
    const { fonts } = ui;
    const meta = await sock.groupMetadata(m.chat).catch(() => null);
    if (!meta) return reply(ui.notice('error', 'No metadata', 'Try again.'));
    const admins = meta.participants.filter((p) => p.admin);
    const lines = admins.map((p, i) => `${fonts.mono(String(i + 1).padStart(2, '0'))} ${p.admin === 'superadmin' ? '\u265B' : '\u25C8'} @${p.id.split('@')[0]}`);
    return sock.sendMessage(m.chat, { text: [`\u27D0 ${fonts.bold('GROUP ADMINS')}`, ...lines, '', `${fonts.smallCaps('total')} \u27F6 ${fonts.bold(String(admins.length))}`, '', ui.footer()].join('\n'), mentions: admins.map((p) => p.id) }, { quoted: m.raw });
  },
};
