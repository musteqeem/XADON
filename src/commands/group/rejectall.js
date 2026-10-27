// XADON V8 · rejectall — reject every pending join request.
module.exports = {
  name: 'rejectall', alias: ['denyall', 'rejectx'], desc: 'Reject all join requests', usage: '.rejectall', group: true, admin: true, botAdmin: true, category: 'group',
  async run({ sock, m, reply, ui }) {
    try {
      const req = await sock.groupRequestParticipantsList(m.chat).catch(() => []);
      if (!req?.length) return reply(ui.notice('info', 'No requests', 'Nobody is waiting to join.'));
      let n = 0;
      for (const r of req) { try { await sock.groupRequestParticipantsUpdate(m.chat, [r.jid || r.id], 'reject'); n++; } catch {} }
      return reply(ui.notice('success', 'Rejected', `${n}/${req.length} request(s) rejected.`));
    } catch { return reply(ui.notice('error', 'Reject failed', 'I need admin rights.')); }
  },
};
