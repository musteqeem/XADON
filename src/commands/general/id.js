module.exports = {
  name: 'id',
  alias: ['jid', 'me', 'whoami'],
  desc: 'Show chat and user IDs',
  async run({ sock, m, reply, ui, target }) {
    const { fonts } = ui;
    const t = target();
    const text = ui.card({
      icon: '◍',
      title: 'Identity',
      subtitle: 'chat and user ids',
      rows: [
        ['you', fonts.mono(m.sender)],
        ['chat', fonts.mono(m.chat)],
        ['group', m.isGroup ? fonts.bold('yes') : fonts.smallCaps('no')],
        ['target', fonts.mono(t || 'none')],
        ['name', fonts.bold(m.pushName || 'User')],
      ],
      body: t ? `${fonts.smallCaps('number')} ⟶ ${fonts.mono(`+${t.split('@')[0]}`)}` : fonts.smallCaps('mention or reply to inspect someone'),
    });
    await reply(text);
  },
};
