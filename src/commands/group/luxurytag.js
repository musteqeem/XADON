// XADON V11 · PREMIUM — luxurytag: rich styled mass-tag.
// Fancy header card + chunked hidden mentions (30 per message).
// Usage: .luxurytag [message]
module.exports = {
  name: 'luxurytag',
  alias: ['ptag', 'richtag', 'fancytag'],
  desc: 'Premium styled tag-all',
  usage: '.luxurytag movie night 8pm',
  group: true, admin: true, category: 'group',
  async run({ sock, m, args, reply, ui, group }) {
    const meta = group || await sock.groupMetadata(m.chat).catch(() => null);
    const members = (meta?.participants || []).map((p) => p.id).filter(Boolean);
    if (!members.length) return reply(ui.notice('error', 'Empty', 'Could not read members.'));
    const msg = args.join(' ').slice(0, 300) || 'Attention everyone';
    const { fonts } = ui;
    const head = `◆ ${fonts.bold('L U X U R Y   C A L L')}\n${'─'.repeat(22)}\n${fonts.italic(msg)}\n${'─'.repeat(22)}\n${fonts.smallCaps(`${members.length} members summoned by ${m.pushName || 'admin'}`)}\n\n${ui.footer()}`;
    for (let i = 0; i < members.length; i += 30) {
      const chunk = members.slice(i, i + 30);
      const tagged = i === 0 ? `${head}\n${chunk.map((j) => `◦ @${j.split('@')[0].split(':')[0]}`).join('\n')}` : chunk.map((j) => `◦ @${j.split('@')[0].split(':')[0]}`).join('\n');
      await sock.sendMessage(m.chat, { text: tagged, mentions: chunk }).catch(() => {});
      if (i + 30 < members.length) await new Promise((r) => setTimeout(r, 900));
    }
  },
};
