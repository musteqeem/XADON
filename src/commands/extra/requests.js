// XADON AI · requests — pending group join requests (Baileys groupRequestParticipantsList).
module.exports = {
  name: 'requests',
  alias: ['joinreq', 'pendings'],
  desc: 'List pending join requests',
  usage: '.requests',
  group: true, admin: true, category: 'extra',
  async run({ sock, m, reply, ui }) {
    try {
      const list = await sock.groupRequestParticipantsList(m.chat).catch(() => null);
      if (!list || !list.length) return reply(ui.notice('info', 'No requests', 'No pending join requests.'));
      const rows = list.slice(0, 20).map((r, i) => [`#${i + 1}`, '@' + String(r.jid || r).split('@')[0]]);
      return reply(ui.card({ icon: '\u2630', title: 'Join requests', subtitle: `${list.length} pending`, rows }), { mentions: list.map((r) => r.jid).filter(Boolean) });
    } catch { return reply(ui.notice('error', 'Not supported', 'This Baileys build has no join-request API.')); }
  },
};
