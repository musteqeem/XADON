// XADON AI · GROUP — premium unicode card, no emojis.
module.exports = {
  name: 'approveall',
  alias: ['approvex'],
  desc: 'Approve join requests',
  group: true, admin: true, botAdmin: true, category: 'group2',
  async run({ sock, m, reply, ui }) {
    try {
      const req = await sock.groupRequestParticipantsList(m.chat).catch(() => []);
      if (!req?.length) return reply(ui.notice('info', 'No requests', 'Nobody is waiting to join.'));
      for (const r of req) await sock.groupRequestParticipantsUpdate(m.chat, [r.jid || r.id], 'approve').catch(() => {});
      return reply(ui.notice('success', 'Approved', `${req.length} request(s) approved.`));
    } catch { return reply(ui.notice('error', 'Approve failed', 'I need admin rights.')); }
  },
};
