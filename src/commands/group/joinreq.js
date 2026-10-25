// XADON V7 · joinreq — list / approve / decline pending join requests.
module.exports = {
  name: 'joinreq', alias: ['requests', 'pendingreq'], desc: 'Manage pending join requests', usage: '.joinreq | .joinreq approve | .joinreq decline', category: 'group', group: true, admin: true, botAdmin: true,
  async run({ sock, m, args, reply, ui }) {
    try {
      const req = await sock.groupRequestParticipantsList(m.chat).catch(() => []);
      const sub = String(args[0] || '').toLowerCase();
      if (sub === 'approve' || sub === 'decline') {
        if (!req?.length) return reply(ui.notice('info', 'No requests', 'Nobody is waiting.'));
        const action = sub === 'approve' ? 'approve' : 'reject';
        for (const r of req) await sock.groupRequestParticipantsUpdate(m.chat, [r.jid || r.id], action).catch(() => {});
        return reply(ui.notice('success', sub === 'approve' ? 'Approved' : 'Declined', `${req.length} request(s) ${sub}d.`));
      }
      if (!req?.length) return reply(ui.notice('info', 'No requests', 'Nobody is waiting to join.'));
      const body = req.slice(0, 30).map((r, i) => `${i + 1}. @${String(r.jid || r.id).split('@')[0]}`).join('\n');
      return reply(ui.card({ icon: '\u2698', title: `Join requests (${req.length})`, subtitle: '.joinreq approve | .joinreq decline', rows: [], body }));
    } catch { return reply(ui.notice('error', 'Requests failed', 'I need admin rights, or this runtime lacks request APIs.')); }
  },
};
