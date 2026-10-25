// XADON V7 · gslist — list groups (for status targeting).
module.exports = {
  name: 'gslist', alias: ['mygroups', 'listgc'], desc: 'List groups the bot is in', usage: '.gslist', category: 'group', group: false, admin: false,
  async run({ sock, reply, ui }) {
    try {
      const groups = await sock.groupFetchAllParticipating().catch(() => ({}));
      const ids = Object.keys(groups || {});
      if (!ids.length) return reply(ui.notice('info', 'No groups', 'The bot is not in any group.'));
      const body = ids.slice(0, 25).map((id, i) => `${i + 1}. ${(groups[id]?.subject || 'Group').slice(0, 40)}\n   ${id}`).join('\n');
      return reply(ui.card({ icon: '\u2756', title: `Groups (${ids.length})`, subtitle: 'status targeting', rows: [], body: body + (ids.length > 25 ? `\n… and ${ids.length - 25} more` : '') }));
    } catch (e) { return reply(ui.notice('error', 'List failed', String(e.message || e).slice(0, 200))); }
  },
};
