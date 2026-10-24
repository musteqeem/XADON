// XADON AI · listgroups (imported format).
module.exports = {
  name: 'listgroups',
  aliases: ['groups', 'mygroups'],
  description: 'List groups the bot is in',
  category: 'extra',
  groupOnly: false,
  ownerOnly: true,
  async execute(sock, m, extra) {
    const { reply, ui } = extra;
    try {
      const all = await sock.groupFetchAllParticipating().catch(() => null);
      const list = all ? Object.values(all) : [];
      if (!list.length) return reply(ui.notice('info', 'No groups', 'Bot is not in any group (or this build hides the list).'));
      const rows = list.slice(0, 20).map((g) => [(g.subject || 'group').slice(0, 24), `${(g.participants || []).length} members`]);
      return reply(ui.card({ icon: '\u2630', title: 'My groups', subtitle: `${list.length} groups`, rows }));
    } catch { return reply(ui.notice('error', 'Failed', 'Could not fetch group list.')); }
  },
};
