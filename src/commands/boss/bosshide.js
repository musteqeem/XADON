// BOSSHIDE · hidden tag-all with boss header
module.exports = {
  name: 'bosshide', alias: ['bhide'], desc: 'Hidden tag all members', usage: '.bosshide <message>', category: 'boss', group: true, admin: true,
  async run({ text, reply, ui, sock, m, group, fail }) {
    const members = (group?.participants || []).map((p) => p.id).filter(Boolean);
    if (!members.length) return fail('Empty', 'No members found.');
    await sock.sendMessage(m.chat, { text: `♛ BOSS: ${(text || 'Read this now').slice(0, 1000)}`, mentions: members }, { quoted: m.raw });
  },
};
