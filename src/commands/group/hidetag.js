module.exports = {
  name: 'hidetag',
  alias: ['htag', 'silenttag'],
  desc: 'Tag everyone silently',
  usage: '.hidetag <message>',
  group: true, admin: true,
  async run({ sock, m, ui, group, text, fail }) {
    const members = group?.participants || (await sock.groupMetadata(m.chat).catch(() => null))?.participants || [];
    if (!members.length) return fail('No members', 'Could not read the member list.');
    const jids = members.map((p) => p.id);
    await sock.sendMessage(m.chat, { text: `${text || ui.fonts.smallCaps('attention everyone')}\n${'󠀠'.repeat(1)}`, mentions: jids }, { quoted: m.raw });
  },
};
