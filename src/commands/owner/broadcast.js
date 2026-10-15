module.exports = {
  name: 'broadcast',
  alias: ['bc', 'announce'],
  desc: 'Owner broadcast note',
  usage: '.broadcast <message> (forwards manually)',
  owner: true,
  async run({ text, reply, ui }) {
    if (!text) return reply(ui.notice('info', 'Broadcast', 'Type the announcement after the command, then forward it.'));
    await reply([`⟡ ${ui.fonts.bold('BROADCAST DRAFT')}`, '', text.slice(0, 1500), '', ui.DOTS, ui.fonts.smallCaps('copy and forward this to your chats'), ui.footer()].join('\n'));
  },
};
